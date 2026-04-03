import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Serializable } from "../types/serializable";

type ParseFn<T> = (value: unknown) => T;
type EqualityComparer<T> = (a: T, b: T) => boolean;
type StateSetter<T> = (valueOrFunction: T | ((oldValue: T) => T)) => void;

const defaultEqualityComparer = Object.is;

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
  parseFn: ParseFn<T>,
  equalityComparer: EqualityComparer<T>,
  storageApi: Storage,
): (() => T) => {
  // Keep track of the latest "new" value.
  // If T is an object type, this keeps track of the latest "new" value according to the `equalityComparer`
  // Since overwise, every run would produce a "new" object (reference)
  let latestNewValue = defaultValue;

  return () => {
    const valueString = storageApi.getItem(key);
    if (valueString == null) {
      return defaultValue;
    }

    try {
      const value = JSON.parse(valueString);
      // Object types will cause a "new" reference to be created on every run.
      // So a custom `equalityComparer` must be provided to determine if it is actually "new" or not.
      // If one wasn't provided and an object type was parsed, fallback to `defaultValue`
      if (
        typeof value === "object" &&
        equalityComparer === defaultEqualityComparer
      ) {
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

export type UseStorageStateProps<T extends Serializable> = {
  key: string;
  defaultValue: T;
  parseFn?: ParseFn<T>;
  equalityComparer?: EqualityComparer<T>;
  storageApi?: Storage;
};

export function useStorageState<T extends Serializable>({
  key,
  defaultValue,
  parseFn = (x) => x as T,
  equalityComparer = defaultEqualityComparer,
  storageApi = localStorage,
}: UseStorageStateProps<T>) {
  const subscribe = useMemo(() => {
    return createSubscribeFn(key);
  }, [key]);

  const getSnapshot = useMemo(() => {
    return createGetSnapshotFn(
      key,
      defaultValue,
      parseFn,
      equalityComparer,
      storageApi,
    );
  }, [key, defaultValue, parseFn, equalityComparer, storageApi]);

  // `subscribe` and `getSnapshot` need to have stable references
  const value = useSyncExternalStore(subscribe, getSnapshot);

  const setValue: StateSetter<T> = useCallback(
    (setter) => {
      const oldValue = getSnapshot();
      const newValue = typeof setter === "function" ? setter(oldValue) : setter;

      if (newValue === oldValue) {
        return;
      }

      const oldValueString = JSON.stringify(oldValue);
      const newValueString = JSON.stringify(newValue);

      // This fires a storage event on every browser tab other than the current one
      storageApi.setItem(key, newValueString);

      // This fires a storage event on the current browser tab
      window.dispatchEvent(
        new StorageEvent("storage", {
          key,
          oldValue: oldValueString,
          newValue: newValueString,
        }),
      );
    },
    [key, getSnapshot, storageApi],
  );

  const deleteValue = useCallback(() => {
    const oldValue = getSnapshot();

    // This fires a storage event on every browser tab other than the current one
    storageApi.removeItem(key);

    // This fires a storage event on the current browser tab
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        oldValue: JSON.stringify(oldValue),
      }),
    );
  }, [key, getSnapshot, storageApi]);

  return [value, setValue, deleteValue] as const;
}
