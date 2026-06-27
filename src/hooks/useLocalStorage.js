import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? item : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      setStoredValue(value);
      try {
        if (value === null || value === '') {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      } catch {
        // localStorage 不可用时静默降级
      }
    },
    [key]
  );

  return [storedValue, setValue];
}
