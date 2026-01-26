import { useCallback, useState } from 'react';

export default function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });

  const setValue = useCallback((v) => {
    try {
      const valueToStore = v instanceof Function ? v(state) : v;
      setState(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (e) {}
  }, [key, state]);

  return [state, setValue];
}
