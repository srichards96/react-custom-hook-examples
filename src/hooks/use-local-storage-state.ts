import { useMemo, useSyncExternalStore } from "react";
import type { Serializable } from "../types/serializable";

type ParseFn<T> = (value: unknown) => T;
type StateSetter<T> = (valueOrFunction: T | ((oldValue: T) => T)) => void;

const createSubscribeFn = (key: string) => (callback: () => void) => {
  const onStorage = (e: StorageEvent) => {
    if (e.key === key) {
      callback();
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener("storage", onStorage);
  };
};

const createGetSnapshotFn =
  <T extends Serializable>(key: string, defaultValue: T, parseFn: ParseFn<T>) =>
  () => {
    const valueString = localStorage.getItem(key);
    if (valueString == null) {
      return defaultValue;
    }

    try {
      const value = JSON.parse(valueString);
      // Object types aren't supported. They get parsed as "new" objects on every render, which causes
      //   `useSyncExternalStore` to rerender infinitely.
      if (typeof value === "object") {
        return defaultValue;
      }

      return parseFn != null ? parseFn(value) : (value as T);
    } catch {
      return defaultValue;
    }
  };

const createSetValueFn =
  <T extends Serializable>(
    key: string,
    getSnapshotFn: () => T,
  ): StateSetter<T> =>
  (setter) => {
    const oldValue = getSnapshotFn();
    const newValue = typeof setter === "function" ? setter(oldValue) : setter;

    if (newValue === oldValue) {
      return;
    }

    const oldValueString = JSON.stringify(oldValue);
    const newValueString = JSON.stringify(newValue);

    // This fires a storage event on every browser tab other than the current one
    localStorage.setItem(key, newValueString);

    // This fires a storage event on the current browser tab
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        oldValue: oldValueString,
        newValue: newValueString,
      }),
    );
  };

export function useLocalStorageState<T extends Serializable>(
  key: string,
  defaultValue: T,
  parseFn: ParseFn<T> = (x) => x as T,
): [T, StateSetter<T>] {
  const subscribe = useMemo(() => {
    return createSubscribeFn(key);
  }, [key]);

  const getSnapshot = useMemo(() => {
    return createGetSnapshotFn(key, defaultValue, parseFn);
  }, [key, defaultValue, parseFn]);

  const setValue = useMemo(() => {
    return createSetValueFn(key, getSnapshot);
  }, [key, getSnapshot]);

  // `subscribe` and `getSnapshot` need to have stable references
  const value = useSyncExternalStore(subscribe, getSnapshot);

  return [value, setValue] as const;
}
