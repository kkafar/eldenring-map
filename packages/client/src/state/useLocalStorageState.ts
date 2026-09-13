import { useEffect, useState } from "react";

// useState persisted to localStorage; `parse` validates what was stored.
export function useLocalStorageState<T>(
  key: string,
  initial: T,
  parse: (raw: unknown) => T | undefined,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed = parse(JSON.parse(raw));
        if (parsed !== undefined) return parsed;
      }
    } catch {
      // ignore unreadable storage
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore unwritable storage
    }
  }, [key, value]);

  return [value, setValue] as const;
}
