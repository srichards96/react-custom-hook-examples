import { describe, expect, it, vi } from "vitest";
import { useOnValueChange } from "./use-on-value-change";
import { renderHook } from "@testing-library/react";

type UseOnValueChangeProps<T> = Parameters<typeof useOnValueChange<T>>;

describe("useOnValueChange", () => {
  it("should not run `callback` on mount", () => {
    const callback = vi.fn();

    renderHook((props: UseOnValueChangeProps<number> = [0, callback]) =>
      useOnValueChange(...props),
    );

    expect(callback).toHaveBeenCalledTimes(0);
  });

  it("should not run `callback` on rerender if `value` has not changed", () => {
    const callback = vi.fn();

    const { rerender } = renderHook(
      (props: UseOnValueChangeProps<number> = [0, callback]) =>
        useOnValueChange(...props),
    );

    expect(callback).toHaveBeenCalledTimes(0);

    rerender([0, callback]);
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it("should run `callback` on rerender if `value` has changed", () => {
    const callback = vi.fn();

    const { rerender } = renderHook(
      (props: UseOnValueChangeProps<number> = [0, callback]) =>
        useOnValueChange(...props),
    );

    expect(callback).toHaveBeenCalledTimes(0);

    // Change
    rerender([1, callback]);
    expect(callback).toHaveBeenCalledTimes(1);

    // Change
    rerender([2, callback]);
    expect(callback).toHaveBeenCalledTimes(2);

    // No change
    rerender([2, callback]);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("should not run `callback` on rerender if `callback` has changed", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(
      (props: UseOnValueChangeProps<number> = [0, callback1]) =>
        useOnValueChange(...props),
    );

    expect(callback1).toHaveBeenCalledTimes(0);
    expect(callback2).toHaveBeenCalledTimes(0);

    rerender([0, callback2]);

    expect(callback1).toHaveBeenCalledTimes(0);
    expect(callback2).toHaveBeenCalledTimes(0);
  });

  it("should use reference equality to determine if `value` has changed", () => {
    type Obj = { a: number };
    const obj1: Obj = { a: 1 };
    const obj2: Obj = { a: 2 };

    const callback = vi.fn();

    const { rerender } = renderHook(
      (props: UseOnValueChangeProps<Obj> = [obj1, callback]) =>
        useOnValueChange(...props),
    );

    expect(callback).toHaveBeenCalledTimes(0);

    // Same reference - not called
    rerender([obj1, callback]);
    expect(callback).toHaveBeenCalledTimes(0);

    // Same reference in different variable - not called
    const obj1SameRefDifferentVar = obj1;
    rerender([obj1SameRefDifferentVar, callback]);
    expect(callback).toHaveBeenCalledTimes(0);

    // Different reference - called
    rerender([obj2, callback]);
    expect(callback).toHaveBeenCalledTimes(1);

    // Same value but different reference - called
    rerender([structuredClone(obj2), callback]);
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
