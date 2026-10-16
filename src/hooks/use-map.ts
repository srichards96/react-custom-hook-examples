import { useCallback, useMemo, useState } from "react";
import type { Primitive } from "../types/primitive";

type InitialState<TKey extends Primitive, TValue> =
  | [TKey, TValue][]
  | Map<TKey, TValue>;

export function useMap<TKey extends Primitive, TValue>(
  initialState?:
    | InitialState<TKey, TValue>
    | (() => InitialState<TKey, TValue>),
) {
  const [value, setValue] = useState(() => {
    return new Map(
      typeof initialState === "function" ? initialState() : initialState,
    );
  });

  const get = useCallback(
    (key: TKey) => {
      return value.get(key);
    },
    [value],
  );

  const set = useCallback((key: TKey, val: TValue) => {
    setValue((old) => {
      // If key-value-pair already in map, do not create a "new" map
      if (old.get(key) === val) {
        return old;
      }

      const next = new Map(old);
      next.set(key, val);
      return next;
    });
  }, []);

  const deleteFn = useCallback((key: TKey) => {
    setValue((old) => {
      // If key already not in map, do not create a "new" map
      if (!old.has(key)) {
        return old;
      }

      const next = new Map(old);
      next.delete(key);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setValue((old) => {
      // If no key-value-pairs to clear, do not create a "new" map
      if (old.size === 0) {
        return old;
      }

      return new Map();
    });
  }, []);

  const has = useCallback((key: TKey) => value.has(key), [value]);

  return useMemo(
    () => ({
      value,
      setValue,
      get,
      set,
      delete: deleteFn,
      clear,
      has,
      size: value.size,
    }),
    [value, get, set, deleteFn, clear, has],
  );
}
