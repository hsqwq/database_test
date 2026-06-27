import { SYMBOL_GROUPS } from '../utils/symbols';

export default function SymbolToolbar({ onInsert, visible }) {
  if (!visible) return null;

  return (
    <div className="symbol-toolbar">
      {SYMBOL_GROUPS.map((group) => (
        <div key={group.label} className="symbol-group">
          <span className="symbol-group-label">{group.label}</span>
          <div className="symbol-buttons">
            {group.symbols.map((sym) => (
              <button
                key={sym.name}
                className="btn btn-symbol"
                onClick={() => onInsert(sym.char)}
                title={sym.tip}
                aria-label={sym.tip}
                type="button"
              >
                {sym.char}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
