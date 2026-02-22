import { useMemo } from "react";
import { throttle } from "../functions/throttle";

export function useThrottle<TArgs extends unknown[]>(
  /**
   * Callback to be run after delay has passed.
   *
   * This should be a stable reference. (not an inline function)
   */
  callback: (...args: TArgs) => void,
  delay: number,
) {
  return useMemo(() => {
    return throttle(callback, delay);
  }, [callback, delay]);
}
