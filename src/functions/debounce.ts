type DebouncedFunction<TArgs extends unknown[]> = (...args: TArgs) => void;
type DebouncedFunctionMethods<TArgs extends unknown[]> = {
  /**
   * Returns whether call is pending.
   */
  isPending: () => boolean;
  /**
   * Cancel pending call, if one is pending.
   */
  cancel: () => void;
  /**
   * Runs pending call immediately, if one is pending.
   */
  flush: () => void;
  /**
   * Runs callback immediately with given arguments. Does not affect pending call, if one is pending.
   */
  immediate: (...args: TArgs) => void;
};

export type DebounceReturn<TArgs extends unknown[]> = DebouncedFunction<TArgs> &
  DebouncedFunctionMethods<TArgs>;

export function debounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number,
): DebounceReturn<TArgs> {
  let handle: number | undefined;
  let latestArgs: TArgs | undefined;

  const runCallback = (...args: TArgs) => {
    callback(...args);
  };

  const resetStoredValues = () => {
    handle = undefined;
    latestArgs = undefined;
  };

  const debouncedFuncion = (...args: TArgs) => {
    clearTimeout(handle);
    latestArgs = args;

    handle = setTimeout(() => {
      if (latestArgs != null) {
        runCallback(...latestArgs);
      }
      resetStoredValues();
    }, delay);
  };

  return Object.assign<
    DebouncedFunction<TArgs>,
    DebouncedFunctionMethods<TArgs>
  >(debouncedFuncion, {
    isPending() {
      return handle != null;
    },
    cancel() {
      clearTimeout(handle);
      resetStoredValues();
    },
    flush() {
      if (latestArgs != null) {
        runCallback(...latestArgs);
      }
      resetStoredValues();
    },
    immediate(...args: TArgs) {
      runCallback(...args);
    },
  });
}
