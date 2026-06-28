import { useReducer, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ApiKeyInput from './components/ApiKeyInput';
import ExerciseGenerator from './components/ExerciseGenerator';
import SchemaContextPanel from './components/SchemaContextPanel';
import QuestionCard from './components/QuestionCard';
import AnswerChecker from './components/AnswerChecker';
import FeedbackPanel from './components/FeedbackPanel';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDeepSeek } from './hooks/useDeepSeek';
import { createExercisePlan } from './utils/exercisePlanner';
import { buildGenerationPrompt, buildCheckingPrompt } from './utils/prompts';
import { buildGradingContext } from './utils/gradingContext';
import { SCHEMA_SETS_BY_ID } from './data/schemaPool';

/* ---------- reducer ---------- */
const initialState = {
  step: 1,
  questionTypes: ['DDL', 'DML', 'relational_algebra'],
  questionCount: 3,
  difficultyMode: 'mixed',
  userPrompt: '',
  plan: null,
  exercises: [],
  sessionSchemaContext: null,
  answers: {},
  feedbacks: [],
  activeTextareaId: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PREFS':
      return {
        ...state,
        questionTypes: action.payload.types,
        questionCount: action.payload.count,
      };
    case 'SET_DIFFICULTY':
      return { ...state, difficultyMode: action.payload };
    case 'SET_USER_PROMPT':
      return { ...state, userPrompt: action.payload };
    case 'GENERATE_START':
      return {
        ...state,
        exercises: [],
        answers: {},
        feedbacks: [],
        activeTextareaId: null,
        sessionSchemaContext: null,
        plan: action.payload.plan,
      };
    case 'GENERATE_SUCCESS':
      return {
        ...state,
        exercises: action.payload.exercises,
        sessionSchemaContext: action.payload.sessionSchemaContext,
        step: 3,
      };
    case 'SET_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.payload.id]: action.payload.value },
      };
    case 'SET_ACTIVE_TEXTAREA':
      return { ...state, activeTextareaId: action.payload };
    case 'CHECK_START':
      return { ...state, feedbacks: [] };
    case 'CHECK_SUCCESS':
      return { ...state, feedbacks: action.payload, step: 4 };
    case 'GO_TO_STEP':
      return { ...state, step: action.payload };
    default:
      return state;
  }
}

