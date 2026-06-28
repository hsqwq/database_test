const DIFFICULTY_LABELS = { easy: '简单', medium: '中等', hard: '困难' };

export default function FeedbackCard({ exercise, answer, feedback }) {
  if (!feedback) return null;

  return (
    <div className={`feedback-card ${feedback.correct ? 'correct' : 'incorrect'}`}>
      <div className="feedback-card-header">
        <div className="feedback-card-header-left">
          <span className="feedback-score-badge">
            {feedback.correct ? '✓' : '✗'} {feedback.score}分
          </span>
          {feedback.semantic_judgement && (
            <span className="feedback-semantic-tag">{feedback.semantic_judgement}</span>
          )}
        </div>
        <span>第 {exercise.id} 题</span>
      </div>
      <div className="feedback-card-body">
        <div className="feedback-original">
          <strong>题目：</strong>
          <p>{exercise.question}</p>
          {exercise.difficulty && (
            <span className={`difficulty-badge difficulty-${exercise.difficulty}`}>
              {DIFFICULTY_LABELS[exercise.difficulty] || exercise.difficulty}
            </span>
          )}
          <strong>你的答案：</strong>
          <pre className="answer-display">{answer || '（未作答）'}</pre>
        </div>
        <div className="feedback-detail">
          <strong>批改意见：</strong>
          <p>{feedback.feedback}</p>
        </div>

        {feedback.strengths && feedback.strengths.length > 0 && (
          <div className="feedback-detail-block strengths">
            <strong>✓ 优点：</strong>
            <ul>
              {feedback.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {feedback.issues && feedback.issues.length > 0 && (
          <div className="feedback-detail-block issues">
            <strong>⚠ 问题：</strong>
            <ul>
              {feedback.issues.map((iss, i) => (
                <li key={i}>{iss}</li>
              ))}
            </ul>
          </div>
        )}

        {feedback.suggested_answer && feedback.suggested_answer !== '答案正确' && (
          <div className="feedback-corrected">
            <strong>建议答案：</strong>
            <pre>{feedback.suggested_answer}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
