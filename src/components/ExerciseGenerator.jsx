const TYPE_OPTIONS = [
  { value: 'DDL', label: 'DDL（数据定义）' },
  { value: 'DML', label: 'DML（数据操作）' },
  { value: 'relational_algebra', label: '关系代数' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'mixed', label: '混合难度（推荐）' },
  { value: 'easy', label: '偏简单（基础题为主）' },
  { value: 'hard', label: '偏困难（综合题为主）' },
];

export default function ExerciseGenerator({
  questionTypes,
  questionCount,
  difficultyMode,
  userPrompt,
  onTypesChange,
  onCountChange,
  onDifficultyChange,
  onUserPromptChange,
  onGenerate,
  loading,
  disabled,
}) {
  const handleTypeToggle = (type) => {
    if (questionTypes.includes(type)) {
      if (questionTypes.length > 1) {
        onTypesChange(questionTypes.filter((t) => t !== type));
      }
    } else {
      onTypesChange([...questionTypes, type]);
    }
  };

  return (
    <div className="generator-section">
      <h2>生成练习题</h2>

      <div className="form-group">
        <label className="input-label">题目类型（可多选）</label>
        <div className="checkbox-group">
          {TYPE_OPTIONS.map((opt) => (
            <label key={opt.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={questionTypes.includes(opt.value)}
                onChange={() => handleTypeToggle(opt.value)}
                disabled={loading}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="input-label" htmlFor="question-count">
          题目数量
        </label>
        <select
          id="question-count"
          className="select-input"
          value={questionCount}
          onChange={(e) => onCountChange(Number(e.target.value))}
          disabled={loading}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} 道题
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="input-label" htmlFor="difficulty-mode">
          难度偏好
        </label>
        <select
          id="difficulty-mode"
          className="select-input"
          value={difficultyMode}
          onChange={(e) => onDifficultyChange(e.target.value)}
          disabled={loading}
        >
          {DIFFICULTY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="input-label" htmlFor="user-prompt">
          补充要求（可选）
        </label>
        <textarea
          id="user-prompt"
          className="text-input user-prompt-input"
          value={userPrompt}
          onChange={(e) => onUserPromptChange(e.target.value)}
          disabled={loading}
          placeholder="如：多出一些子查询相关的题目、侧重外键约束、难度大一点..."
          rows={2}
        />
      </div>

      <button
        className="btn btn-primary btn-lg"
        onClick={onGenerate}
        disabled={disabled || loading}
      >
        {loading ? '生成中...' : '生成练习题'}
      </button>
    </div>
  );
}
