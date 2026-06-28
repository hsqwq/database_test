/**
 * 答题页顶部表结构展示面板
 * 显示本次答题需要用到的数据库表结构
 */
export default function SchemaContextPanel({ sessionSchemaContext, visible = true }) {
  if (!visible || !sessionSchemaContext) return null;

  const { title, display_text, tables } = sessionSchemaContext;

  if (!display_text && (!tables || tables.length === 0)) return null;

  return (
    <div className="schema-panel">
      <details open>
        <summary className="schema-panel-summary">
          📋 本次答题需要用到的表结构
          {title && <span className="schema-panel-title"> — {title}</span>}
        </summary>
        <div className="schema-panel-body">
          {display_text && <pre className="schema-display">{display_text}</pre>}
          {!display_text && tables && tables.length > 0 && (
            <div className="schema-tables-grid">
              {tables.map((t) => (
                <div key={t.name} className="schema-table-card">
                  <strong>{t.name}</strong>
                  <ul>
                    {t.columns.map((c) => (
                      <li key={c.name}>
                        {c.name} <span className="col-type">{c.type}</span>
                        {t.primaryKey === c.name && (
                          <span className="pk-badge">PK</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
