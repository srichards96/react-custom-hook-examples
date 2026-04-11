import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "./use-debounced-value";
import { renderHook } from "@testing-library/react";
import { act } from "react";

type UseDebouncedValueProps<T> = Parameters<typeof useDebouncedValue<T>>;

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should use `value` as the initial value", () => {
    const value = 10;

    const { result } = renderHook(
      (props: UseDebouncedValueProps<number> = [value, 200]) =>
        useDebouncedValue(...props),
    );

    expect(result.current).toBe(value);
  });

  it("should update value after `delay` when `value` changes, if `delay` is not null or negative", () => {
    const value1 = 10;
    const value2 = 20;
    const delay = 200;

    const { result, rerender } = renderHook(
      (props: UseDebouncedValueProps<number> = [value1, delay]) =>
        useDebouncedValue(...props),
    );

    expect(result.current).toBe(value1);

    rerender([value2, delay]);
    expect(result.current).toBe(value1);

    act(() => vi.advanceTimersByTime(delay - 1));
    expect(result.current).toBe(value1);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(value2);
  });

  it("should reset delay when `value` changes, if `delay` is not null or negative", () => {
    const value1 = 10;
    const value2 = 20;
    const value3 = 30;
    const delay = 200;

    const { result, rerender } = renderHook(
      (props: UseDebouncedValueProps<number> = [value1, delay]) =>
        useDebouncedValue(...props),
    );

    expect(result.current).toBe(value1);

    rerender([value2, delay]);
    expect(result.current).toBe(value1);

    act(() => vi.advanceTimersByTime(delay - 1));
    expect(result.current).toBe(value1);

    rerender([value3, delay]);
    expect(result.current).toBe(value1);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(value1);

    act(() => vi.advanceTimersByTime(delay - 2));
    expect(result.current).toBe(value1);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(value3);
  });

  it("should reset delay when `delay` changes to a positive value", () => {
    const value1 = 10;
    const value2 = 20;
    const delay1 = 200;
    const delay2 = 400;

    const { result, rerender } = renderHook(
      (props: UseDebouncedValueProps<number> = [value1, delay1]) =>
        useDebouncedValue(...props),
    );

    expect(result.current).toBe(value1);

    rerender([value2, delay1]);
    expect(result.current).toBe(value1);

    act(() => vi.advanceTimersByTime(delay1 - 1));
    expect(result.current).toBe(value1);

    rerender([value2, delay2]);
    expect(result.current).toBe(value1);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(value1);

    act(() => vi.advanceTimersByTime(delay2 - 2));
    expect(result.current).toBe(value1);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(value2);
  });

  it("should update value immediately when `value` changes, if `delay` is null or negative", () => {
    const value1 = 10;
    const value2 = 20;

    const { result, rerender } = renderHook(
      (props: UseDebouncedValueProps<number> = [value1, null]) =>
        useDebouncedValue(...props),
    );

    expect(result.current).toBe(value1);

    rerender([value2, null]);
    expect(result.current).toBe(value2);
  });

  it("should update value immediately when when `delay` changes to null or a negative value", () => {
    const value1 = 10;
    const value2 = 20;
    const delay = 200;

    const { result, rerender } = renderHook(
      (props: UseDebouncedValueProps<number> = [value1, delay]) =>
        useDebouncedValue(...props),
    );

    expect(result.current).toBe(value1);

    rerender([value2, delay]);
    expect(result.current).toBe(value1);

    rerender([value2, null]);
    expect(result.current).toBe(value2);
  });
});
