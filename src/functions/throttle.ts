type ThrottledFunction<TArgs extends unknown[]> = (...args: TArgs) => void;
type ThrottledFunctionMethods<TArgs extends unknown[]> = {
  /**
   * Returns whether function is throttled.
   */
  isThrottled: () => boolean;
  /**
   * Stops throttling function, if it is currently throttled.
   */
  cancel: () => void;
  /**
   * Runs function immediately with given arguments and resets function throttling duration.
   */
  force: (...args: TArgs) => void;
  /**
   * Runs function immediately with given arguments.
   *
   * Does not reset function throttling duration, if it is currently being throttled.
   */
  immediate: (...args: TArgs) => void;
};

export type ThrottleReturn<TArgs extends unknown[]> = ThrottledFunction<TArgs> &
  ThrottledFunctionMethods<TArgs>;

export function throttle<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number,
) {
  let lastTime = 0;

  const canRun = () => Date.now() - lastTime >= delay;

  const updateLastTime = () => {
    lastTime = Date.now();
  };

  const throttledFunction = (...args: TArgs) => {
    if (canRun()) {
      callback(...args);
      updateLastTime();
    }
  };

  return Object.assign<
    ThrottledFunction<TArgs>,
    ThrottledFunctionMethods<TArgs>
  >(throttledFunction, {
    isThrottled() {
      return !canRun();
    },
    cancel() {
      lastTime = 0;
    },
    force(...args) {
      callback(...args);
      updateLastTime();
    },
    immediate(...args) {
      callback(...args);
    },
  });
}
