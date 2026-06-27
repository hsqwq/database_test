export default function Header({ step }) {
  const steps = [
    { num: 1, label: '配置 API Key' },
    { num: 2, label: '生成练习题' },
    { num: 3, label: '作答' },
    { num: 4, label: '查看批改' },
  ];

  return (
    <header className="app-header">
      <h1>数据库练习生成器</h1>
      <nav className="step-indicator">
        {steps.map((s, i) => (
          <span
            key={s.num}
            className={`step-item ${step === s.num ? 'active' : ''} ${step > s.num ? 'done' : ''}`}
          >
            <span className="step-num">{step > s.num ? '✓' : s.num}</span>
            <span className="step-label">{s.label}</span>
            {i < steps.length - 1 && <span className="step-arrow">→</span>}
          </span>
        ))}
      </nav>
    </header>
  );
}
