import { useEffect, useState } from 'react';

export function readPersistedState(key, fallback, storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem?.(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Failed to read persisted state for ${key}:`, error);
    return fallback;
  }
}

export function writePersistedState(key, value, storage = globalThis.localStorage) {
  try {
    storage?.setItem?.(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to write persisted state for ${key}:`, error);
    return false;
  }
}

export function usePersistedState(key, initialValue) {
  const [state, setState] = useState(() => readPersistedState(key, initialValue));

  useEffect(() => {
    writePersistedState(key, state);
  }, [key, state]);

  return [state, setState];
}
