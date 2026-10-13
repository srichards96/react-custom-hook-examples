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
      const next = new Map(old);
      next.set(key, val);
      return next;
    });
  }, []);

  const deleteFn = useCallback((key: TKey) => {
    setValue((old) => {
      const next = new Map(old);
      next.delete(key);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setValue(new Map());
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
