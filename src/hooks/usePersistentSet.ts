import { useCallback, useState } from "react";

const readSet = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set<string>(Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : []);
  } catch {
    return new Set<string>();
  }
};

export function usePersistentSet(key: string) {
  const [values, setValues] = useState<Set<string>>(() => readSet(key));
  const toggle = useCallback((value: string) => {
    let nextHasValue = false;
    setValues((previous) => {
      const next = new Set(previous);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      nextHasValue = next.has(value);
      try { localStorage.setItem(key, JSON.stringify([...next])); } catch { /* storage may be blocked */ }
      return next;
    });
    return nextHasValue;
  }, [key]);
  return { values, toggle };
}
