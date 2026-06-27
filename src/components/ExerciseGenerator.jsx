const TYPE_OPTIONS = [
  { value: 'DDL', label: 'DDL（数据定义）' },
  { value: 'DML', label: 'DML（数据操作）' },
  { value: 'relational_algebra', label: '关系代数' },
];

export default function ExerciseGenerator({
  questionTypes,
  questionCount,
  onTypesChange,
  onCountChange,
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
