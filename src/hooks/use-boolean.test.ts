import { renderHook } from "@testing-library/react";
import { describe, expect, it, test } from "vitest";
import { useBoolean } from "./use-boolean";
import { act } from "react";

describe("useBoolean", () => {
  it("should use `initialState` as initial value", () => {
    const { result: result1 } = renderHook(() => useBoolean(false));
    expect(result1.current.value).toEqual(false);

    const { result: result2 } = renderHook(() => useBoolean(true));
    expect(result2.current.value).toEqual(true);
  });

  it("should ignore value of `initialState` after 1st render", () => {
    const { result, rerender } = renderHook((initialState: boolean = false) =>
      useBoolean(initialState),
    );
    expect(result.current.value).toEqual(false);

    rerender(true);
    expect(result.current.value).toEqual(false);
  });

  test("that `setValue` sets value to given value", () => {
    const { result } = renderHook(() => useBoolean(false));
    expect(result.current.value).toEqual(false);

    act(() => {
      result.current.setValue(true);
    });
    expect(result.current.value).toEqual(true);

    act(() => {
      result.current.setValue(false);
    });
    expect(result.current.value).toEqual(false);

    // Functional syntax to invert whatever the current value is
    const oldValue = result.current.value;
    act(() => {
      result.current.setValue((x) => !x);
    });
    expect(result.current.value).toEqual(!oldValue);
  });

  test("that `setTrue` sets value to true", () => {
    const { result } = renderHook(() => useBoolean(false));
    expect(result.current.value).toEqual(false);

    act(() => {
      result.current.setTrue();
    });
    expect(result.current.value).toEqual(true);
  });

  test("that `setFalse` sets value to false", () => {
    const { result } = renderHook(() => useBoolean(true));
    expect(result.current.value).toEqual(true);

    act(() => {
      result.current.setFalse();
    });
    expect(result.current.value).toEqual(false);
  });

  test("that `toggle` toggles value", () => {
    const { result } = renderHook(() => useBoolean(false));
    expect(result.current.value).toEqual(false);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.value).toEqual(true);

    // Should correctly handle multiple calls in sequence
    act(() => {
      result.current.toggle();
      result.current.toggle();
    });
    expect(result.current.value).toEqual(true);
  });

  test("that calling `setTrue`/`setFalse`/`toggle` multiple times in sequence works correctly", () => {
    const { result } = renderHook(() => useBoolean(false));
    expect(result.current.value).toEqual(false);

    act(() => {
      result.current.setTrue(); // true
      result.current.toggle(); // false
      result.current.toggle(); // true
      result.current.setFalse(); // false
      result.current.setValue((x) => !x); // true
      result.current.toggle(); // false
      result.current.setFalse(); // false
      result.current.toggle(); // true
    });
    expect(result.current.value).toEqual(true);
  });

  test("that result object and all properties are memoized", () => {
    const { result, rerender } = renderHook((initialState: boolean = false) =>
      useBoolean(initialState),
    );

    // All function properties should never change
    const firstResult = result.current;
    // Top-level object and `value` property will change if `value` changes
    let latestResult = result.current;

    const noFunctionPropertiesChanged = () => {
      expect(firstResult.setValue).toBe(result.current.setValue);
      expect(firstResult.setTrue).toBe(result.current.setTrue);
      expect(firstResult.setFalse).toBe(result.current.setFalse);
      expect(firstResult.toggle).toBe(result.current.toggle);
    };

    // Should not change on rerender
    rerender(false);
    expect(latestResult).toBe(result.current);
    expect(latestResult.value).toBe(result.current.value);
    noFunctionPropertiesChanged();

    // Changing `initialValue` after first render should not change anything
    latestResult = result.current;
    rerender(true);
    expect(latestResult).toBe(result.current);
    expect(latestResult.value).toBe(result.current.value);
    noFunctionPropertiesChanged();

    // All function properties should change top-level object and `value` property (if it changes `value`)
    // But not any function properties
    latestResult = result.current;
    act(() => result.current.setValue(true));
    expect(latestResult).not.toBe(result.current);
    expect(latestResult.value).not.toBe(result.current.value);
    noFunctionPropertiesChanged();

    latestResult = result.current;
    act(() => result.current.setFalse());
    expect(latestResult).not.toBe(result.current);
    expect(latestResult.value).not.toBe(result.current.value);
    noFunctionPropertiesChanged();

    latestResult = result.current;
    act(() => result.current.setTrue());
    expect(latestResult).not.toBe(result.current);
    expect(latestResult.value).not.toBe(result.current.value);
    noFunctionPropertiesChanged();

    latestResult = result.current;
    act(() => result.current.toggle());
    expect(latestResult).not.toBe(result.current);
    expect(latestResult.value).not.toBe(result.current.value);
    noFunctionPropertiesChanged();

    // No references should change if a function property is called, but it doesn't change `value`
    act(() => result.current.setTrue());
    latestResult = result.current;
    act(() => result.current.setTrue());
    expect(latestResult).toBe(result.current);
    expect(latestResult.value).toBe(result.current.value);
    noFunctionPropertiesChanged();

    act(() => result.current.setFalse());
    latestResult = result.current;
    act(() => result.current.setFalse());
    expect(latestResult).toBe(result.current);
    expect(latestResult.value).toBe(result.current.value);
    noFunctionPropertiesChanged();

    act(() => result.current.setFalse());
    latestResult = result.current;
    act(() => result.current.setValue(false));
    expect(latestResult).toBe(result.current);
    expect(latestResult.value).toBe(result.current.value);
    noFunctionPropertiesChanged();

    // Toggle always changes `value`...
  });
});
