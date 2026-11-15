import { useCallback, useRef } from 'react';

/** Runs async loads so that only the most recent one is allowed to update state. */
export function useLatestRequest() {
  const seq = useRef(0);
  return useCallback(async <T,>(load: () => Promise<T>, apply: (value: T) => void, fail: (e: unknown) => void) => {
    const mine = ++seq.current;
    try {
      const value = await load();
      if (mine === seq.current) apply(value);
    } catch (e) {
      if (mine === seq.current) fail(e);
    }
  }, []);
}
