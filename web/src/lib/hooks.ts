import { useState } from "react";

export function useDraft<T>(key: string, initial: T) {
  const storageKey = `lache:v1:${key}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored === null ? initial : (JSON.parse(stored) as T);
    } catch {
      return initial;
    }
  });
  const update = (next: T) => {
    setValue(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* Drafts remain usable without storage. */
    }
  };
  return [value, update] as const;
}

export function useAction<T>() {
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const reset = () => {
    setResult(null);
    setError("");
  };
  const run = async (work: () => Promise<T>) => {
    reset();
    setBusy(true);
    try {
      setResult(await work());
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      );
    } finally {
      setBusy(false);
    }
  };
  return { result, error, busy, reset, run };
}
