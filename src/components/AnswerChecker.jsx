export default function AnswerChecker({ onCheck, loading, disabled, hasAnswers }) {
  const allEmpty =
    hasAnswers !== undefined && !hasAnswers;

  return (
    <div className="checker-section">
      <button
        className="btn btn-primary btn-lg"
        onClick={onCheck}
        disabled={disabled || loading || allEmpty}
      >
        {loading ? '批改中...' : '提交答案进行批改'}
      </button>
      {allEmpty && (
        <p className="hint" style={{ color: 'var(--color-error)' }}>
          请至少回答一道题后再提交。
        </p>
      )}
    </div>
  );
}
