export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message">
      <span className="error-icon">⚠</span>
      <span className="error-text">{message}</span>
      {onRetry && (
        <button className="btn btn-sm" onClick={onRetry}>
          重试
        </button>
      )}
    </div>
  );
}
