import { useMemo } from "react";
import { debounce } from "../functions/debounce";

export function useDebounce<TArgs extends unknown[]>(
  /**
   * Callback to be run after delay has passed.
   *
   * This should be a stable reference. (not an inline function)
   */
  callback: (...args: TArgs) => void,
  delay: number,
) {
  return useMemo(() => {
    return debounce(callback, delay);
  }, [callback, delay]);
}
