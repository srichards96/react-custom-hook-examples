import { useState } from "react";

/**
 * Calls a `callback` function when `value` changes.
 */
export function useOnValueChange<T>(
  value: T,
  callback: (oldValue: T, newValue: T) => void,
) {
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    callback(prevValue, value);
  }
}
