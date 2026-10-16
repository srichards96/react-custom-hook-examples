import { describe, expect, it, test, vi } from "vitest";
import type { Primitive } from "../types/primitive";
import { useMap } from "./use-map";
import { renderHook } from "@testing-library/react";
import { act } from "react";

type UseMapProps<TKey extends Primitive, TValue> = Parameters<
  typeof useMap<TKey, TValue>
>;

describe("useMap", () => {
  it("should start empty if `initialState` is not provided", () => {
    const { result } = renderHook(
      (props: UseMapProps<number, number> = [undefined]) => useMap(...props),
    );

    expect(result.current.size).toEqual(0);
  });

  it("should start with `initialState` if provided as a value", () => {
    const { result } = renderHook(
      (
        props: UseMapProps<number, number> = [
          [
            [1, 10],
            [2, 20],
            [3, 30],
          ],
        ],
      ) => useMap(...props),
    );

    expect(result.current.size).toEqual(3);
  });

  it("should start with result of `initialState` if provided as an initializer function", () => {
    const { result } = renderHook(
      (
        props: UseMapProps<number, number> = [
          () => [
            [1, 10],
            [2, 20],
            [3, 30],
          ],
        ],
      ) => useMap(...props),
    );

    expect(result.current.size).toEqual(3);
  });

  test("that initializer form of `initialState` is run only on first render", () => {
    const initializer = vi.fn(
      () =>
        [
          [1, 10],
          [2, 20],
          [3, 30],
        ] satisfies [number, number][],
    );

    expect(initializer).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (props: UseMapProps<number, number> = [initializer]) => useMap(...props),
    );

    // Called on initial render, to get value
    expect(initializer).toHaveBeenCalledTimes(1);

    // Not called on subsequent rerenders
    rerender();
    expect(initializer).toHaveBeenCalledTimes(1);

    rerender();
    expect(initializer).toHaveBeenCalledTimes(1);
  });

  it("should return value at `key` when `get` is called", () => {
    const { result } = renderHook(
      (
        props: UseMapProps<number, number> = [
          [
            [1, 10],
            [2, 20],
            [3, 30],
          ],
        ],
      ) => useMap(...props),
    );

    expect(result.current.size).toEqual(3);
    expect(result.current.get(0)).toEqual(undefined);
    expect(result.current.get(1)).toEqual(10);
    expect(result.current.get(2)).toEqual(20);
    expect(result.current.get(3)).toEqual(30);
    expect(result.current.get(4)).toEqual(undefined);
  });

  it("should add specified key-value-pair when `set` is called", () => {
    const { result } = renderHook(
      (props: UseMapProps<number, number> = [undefined]) => useMap(...props),
    );

    expect(result.current.size).toEqual(0);

    // Set a key-value-pair
    act(() => result.current.set(1, 10));
    expect(result.current.size).toEqual(1);
    expect(result.current.get(1)).toEqual(10);

    // Set another
    act(() => result.current.set(2, 20));
    expect(result.current.size).toEqual(2);
    expect(result.current.get(1)).toEqual(10);
    expect(result.current.get(2)).toEqual(20);

    // Set the same key again
    act(() => result.current.set(2, 20));
    expect(result.current.size).toEqual(2);
    expect(result.current.get(1)).toEqual(10);
    expect(result.current.get(2)).toEqual(20);

    // Set multiple at once
    act(() => {
      result.current.set(3, 30);
      result.current.set(4, 40);
      result.current.set(5, 50);
    });
    expect(result.current.size).toEqual(5);
    expect(result.current.get(1)).toEqual(10);
    expect(result.current.get(2)).toEqual(20);
    expect(result.current.get(3)).toEqual(30);
    expect(result.current.get(4)).toEqual(40);
    expect(result.current.get(5)).toEqual(50);

    // Setting an already-set key should replace the value
    act(() => result.current.set(1, 100));
    expect(result.current.size).toEqual(5);
    expect(result.current.get(1)).toEqual(100);
    expect(result.current.get(2)).toEqual(20);
    expect(result.current.get(3)).toEqual(30);
    expect(result.current.get(4)).toEqual(40);
    expect(result.current.get(5)).toEqual(50);
  });

  it("should delete specified key-value-pair when `delete` is called, if it is in the map", () => {
    const { result } = renderHook(
      (
        props: UseMapProps<number, number> = [
          [
            [1, 10],
            [2, 20],
            [3, 30],
            [4, 40],
            [5, 50],
          ],
        ],
      ) => useMap(...props),
    );

    expect(result.current.size).toEqual(5);

    // Delete a key
    act(() => result.current.delete(5));
    expect(result.current.size).toEqual(4);
    expect(result.current.get(1)).toEqual(10);
    expect(result.current.get(2)).toEqual(20);
    expect(result.current.get(3)).toEqual(30);
    expect(result.current.get(4)).toEqual(40);
    expect(result.current.get(5)).toEqual(undefined);

    // Delete another
    act(() => result.current.delete(4));
    expect(result.current.size).toEqual(3);
    expect(result.current.get(1)).toEqual(10);
    expect(result.current.get(2)).toEqual(20);
    expect(result.current.get(3)).toEqual(30);
    expect(result.current.get(4)).toEqual(undefined);
    expect(result.current.get(5)).toEqual(undefined);

    // Delete the same key again
    act(() => result.current.delete(4));
    expect(result.current.size).toEqual(3);
    expect(result.current.get(1)).toEqual(10);
    expect(result.current.get(2)).toEqual(20);
    expect(result.current.get(3)).toEqual(30);
    expect(result.current.get(4)).toEqual(undefined);
    expect(result.current.get(5)).toEqual(undefined);

    // Delete multiple at once
    act(() => {
      result.current.delete(3);
      result.current.delete(2);
      result.current.delete(1);
    });
    expect(result.current.size).toEqual(0);
    expect(result.current.get(1)).toEqual(undefined);
    expect(result.current.get(2)).toEqual(undefined);
    expect(result.current.get(3)).toEqual(undefined);
    expect(result.current.get(4)).toEqual(undefined);
    expect(result.current.get(5)).toEqual(undefined);
  });

  it("should return whether key-value-pair (by key) is in the map when `has` is called", () => {
    const { result } = renderHook(
      (
        props: UseMapProps<number, number> = [
          [
            [1, 10],
            [3, 30],
            [5, 50],
          ],
        ],
      ) => useMap(...props),
    );

    expect(result.current.size).toEqual(3);
    expect(result.current.has(1)).toEqual(true);
    expect(result.current.has(2)).toEqual(false);
    expect(result.current.has(3)).toEqual(true);
    expect(result.current.has(4)).toEqual(false);
    expect(result.current.has(5)).toEqual(true);
  });

  it("should make map empty when `clear` is called", () => {
    const { result } = renderHook(
      (
        props: UseMapProps<number, number> = [
          [
            [1, 10],
            [2, 20],
            [3, 30],
          ],
        ],
      ) => useMap(...props),
    );

    expect(result.current.size).toEqual(3);

    // Calling clear should clear...
    act(() => result.current.clear());
    expect(result.current.size).toEqual(0);

    // Adding multiple values, then clearing, at once, should result in cleared map
    act(() => {
      result.current.set(1, 10);
      result.current.set(2, 20);
      result.current.set(3, 30);
      result.current.clear();
    });
    expect(result.current.size).toEqual(0);

    // Clearing, then adding multiple values, at once, should result in values in map
    act(() => {
      result.current.set(1, 10);
      result.current.set(2, 20);
      result.current.set(3, 30);
      result.current.clear();
      result.current.set(4, 40);
      result.current.set(5, 50);
    });
    expect(result.current.size).toEqual(2);
    expect(result.current.has(1)).toEqual(false);
    expect(result.current.has(2)).toEqual(false);
    expect(result.current.has(3)).toEqual(false);
    expect(result.current.has(4)).toEqual(true);
    expect(result.current.has(5)).toEqual(true);
  });

  test("that `size` is the number of key-value-pairs in the map", () => {
    const { result } = renderHook(
      (
        props: UseMapProps<number, number> = [
          [
            [1, 10],
            [2, 20],
            [3, 30],
          ],
        ],
      ) => useMap(...props),
    );

    expect(result.current.size).toEqual(3);

    act(() => {
      result.current.set(4, 40);
      result.current.set(5, 50);
      result.current.set(6, 60);
      // Shouldn't change size
      result.current.set(6, 60);
    });
    expect(result.current.size).toEqual(6);

    act(() => {
      result.current.delete(6);
      result.current.delete(5);
      result.current.delete(4);
      // Shouldn't change size
      result.current.delete(4);
    });
    expect(result.current.size).toEqual(3);

    act(() => result.current.clear());
    expect(result.current.size).toEqual(0);
  });

  test("that result is a memoized object with memoized properties", () => {
    // Object should change whe
    // `add`/`delete`/`clear` should never change
    const { result } = renderHook(
      (props: UseMapProps<number, number> = [undefined]) => useMap(...props),
    );
    let prevResult;

    type Result = typeof result.current;

    // Expected changes for a mutative action
    // - `set` new key-value-pair
    // - `set` existing key-value-pair with new value
    // - `delete` existing key-value-pair
    // - `clear` with size > 0
    // - `setValue` with new map object
    const hasExpectedChangesForMutate = (curr: Result, prev: Result) => {
      expect(curr).not.toBe(prev);
      expect(curr.value).not.toBe(prev.value);
      expect(curr.get).not.toBe(prev.get);
      expect(curr.has).not.toBe(prev.has);
      // These should never change
      expect(curr.setValue).toBe(prev.setValue);
      expect(curr.set).toBe(prev.set);
      expect(curr.delete).toBe(prev.delete);
      expect(curr.clear).toBe(prev.clear);
    };

    // Expected changes (none...) for a non-mutative action
    // - `get`
    // - `has`
    // - `set` existing key-value-pair with same value
    // - `delete` non-existent key-value-pair
    // - `clear` with size === 0
    // - `setValue` with current map object
    const hasNoChanges = (curr: Result, prev: Result) => {
      expect(curr).toBe(prev);
      expect(curr.value).toBe(prev.value);
      expect(curr.get).toBe(prev.get);
      expect(curr.has).toBe(prev.has);
      expect(curr.setValue).toBe(prev.setValue);
      expect(curr.set).toBe(prev.set);
      expect(curr.delete).toBe(prev.delete);
      expect(curr.clear).toBe(prev.clear);
    };

    // Mutative actions...
    // `set` new
    act(() => result.current.setValue(new Map()));
    prevResult = result.current;
    act(() => result.current.set(1, 10));
    hasExpectedChangesForMutate(result.current, prevResult);

    // `set` existing with new value
    act(() => result.current.setValue(new Map([[1, 10]])));
    prevResult = result.current;
    act(() => result.current.set(1, 100));
    hasExpectedChangesForMutate(result.current, prevResult);

    // `delete` existing
    act(() => result.current.setValue(new Map([[1, 10]])));
    prevResult = result.current;
    act(() => result.current.delete(1));
    hasExpectedChangesForMutate(result.current, prevResult);

    // `clear` with size > 0
    act(() => result.current.setValue(new Map([[1, 10]])));
    prevResult = result.current;
    act(() => result.current.clear());
    hasExpectedChangesForMutate(result.current, prevResult);

    // `setValue` with new map
    prevResult = result.current;
    act(() => result.current.setValue(new Map()));
    hasExpectedChangesForMutate(result.current, prevResult);

    // Non-mutative actions...
    // `get`
    prevResult = result.current;
    act(() => result.current.get(1));
    hasNoChanges(result.current, prevResult);

    // `has`
    prevResult = result.current;
    act(() => result.current.has(1));
    hasNoChanges(result.current, prevResult);

    // `set` existing with same value
    act(() => result.current.setValue(new Map([[1, 10]])));
    prevResult = result.current;
    act(() => result.current.set(1, 10));
    hasNoChanges(result.current, prevResult);

    // `delete` non-existent
    act(() => result.current.setValue(new Map()));
    prevResult = result.current;
    act(() => result.current.delete(1));
    hasNoChanges(result.current, prevResult);

    // `clear` with size === 0
    act(() => result.current.setValue(new Map()));
    prevResult = result.current;
    act(() => result.current.clear());
    hasNoChanges(result.current, prevResult);

    // `setValue` with current map
    prevResult = result.current;
    act(() => result.current.setValue((x) => x));
    hasNoChanges(result.current, prevResult);
  });
});
