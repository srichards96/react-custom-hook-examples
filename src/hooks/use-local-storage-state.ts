import { useMemo, useSyncExternalStore } from "react";
import type { Serializable } from "../types/serializable";

type ParseFn<T> = (value: unknown) => T;
type EqualityComparer<T> = (a: T, b: T) => boolean;
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

const createGetSnapshotFn = <T extends Serializable>(
  key: string,
  defaultValue: T,
  parseFn: ParseFn<T> = (x) => x as T,
  equalityComparer: EqualityComparer<T> = Object.is,
): (() => T) => {
  // Keep track of the latest "new" value.
  // If T is an object type, this keeps track of the latest "new" value according to the `equalityComparer`
  // Since overwise, every run would produce a "new" object (reference)
  let latestNewValue = defaultValue;

  return () => {
    const valueString = localStorage.getItem(key);
    if (valueString == null) {
      return defaultValue;
    }

    try {
      const value = JSON.parse(valueString);
      // Object types will cause a "new" reference to be created on every run.
      // So a custom `equalityComparer` must be provided to determine if it is actually "new" or not.
      // If one wasn't provided and an object type was parsed, fallback to `defaultValue`
      if (typeof value === "object" && equalityComparer === Object.is) {
        return defaultValue;
      }

      const parsedValue = parseFn != null ? parseFn(value) : (value as T);

      if (!equalityComparer(parsedValue, latestNewValue)) {
        latestNewValue = parsedValue;
      }

      return latestNewValue;
    } catch {
      return defaultValue;
    }
  };
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

export type UseLocalStorageStateProps<T extends Serializable> = {
  key: string;
  defaultValue: T;
  parseFn?: ParseFn<T>;
  equalityComparer?: EqualityComparer<T>;
};

export function useLocalStorageState<T extends Serializable>({
  key,
  defaultValue,
  parseFn,
  equalityComparer,
}: UseLocalStorageStateProps<T>): [T, StateSetter<T>] {
  const subscribe = useMemo(() => {
    return createSubscribeFn(key);
  }, [key]);

  const getSnapshot = useMemo(() => {
    return createGetSnapshotFn(key, defaultValue, parseFn, equalityComparer);
  }, [key, defaultValue, parseFn, equalityComparer]);

  const setValue = useMemo(() => {
    return createSetValueFn(key, getSnapshot);
  }, [key, getSnapshot]);

  // `subscribe` and `getSnapshot` need to have stable references
  const value = useSyncExternalStore(subscribe, getSnapshot);

  return [value, setValue] as const;
}
