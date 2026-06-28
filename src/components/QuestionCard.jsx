import { useRef, useCallback, useEffect } from 'react';
import SymbolToolbar from './SymbolToolbar';

const TYPE_LABELS = {
  DDL: 'DDL',
  DML: 'DML',
  relational_algebra: '关系代数',
};

const DIFFICULTY_LABELS = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export default function QuestionCard({
  exercise,
  answer,
  onAnswerChange,
  onFocus,
  isActive,
  feedback,
  disabled,
}) {
  const textareaRef = useRef(null);
  const pendingCursorRef = useRef(null);

  const handleSymbolInsert = useCallback(
    (symbol) => {
      const el = textareaRef.current;
      if (!el) return;

      const start = el.selectionStart ?? (answer || '').length;
      const end = el.selectionEnd ?? (answer || '').length;
      const newValue =
        (answer ?? '').substring(0, start) +
        symbol +
        (answer ?? '').substring(end);

      pendingCursorRef.current = start + symbol.length;
      onAnswerChange(exercise.id, newValue);
    },
    [answer, exercise.id, onAnswerChange]
  );

  useEffect(() => {
    if (isActive && textareaRef.current && pendingCursorRef.current !== null) {
      const pos = pendingCursorRef.current;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(pos, pos);
      pendingCursorRef.current = null;
    }
  }, [answer, isActive]);

  const handleChange = (e) => {
    onAnswerChange(exercise.id, e.target.value);
  };

  const handleFocus = () => {
    onFocus(exercise.id);
  };

  return (
    <div className={`question-card ${isActive ? 'focused' : ''}`}>
      <div className="question-header">
        <div className="question-badges">
          <span className="question-type-badge">{TYPE_LABELS[exercise.type] || exercise.type}</span>
          {exercise.difficulty && (
            <span className={`difficulty-badge difficulty-${exercise.difficulty}`}>
              {DIFFICULTY_LABELS[exercise.difficulty] || exercise.difficulty}
            </span>
          )}
        </div>
        <span className="question-number">第 {exercise.id} 题</span>
      </div>

      <div className="question-body">
        <p className="question-text">{exercise.question}</p>
        {exercise.schema_context && (
          <div className="schema-context">
            <strong>补充表信息：</strong>
            <pre>{exercise.schema_context}</pre>
          </div>
        )}
      </div>

      <div className="answer-area">
        <label className="input-label">你的答案：</label>
        <textarea
          ref={textareaRef}
          className="answer-textarea"
          value={answer ?? ''}
          onChange={handleChange}
          onFocus={handleFocus}
          disabled={disabled}
          placeholder="在此输入你的答案..."
          rows={4}
          spellCheck={false}
        />
        <SymbolToolbar onInsert={handleSymbolInsert} visible={isActive && !disabled} />
      </div>

      {feedback && (
        <div className={`feedback-inline ${feedback.correct ? 'correct' : 'incorrect'}`}>
          <div className="feedback-score">
            {feedback.correct ? '✓' : '✗'} {feedback.semantic_judgement || ''} — {feedback.score} 分
          </div>
          <p className="feedback-text">{feedback.feedback}</p>

          {feedback.strengths && feedback.strengths.length > 0 && (
            <div className="feedback-detail-block strengths">
              <strong>✓ 优点：</strong>
              <ul>{feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
          )}

          {feedback.issues && feedback.issues.length > 0 && (
            <div className="feedback-detail-block issues">
              <strong>⚠ 问题：</strong>
              <ul>{feedback.issues.map((iss, i) => <li key={i}>{iss}</li>)}</ul>
            </div>
          )}

          {feedback.suggested_answer && feedback.suggested_answer !== '答案正确' && (
            <div className="corrected-answer">
              <strong>建议答案：</strong>
              <pre>{feedback.suggested_answer}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
