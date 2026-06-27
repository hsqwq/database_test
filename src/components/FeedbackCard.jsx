export default function FeedbackCard({ exercise, answer, feedback }) {
  if (!feedback) return null;

  return (
    <div className={`feedback-card ${feedback.correct ? 'correct' : 'incorrect'}`}>
      <div className="feedback-card-header">
        <span className="feedback-score-badge">
          {feedback.correct ? '✓' : '✗'} {feedback.score}分
        </span>
        <span>第 {exercise.id} 题</span>
      </div>
      <div className="feedback-card-body">
        <div className="feedback-original">
          <strong>题目：</strong>
          <p>{exercise.question}</p>
          <strong>你的答案：</strong>
          <pre className="answer-display">{answer || '（未作答）'}</pre>
        </div>
        <div className="feedback-detail">
          <strong>批改意见：</strong>
          <p>{feedback.feedback}</p>
        </div>
        {feedback.corrected_answer && (
          <div className="feedback-corrected">
            <strong>修正后的答案：</strong>
            <pre>{feedback.corrected_answer}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
