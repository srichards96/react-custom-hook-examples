import { renderHook } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, test, vi } from "vitest";
import { useThrottle } from "./use-throttle";

type UseThrottleProps = Parameters<typeof useThrottle>;

describe("useDebounce", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it("should call `callback` when called, if not throttling", () => {
    const callback = vi.fn();

    const { result } = renderHook((props: UseThrottleProps = [callback, 200]) =>
      useThrottle(...props),
    );

    // Should run callback immediate and set it as throttled for delay
    result.current(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenNthCalledWith(1, 1);

    // 0ms - shouldn't run due to being throttled
    result.current(2);
    expect(callback).toHaveBeenCalledTimes(1);

    // 199ms - shouldn't run due to being throttled
    vi.advanceTimersByTime(199);
    result.current(3);
    expect(callback).toHaveBeenCalledTimes(1);

    // 200ms - shouldn't not automatically run previous throttled calls at end of throttle delay
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);

    // 200ms - should run since throttle delay is over
    result.current(4);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(2, 4);
  });

  test("that `isThrottled` function property returns whether function is being throttled", () => {
    const { result } = renderHook((props: UseThrottleProps = [() => {}, 200]) =>
      useThrottle(...props),
    );

    // Start with function not throttled
    expect(result.current.isThrottled()).toEqual(false);

    // 0ms - make function throttled
    result.current();
    expect(result.current.isThrottled()).toEqual(true);

    // 199ms - still throttled
    vi.advanceTimersByTime(199);
    expect(result.current.isThrottled()).toEqual(true);

    // 200ms - no longer throttled
    vi.advanceTimersByTime(1);
    expect(result.current.isThrottled()).toEqual(false);
  });

  test("that `cancel` function property stops the function from being throttled", () => {
    const callback = vi.fn();

    const { result } = renderHook((props: UseThrottleProps = [callback, 200]) =>
      useThrottle(...props),
    );

    result.current();
    expect(callback).toHaveBeenCalledTimes(1);

    // These are ignored, since function is throttled
    result.current();
    result.current();
    result.current();
    expect(callback).toHaveBeenCalledTimes(1);

    // Should stop function from being throttled, so it can run again
    result.current.cancel();
    result.current();
    expect(callback).toHaveBeenCalledTimes(2);

    // Finally, check that calling `cancel` doesn't interfere with throttling of future calls
    vi.advanceTimersByTime(200);
    result.current();
    expect(callback).toHaveBeenCalledTimes(3);
  });

  test("that `force` function property runs function immediately and resets throttle period", () => {
    const callback = vi.fn();

    const { result } = renderHook((props: UseThrottleProps = [callback, 200]) =>
      useThrottle(...props),
    );

    // If not throttling, `force` function acts same as regular non-throttled call
    result.current.force();
    expect(callback).toHaveBeenCalledTimes(1);

    // 50ms - `force` should run function, even though it's throttled, and reset throttle delay
    vi.advanceTimersByTime(50);
    result.current.force();
    expect(callback).toHaveBeenCalledTimes(2);

    // 200ms - function should still be throttled, since the delay was reset at 50ms (ends at 250ms)
    vi.advanceTimersByTime(150);
    result.current();
    expect(callback).toHaveBeenCalledTimes(2);

    // 250ms - function should no longer be throttled
    vi.advanceTimersByTime(50);
    result.current();
    expect(callback).toHaveBeenCalledTimes(3);
  });

  test("that `immediate` function property runs function immediately without affected throttled status", () => {
    const callback = vi.fn();

    const { result } = renderHook((props: UseThrottleProps = [callback, 200]) =>
      useThrottle(...props),
    );

    // 0ms - should run
    result.current();
    expect(callback).toHaveBeenCalledTimes(1);

    // 50ms - `immediate` should run function, even though it's throttled, and not change throttle delay
    vi.advanceTimersByTime(50);
    result.current.immediate();
    expect(callback).toHaveBeenCalledTimes(2);

    // 200ms - should run due to function no longer being throttled
    // - `immediate` call at 50ms shouldn't have changed throttle delay (to 250ms)
    vi.advanceTimersByTime(150);
    result.current();
    expect(callback).toHaveBeenCalledTimes(3);
  });

  test("that the result is memoized", () => {
    const delay = 200;
    const callback = vi.fn();
    const callback2 = vi.fn();

    const { result, rerender } = renderHook(
      (props: UseThrottleProps = [callback, delay]) => useThrottle(...props),
    );

    let latestResult = result.current;

    // All references should remain the same when rerendering with same props
    rerender();
    expect(result.current).toBe(latestResult);
    expect(result.current.isThrottled).toBe(latestResult.isThrottled);
    expect(result.current.cancel).toBe(latestResult.cancel);
    expect(result.current.force).toBe(latestResult.force);
    expect(result.current.immediate).toBe(latestResult.immediate);

    // All references should change when `callback` prop changes
    latestResult = result.current;
    rerender([callback2, delay]);
    expect(result.current).not.toBe(latestResult);
    expect(result.current.isThrottled).not.toBe(latestResult.isThrottled);
    expect(result.current.cancel).not.toBe(latestResult.cancel);
    expect(result.current.force).not.toBe(latestResult.force);
    expect(result.current.immediate).not.toBe(latestResult.immediate);

    // All references should change when `delay` prop changes
    latestResult = result.current;
    rerender([callback2, 100]);
    expect(result.current).not.toBe(latestResult);
    expect(result.current.isThrottled).not.toBe(latestResult.isThrottled);
    expect(result.current.cancel).not.toBe(latestResult.cancel);
    expect(result.current.force).not.toBe(latestResult.force);
    expect(result.current.immediate).not.toBe(latestResult.immediate);
  });
});
