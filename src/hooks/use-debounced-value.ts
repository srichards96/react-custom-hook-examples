import { useEffect, useState } from "react";
import { useOnValueChange } from "./use-on-value-change";

export function useDebouncedValue<T>(value: T, delay: number | null) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useOnValueChange(value, () => {
    if (delay == null || delay < 0) {
      setDebouncedValue(value);
    }
  });
  useOnValueChange(delay, () => {
    if (delay == null || delay < 0) {
      setDebouncedValue(value);
    }
  });

  useEffect(() => {
    if (delay == null || delay < 0) {
      return;
    }

    const handle = setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      clearTimeout(handle);
    };
  }, [value, delay]);

  return debouncedValue;
}
