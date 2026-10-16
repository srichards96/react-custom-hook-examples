import { useCallback, useMemo, useState } from "react";
import type { Primitive } from "../types/primitive";

type InitialState<T extends Primitive> = T[] | Set<T>;

export function useSet<T extends Primitive>(
  initialState?: InitialState<T> | (() => InitialState<T>),
) {
  const [value, setValue] = useState(() => {
    return new Set(
      typeof initialState === "function" ? initialState() : initialState,
    );
  });

  const add = useCallback((val: T) => {
    setValue((old) => {
      // If value already in set, do not create a "new" set
      if (old.has(val)) {
        return old;
      }

      const next = new Set(old);
      next.add(val);
      return next;
    });
  }, []);

  const deleteFn = useCallback((val: T) => {
    setValue((old) => {
      // If value not in set, do not create a "new" set
      if (!old.has(val)) {
        return old;
      }

      const next = new Set(old);
      next.delete(val);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setValue((old) => {
      // If no values to clear, do not create a "new" set
      if (old.size === 0) {
        return old;
      }

      return new Set();
    });
  }, []);

  const has = useCallback((val: T) => value.has(val), [value]);

  return useMemo(
    () => ({
      value,
      setValue,
      add,
      delete: deleteFn,
      has,
      clear,
      size: value.size,
    }),
    [value, setValue, add, has, deleteFn, clear],
  );
}