/* ---------- App ---------- */
export default function App() {
  const [apiKey, setApiKey] = useLocalStorage('deepseek_api_key', '');
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    generateExercises,
    checkAnswers,
    generateLoading,
    generateError,
    checkLoading,
    checkError,
    clearErrors,
  } = useDeepSeek(apiKey);

  /* 刷新/关闭前提醒 */
  useEffect(() => {
    const hasAnswers = Object.values(state.answers).some((a) => a?.trim());
    if (!hasAnswers) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state.answers]);

  /* --- handlers --- */
  const handleGenerate = useCallback(async () => {
    if (!apiKey) return;
    // 1. 创建出题计划
    const plan = createExercisePlan(
      state.questionTypes,
      state.questionCount,
      state.difficultyMode,
      state.userPrompt
    );

    // 2. 构建表池上下文
    const schemaPoolContext = {};
    for (const sid of plan.selectedSchemaSets) {
      if (SCHEMA_SETS_BY_ID[sid]) {
        schemaPoolContext[sid] = SCHEMA_SETS_BY_ID[sid];
      }
    }

    // 3. 构建生成 prompt
    const messages = buildGenerationPrompt(plan, schemaPoolContext);

    dispatch({ type: 'GENERATE_START', payload: { plan } });
    clearErrors();

    try {
      const result = await generateExercises({ ...plan, messages });
      if (result) {
        dispatch({
          type: 'GENERATE_SUCCESS',
          payload: {
            exercises: result.exercises,
            sessionSchemaContext: result.sessionSchemaContext,
          },
        });
        if (result.validationWarnings) {
          console.warn('生成结果有结构警告:', result.validationWarnings);
        }
      }
    } catch {
      // 错误已由 useDeepSeek 处理
    }
  }, [
    apiKey,
    state.questionTypes,
    state.questionCount,
    state.difficultyMode,
    state.userPrompt,
    generateExercises,
    clearErrors,
  ]);

  const handleCheck = useCallback(async () => {
    if (!apiKey) return;
    dispatch({ type: 'CHECK_START' });
    clearErrors();

    try {
      // 构建批改上下文
      const gradingContext = buildGradingContext(
        state.exercises,
        state.answers,
        state.sessionSchemaContext
      );
      const messages = buildCheckingPrompt(gradingContext);
      const results = await checkAnswers(messages);
      if (results) {
        dispatch({ type: 'CHECK_SUCCESS', payload: results });
      }
    } catch {
      // 错误已由 useDeepSeek 处理
    }
  }, [apiKey, state.exercises, state.answers, state.sessionSchemaContext, checkAnswers, clearErrors]);

  const handleNewExercise = useCallback(() => {
    dispatch({ type: 'GO_TO_STEP', payload: 2 });
  }, []);

  const hasAnyAnswer = Object.values(state.answers).some((a) => a?.trim());
  const apiKeyReady = !!apiKey;

  // 是否需要展示 schema panel
  const shouldShowSchemaPanel =
    state.exercises.length > 0 &&
    (state.sessionSchemaContext ||
      state.exercises.some((ex) => ex.requires_schema_panel !== false));

  return (
    <div className="app-container">
      <Header step={state.step} />

      <main className="main-content">
        {/* Step 1: API Key */}
        <section className={`step-section ${state.step >= 1 ? 'visible' : ''}`}>
          <ApiKeyInput
            apiKey={apiKey}
            onSave={setApiKey}
            onNext={apiKeyReady ? () => dispatch({ type: 'GO_TO_STEP', payload: 2 }) : undefined}
          />
        </section>

        {/* Step 2: Generator */}
        <section className={`step-section ${state.step >= 2 && apiKeyReady ? 'visible' : ''}`}>
          {!apiKeyReady && state.step >= 2 && (
            <p className="hint" style={{ color: 'var(--color-error)' }}>
              请先在上方配置 API Key。
            </p>
          )}
          {apiKeyReady && (
            <ExerciseGenerator
              questionTypes={state.questionTypes}
              questionCount={state.questionCount}
              difficultyMode={state.difficultyMode}
              userPrompt={state.userPrompt}
              onTypesChange={(types) =>
                dispatch({ type: 'SET_PREFS', payload: { types, count: state.questionCount } })
              }
              onCountChange={(count) =>
                dispatch({ type: 'SET_PREFS', payload: { types: state.questionTypes, count } })
              }
              onDifficultyChange={(mode) =>
                dispatch({ type: 'SET_DIFFICULTY', payload: mode })
              }
              onUserPromptChange={(prompt) =>
                dispatch({ type: 'SET_USER_PROMPT', payload: prompt })
              }
              onGenerate={handleGenerate}
              loading={generateLoading}
              disabled={!apiKeyReady}
            />
          )}
          {generateLoading && <LoadingSpinner message="正在生成练习题..." />}
          {generateError && <ErrorMessage message={generateError} onRetry={handleGenerate} />}
        </section>

        {/* Step 3: Answer */}
        {state.step >= 3 && state.exercises.length > 0 && (
          <section className="step-section visible">
            <h2>作答</h2>

            <SchemaContextPanel
              sessionSchemaContext={state.sessionSchemaContext}
              visible={shouldShowSchemaPanel}
            />

            {state.exercises.map((ex) => (
              <QuestionCard
                key={ex.id}
                exercise={ex}
                answer={state.answers[ex.id] ?? ''}
                onAnswerChange={(id, value) =>
                  dispatch({ type: 'SET_ANSWER', payload: { id, value } })
                }
                onFocus={(id) => dispatch({ type: 'SET_ACTIVE_TEXTAREA', payload: id })}
                isActive={state.activeTextareaId === ex.id}
                feedback={null}
                disabled={checkLoading}
              />
            ))}
            <AnswerChecker
              onCheck={handleCheck}
              loading={checkLoading}
              disabled={!apiKeyReady || checkLoading}
              hasAnswers={hasAnyAnswer}
            />
            {checkLoading && <LoadingSpinner message="正在批改答案..." />}
            {checkError && <ErrorMessage message={checkError} onRetry={handleCheck} />}
          </section>
        )}

        {/* Step 4: Feedback */}
        {state.step >= 4 && state.feedbacks.length > 0 && (
          <section className="step-section visible">
            <FeedbackPanel
              exercises={state.exercises}
              answers={state.answers}
              feedbacks={state.feedbacks}
              onNewExercise={handleNewExercise}
            />
          </section>
        )}
      </main>
    </div>
  );
}
