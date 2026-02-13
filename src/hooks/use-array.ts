import { useCallback, useMemo, useState } from "react";

export type UseArrayReturn<T> = {
  value: T[];
  setValue: React.Dispatch<React.SetStateAction<T[]>>;
  // These match the array prototype functions, except they never return anything.
  push: (...items: T[]) => void;
  pop: () => void;
  shift: () => void;
  unshift: (...items: T[]) => void;
  insertAt: (index: number, ...items: T[]) => void;
  removeAt: (index: number, count?: number) => void;
  fill: (value: T, start?: number, end?: number) => void;
  reverse: () => void;
  sort: (compareFn?: (a: T, b: T) => number) => void;
};

export function useArray<T>(initialState: T[] | (() => T[])): UseArrayReturn<T>;
export function useArray<T = undefined[]>(): UseArrayReturn<T>;

/**
 * Custom hook for using state which is an array.
 *
 * Includes methods for
 * @returns
 */
export function useArray<T>(
  initialValue?: T[] | (() => T[]),
): UseArrayReturn<T> {
  const [value, setValue] = useState(initialValue ?? []);

  const push: UseArrayReturn<T>["push"] = useCallback((...items) => {
    setValue((x) => [...x, ...items]);
  }, []);

  const pop: UseArrayReturn<T>["pop"] = useCallback(() => {
    setValue((x) => x.slice(0, x.length - 1));
  }, []);

  const shift: UseArrayReturn<T>["shift"] = useCallback(() => {
    setValue((x) => x.slice(1));
  }, []);

  const unshift: UseArrayReturn<T>["unshift"] = useCallback((...items) => {
    setValue((x) => [...items, ...x]);
  }, []);

  const insertAt: UseArrayReturn<T>["insertAt"] = useCallback(
    (index, ...items) => {
      setValue((x) => [...x.slice(0, index), ...items, ...x.slice(index)]);
    },
    [],
  );

  const removeAt: UseArrayReturn<T>["removeAt"] = useCallback(
    (index, count = 1) => {
      setValue((x) => [...x.slice(0, index), ...x.slice(index + count)]);
    },
    [],
  );

  const fill: UseArrayReturn<T>["fill"] = useCallback((value, start, end) => {
    setValue((x) => {
      const resolvedStart = start ?? 0;
      const resolvedEnd = end ?? x.length;

      return x.map((item, index) =>
        index >= resolvedStart && index < resolvedEnd ? value : item,
      );
    });
  }, []);

  const reverse: UseArrayReturn<T>["reverse"] = useCallback(() => {
    setValue((x) => [...x].reverse());
  }, []);

  const sort: UseArrayReturn<T>["sort"] = useCallback((compareFn) => {
    setValue((x) => [...x].sort(compareFn));
  }, []);

  return useMemo(
    () => ({
      value,
      setValue,
      push,
      pop,
      shift,
      unshift,
      insertAt,
      removeAt,
      fill,
      reverse,
      sort,
    }),
    [
      value,
      setValue,
      push,
      pop,
      shift,
      unshift,
      insertAt,
      removeAt,
      fill,
      reverse,
      sort,
    ],
  );
}
