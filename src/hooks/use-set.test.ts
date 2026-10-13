import { useSet } from "./use-set";
import { describe, expect, it, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import type { Primitive } from "../types/primitive";

type UseSetProps<T extends Primitive> = Parameters<typeof useSet<T>>;

describe("useSet", () => {
  it("should start empty if `initialState` is not provided", () => {
    const { result } = renderHook((props: UseSetProps<number> = [undefined]) =>
      useSet(...props),
    );

    expect(result.current.size).toEqual(0);
  });

  it("should start with `initialState` if provided as a value", () => {
    const { result } = renderHook((props: UseSetProps<number> = [[1, 2, 3]]) =>
      useSet(...props),
    );

    expect(result.current.size).toEqual(3);
    expect(result.current.has(1)).toEqual(true);
    expect(result.current.has(2)).toEqual(true);
    expect(result.current.has(3)).toEqual(true);
  });

  it("should start with result of `initialState` if provided as an initializer function", () => {
    const { result } = renderHook(
      (props: UseSetProps<number> = [() => [1, 2, 3]]) => useSet(...props),
    );

    expect(result.current.size).toEqual(3);
    expect(result.current.has(1)).toEqual(true);
    expect(result.current.has(2)).toEqual(true);
    expect(result.current.has(3)).toEqual(true);
  });

  test("that initializer form of `initialState` is run only on first render", () => {
    const initializer = vi.fn(() => [1, 2, 3]);

    expect(initializer).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (props: UseSetProps<number> = [initializer]) => useSet(...props),
    );

    // Called on initial render, to get value
    expect(initializer).toHaveBeenCalledTimes(1);

    // Not called on subsequent rerenders
    rerender();
    expect(initializer).toHaveBeenCalledTimes(1);

    rerender();
    expect(initializer).toHaveBeenCalledTimes(1);
  });

  it("should add specified `val` when `add` is called, if it is not in the set", () => {
    const { result } = renderHook((props: UseSetProps<number> = [undefined]) =>
      useSet(...props),
    );

    expect(result.current.size).toEqual(0);

    // Add 1
    act(() => result.current.add(1));
    expect(result.current.size).toEqual(1);
    expect(result.current.has(1)).toEqual(true);

    // Add 2
    act(() => result.current.add(2));
    expect(result.current.size).toEqual(2);
    expect(result.current.has(1)).toEqual(true);
    expect(result.current.has(2)).toEqual(true);

    // Re-add 2 (should do nothing)
    act(() => result.current.add(2));
    expect(result.current.size).toEqual(2);
    expect(result.current.has(1)).toEqual(true);
    expect(result.current.has(2)).toEqual(true);

    // Add 3, 4, 5 at once
    act(() => {
      result.current.add(3);
      result.current.add(4);
      result.current.add(5);
    });
    expect(result.current.size).toEqual(5);
    expect(result.current.has(1)).toEqual(true);
    expect(result.current.has(2)).toEqual(true);
    expect(result.current.has(3)).toEqual(true);
    expect(result.current.has(4)).toEqual(true);
    expect(result.current.has(5)).toEqual(true);
  });

  it("should delete specified `val` when `delete` is called, if it is in the set", () => {
    const { result } = renderHook(
      (props: UseSetProps<number> = [[1, 2, 3, 4, 5]]) => useSet(...props),
    );

    expect(result.current.size).toEqual(5);
    expect(result.current.has(1)).toEqual(true);
    expect(result.current.has(2)).toEqual(true);
    expect(result.current.has(3)).toEqual(true);
    expect(result.current.has(4)).toEqual(true);
    expect(result.current.has(5)).toEqual(true);

    // Remove 5
    act(() => result.current.delete(5));
    expect(result.current.size).toEqual(4);
    expect(result.current.has(1)).toEqual(true);
    expect(result.current.has(2)).toEqual(true);
    expect(result.current.has(3)).toEqual(true);
    expect(result.current.has(4)).toEqual(true);
    expect(result.current.has(5)).toEqual(false);

    // Remove 4
    act(() => result.current.delete(4));
    expect(result.current.size).toEqual(3);
    expect(result.current.has(1)).toEqual(true);
    expect(result.current.has(2)).toEqual(true);
    expect(result.current.has(3)).toEqual(true);
    expect(result.current.has(4)).toEqual(false);
    expect(result.current.has(5)).toEqual(false);

    // Remove 4 again (should do nothing)
    act(() => result.current.delete(4));
    expect(result.current.size).toEqual(3);
    expect(result.current.has(1)).toEqual(true);
    expect(result.current.has(2)).toEqual(true);
    expect(result.current.has(3)).toEqual(true);
    expect(result.current.has(4)).toEqual(false);
    expect(result.current.has(5)).toEqual(false);

    // Remove 3, 2, 1 at once
    act(() => {
      result.current.delete(3);
      result.current.delete(2);
      result.current.delete(1);
    });
    expect(result.current.size).toEqual(0);
    expect(result.current.has(1)).toEqual(false);
    expect(result.current.has(2)).toEqual(false);
    expect(result.current.has(3)).toEqual(false);
    expect(result.current.has(4)).toEqual(false);
    expect(result.current.has(5)).toEqual(false);
  });

  it("should return whether `val` is in the set when `has` is called", () => {
    const { result } = renderHook((props: UseSetProps<number> = [[1, 3, 5]]) =>
      useSet(...props),
    );

    expect(result.current.size).toEqual(3);
    expect(result.current.has(1)).toEqual(true);
    expect(result.current.has(2)).toEqual(false);
    expect(result.current.has(3)).toEqual(true);
    expect(result.current.has(4)).toEqual(false);
    expect(result.current.has(5)).toEqual(true);
  });

  it("should make set empty when `clear` is called", () => {
    const { result } = renderHook((props: UseSetProps<number> = [[1, 2, 3]]) =>
      useSet(...props),
    );

    expect(result.current.size).toEqual(3);

    // Calling clear should clear...
    act(() => result.current.clear());
    expect(result.current.size).toEqual(0);

    // Adding multiple values, then clearing, at once, should result in cleared set
    act(() => {
      result.current.add(1);
      result.current.add(2);
      result.current.add(3);
      result.current.clear();
    });
    expect(result.current.size).toEqual(0);

    // Clearing, then adding multiple values, at once, should result in values in set
    act(() => {
      result.current.add(1);
      result.current.add(2);
      result.current.add(3);
      result.current.clear();
      result.current.add(4);
      result.current.add(5);
    });
    expect(result.current.size).toEqual(2);
    expect(result.current.has(1)).toEqual(false);
    expect(result.current.has(2)).toEqual(false);
    expect(result.current.has(3)).toEqual(false);
    expect(result.current.has(4)).toEqual(true);
    expect(result.current.has(5)).toEqual(true);
  });

  test("that `size` is the number of elements in the set", () => {
    const { result } = renderHook((props: UseSetProps<number> = [[1, 2, 3]]) =>
      useSet(...props),
    );

    expect(result.current.size).toEqual(3);

    act(() => {
      result.current.add(4);
      result.current.add(5);
      result.current.add(6);
      // Shouldn't change size
      result.current.add(6);
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
    const { result } = renderHook((props: UseSetProps<number> = [undefined]) =>
      useSet(...props),
    );
    type Result = typeof result.current;

    // Expected changes for a mutative action (`add`/`delete`/`clear`/`setValue`)
    const hasExpectedChangesForMutate = (curr: Result, prev: Result) => {
      expect(curr).not.toBe(prev);
      expect(curr.value).not.toBe(prev.value);
      expect(curr.has).not.toBe(prev.has);
      // These should never change
      expect(curr.setValue).toBe(prev.setValue);
      expect(curr.add).toBe(prev.add);
      expect(curr.delete).toBe(prev.delete);
      expect(curr.clear).toBe(prev.clear);
    };

    // Expected changes (none...) for a non-mutative action (`has`)
    const hasNoChanges = (curr: Result, prev: Result) => {
      expect(curr).toBe(prev);
      expect(curr.value).toBe(prev.value);
      expect(curr.has).toBe(prev.has);
      expect(curr.setValue).toBe(prev.setValue);
      expect(curr.add).toBe(prev.add);
      expect(curr.delete).toBe(prev.delete);
      expect(curr.clear).toBe(prev.clear);
    };

    let prevResult = result.current;
    act(() => result.current.add(1));
    hasExpectedChangesForMutate(result.current, prevResult);

    prevResult = result.current;
    act(() => result.current.add(1));
    hasExpectedChangesForMutate(result.current, prevResult);

    prevResult = result.current;
    act(() => result.current.clear());
    hasExpectedChangesForMutate(result.current, prevResult);

    prevResult = result.current;
    act(() => result.current.setValue(new Set()));
    hasExpectedChangesForMutate(result.current, prevResult);

    // Calling `has` should change nothing
    prevResult = result.current;
    act(() => result.current.has(1));
    hasNoChanges(result.current, prevResult);
  });
});
