import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useArray } from "./use-array";
import { act } from "react";

describe("useArray", () => {
  it("use `initialValue` as the initial value", () => {
    const initialValue = [1, 2, 3];

    const { result } = renderHook(() => useArray(initialValue));

    expect(result.current.value).toEqual(initialValue);
  });

  it("should not change `value` when `initialValue` changes", () => {
    const initialValue = [1, 2, 3];

    const { result, rerender } = renderHook(() => useArray(initialValue));

    // Should not change result `value`
    const initialValue2 = [7, 8, 9];
    rerender(initialValue2);

    expect(result.current.value).toEqual(initialValue);
  });

  it("should add the specified `items` to the end of the array when `push` is called", () => {
    const { result } = renderHook(() => useArray([1, 2, 3, 4, 5]));

    // Add 1 item
    act(() => {
      result.current.push(6);
    });
    expect(result.current.value).toEqual([1, 2, 3, 4, 5, 6]);

    // Add multiple items
    act(() => {
      result.current.push(7, 8, 9);
    });
    expect(result.current.value).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    // Multiple calls in 1 render
    act(() => {
      result.current.push(10);
      result.current.push(11);
      result.current.push(12);
    });
    expect(result.current.value).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
  });

  it("should remove the last element from the array when `pop` is called", () => {
    const { result } = renderHook(() => useArray([1, 2, 3, 4, 5]));

    // Single call in 1 render
    act(() => {
      result.current.pop();
    });
    expect(result.current.value).toEqual([1, 2, 3, 4]);

    // Multiple calls in 1 render
    act(() => {
      result.current.pop();
      result.current.pop();
      result.current.pop();
    });
    expect(result.current.value).toEqual([1]);
  });

  it("should add the specified `items` to the start of the array when `unshift` is called", () => {
    const { result } = renderHook(() => useArray([1, 2, 3, 4, 5]));

    // Add 1 item
    act(() => {
      result.current.unshift(9);
    });
    expect(result.current.value).toEqual([9, 1, 2, 3, 4, 5]);

    // Add multiple items
    act(() => {
      result.current.unshift(6, 7, 8);
    });
    expect(result.current.value).toEqual([6, 7, 8, 9, 1, 2, 3, 4, 5]);

    // Multiple calls in 1 render
    act(() => {
      result.current.unshift(5);
      result.current.unshift(4);
      result.current.unshift(3);
    });
    expect(result.current.value).toEqual([3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5]);
  });

  it("should remove the first element from the list when `shift` is called", () => {
    const { result } = renderHook(() => useArray([1, 2, 3, 4, 5]));

    // Single call in 1 render
    act(() => {
      result.current.shift();
    });
    expect(result.current.value).toEqual([2, 3, 4, 5]);

    // Multiple calls in 1 render
    act(() => {
      result.current.shift();
      result.current.shift();
      result.current.shift();
    });
    expect(result.current.value).toEqual([5]);
  });

  it("should add the specified `items` to the array starting the specified `index` when `insertAt` is called", () => {
    const { result } = renderHook(() => useArray([1, 2, 3, 4, 5]));

    // Single call in 1 render
    act(() => {
      result.current.insertAt(1, 1.1, 1.2, 1.3);
    });
    expect(result.current.value).toEqual([1, 1.1, 1.2, 1.3, 2, 3, 4, 5]);

    // Multiple calls in 1 render
    act(() => {
      result.current.insertAt(1, 1.03);
      result.current.insertAt(1, 1.02);
      result.current.insertAt(1, 1.01);
    });
    expect(result.current.value).toEqual([
      1, 1.01, 1.02, 1.03, 1.1, 1.2, 1.3, 2, 3, 4, 5,
    ]);
  });

  it("should remove `count` `items` from the array starting the specified `index` when `removeAt` is called", () => {
    const { result } = renderHook(() => useArray([1, 2, 3, 4, 5, 6, 7, 8, 9]));

    // Remove 1 item
    act(() => {
      result.current.removeAt(1, 1);
    });
    expect(result.current.value).toEqual([1, 3, 4, 5, 6, 7, 8, 9]);

    // Remove multiple items
    act(() => {
      result.current.removeAt(1, 3);
    });
    expect(result.current.value).toEqual([1, 6, 7, 8, 9]);

    // Multiple calls in 1 render
    act(() => {
      result.current.removeAt(1, 1);
      result.current.removeAt(1, 1);
      result.current.removeAt(1, 1);
    });
    expect(result.current.value).toEqual([1, 9]);
  });

  it("should set all elements of the array between index `start` and `end` to `value` when `fill` is called", () => {
    const { result } = renderHook(() => useArray([1, 2, 3, 4, 5, 6, 7, 8, 9]));

    // Fill entire list
    act(() => {
      result.current.fill(0);
    });
    expect(result.current.value).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);

    // Fill between indices
    act(() => {
      result.current.fill(1, 1, 4);
    });
    expect(result.current.value).toEqual([0, 1, 1, 1, 0, 0, 0, 0, 0]);

    // Multiple calls in 1 render
    act(() => {
      result.current.fill(2, 1, 4);
      result.current.fill(3, 2, 5);
      result.current.fill(4, 3, 6);
    });
    expect(result.current.value).toEqual([0, 2, 3, 4, 4, 4, 0, 0, 0]);
  });

  it("should reverse the order of elements of the array when `reverse` is called", () => {
    const { result } = renderHook(() => useArray([1, 2, 3, 4, 5, 6, 7, 8, 9]));

    // Reverse 1 time in 1 render
    act(() => {
      result.current.reverse();
    });
    expect(result.current.value).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);

    // Reverse 2 times in 1 render (reverse and then undo)
    act(() => {
      result.current.reverse();
      result.current.reverse();
    });
    expect(result.current.value).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
  });

  it("should sort elements of the array using the given `compareFn` when `sort` is called", () => {
    const { result } = renderHook(() => useArray([3, 20, 100]));

    // Sort using default compareFn (alphabetical sort...)
    act(() => {
      result.current.sort();
    });
    expect(result.current.value).toEqual([100, 20, 3]);

    // Sort using a defined ascending number compareFn
    act(() => {
      result.current.sort((a, z) => a - z);
    });
    expect(result.current.value).toEqual([3, 20, 100]);

    // Sort multiple times in 1 render
    act(() => {
      result.current.sort(); // Alphabetical
      result.current.sort((a, z) => a - z); // Ascending number
      result.current.sort((a, z) => z - a); // Descending number
    });
    expect(result.current.value).toEqual([100, 20, 3]);
  });
});
