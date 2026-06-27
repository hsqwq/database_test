import { useState } from 'react';

export default function ApiKeyInput({ apiKey, onSave, onNext }) {
  const [inputValue, setInputValue] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(!!apiKey);
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('请输入 API Key');
      return;
    }
    setError('');
    onSave(trimmed);
    setSaved(true);
  };

  const handleClear = () => {
    setInputValue('');
    onSave('');
    setSaved(false);
    setError('');
  };

  const handleEdit = () => {
    setSaved(false);
  };

  if (saved && apiKey) {
    return (
      <div className="api-key-section">
        <div className="api-key-saved">
          <span className="saved-icon">✓</span>
          <span>API Key 已保存</span>
          <span className="key-mask">
            {showKey ? apiKey : apiKey.slice(0, 6) + '••••••••••••••••'}
          </span>
          <button className="btn btn-sm" onClick={() => setShowKey(!showKey)}>
            {showKey ? '隐藏' : '显示'}
          </button>
          <button className="btn btn-sm btn-danger" onClick={handleClear}>
            清除
          </button>
          <button className="btn btn-sm" onClick={handleEdit}>
            修改
          </button>
        </div>
        {onNext && (
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={onNext}>
              下一步 →
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="api-key-section">
      <label className="input-label" htmlFor="api-key-input">
        DeepSeek API Key
      </label>
      <div className="input-row">
        <input
          id="api-key-input"
          type={showKey ? 'text' : 'password'}
          className="text-input"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError('');
          }}
          placeholder="sk-..."
          autoComplete="off"
        />
        <button
          className="btn btn-sm"
          onClick={() => setShowKey(!showKey)}
          type="button"
        >
          {showKey ? '隐藏' : '显示'}
        </button>
        <button className="btn btn-primary" onClick={handleSave} type="button">
          保存
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
      <p className="hint">
        API Key 仅存储在您的浏览器本地，不会上传到除 DeepSeek 之外的任何服务器。
      </p>
    </div>
  );
}
