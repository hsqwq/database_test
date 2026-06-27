export default function LoadingSpinner({ message = '加载中...' }) {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  );
}
