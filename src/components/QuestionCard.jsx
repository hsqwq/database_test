import { useRef, useCallback, useEffect } from 'react';
import SymbolToolbar from './SymbolToolbar';

const TYPE_LABELS = {
  DDL: 'DDL',
  DML: 'DML',
  relational_algebra: '关系代数',
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

      const start = el.selectionStart ?? answer.length;
      const end = el.selectionEnd ?? answer.length;
      const newValue =
        (answer ?? '').substring(0, start) +
        symbol +
        (answer ?? '').substring(end);

      pendingCursorRef.current = start + symbol.length;
      onAnswerChange(exercise.id, newValue);
    },
    [answer, exercise.id, onAnswerChange]
  );

  // 光标恢复：在 answer 更新后把光标放到符号后
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
        <span className="question-type-badge">{TYPE_LABELS[exercise.type] || exercise.type}</span>
        <span className="question-number">第 {exercise.id} 题</span>
      </div>

      <div className="question-body">
        <p className="question-text">{exercise.question}</p>
        {exercise.schema_context && (
          <div className="schema-context">
            <strong>相关表结构：</strong>
            <pre>{exercise.schema_context}</pre>
          </div>
        )}
      </div>

      <div className="answer-area">
        <label className="input-label">
          你的答案：
        </label>
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
            {feedback.correct ? '✓ 正确' : '✗ 有误'} — {feedback.score} 分
          </div>
          <p className="feedback-text">{feedback.feedback}</p>
          {feedback.corrected_answer && (
            <div className="corrected-answer">
              <strong>修正后的答案：</strong>
              <pre>{feedback.corrected_answer}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
