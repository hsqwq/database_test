import FeedbackCard from './FeedbackCard';

export default function FeedbackPanel({ exercises, answers, feedbacks, onNewExercise }) {
  const feedbackMap = {};
  if (Array.isArray(feedbacks)) {
    feedbacks.forEach((fb) => {
      feedbackMap[fb.id] = fb;
    });
  }

  const totalScore =
    Array.isArray(feedbacks) && feedbacks.length > 0
      ? feedbacks.reduce((sum, fb) => sum + (fb.score || 0), 0)
      : 0;
  const maxScore = exercises.length * 100;
  const allCorrect =
    Array.isArray(feedbacks) &&
    feedbacks.length > 0 &&
    feedbacks.every((fb) => fb.correct);

  return (
    <div className="feedback-panel">
      <div className="feedback-summary">
        <h2>批改结果</h2>
        <div className="summary-stats">
          <span className={`total-score ${allCorrect ? 'all-correct' : ''}`}>
            总分：{totalScore} / {maxScore}
          </span>
          <span>
            正确：{feedbacks.filter((fb) => fb.correct).length} / {feedbacks.length} 题
          </span>
        </div>
      </div>

      <div className="feedback-list">
        {exercises.map((ex) => (
          <FeedbackCard
            key={ex.id}
            exercise={ex}
            answer={answers[ex.id] || ''}
            feedback={feedbackMap[ex.id]}
          />
        ))}
      </div>

      <div className="feedback-actions">
        <button className="btn btn-primary" onClick={onNewExercise}>
          再来一题
        </button>
      </div>
    </div>
  );
}
