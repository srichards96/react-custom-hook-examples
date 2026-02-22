import { afterAll, beforeAll, describe, expect, it, test, vi } from "vitest";
import { throttle } from "./throttle";

describe("throttle", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it("should call `callback` when called, if not throttling", () => {
    const callback = vi.fn();

    const throttledCallback = throttle(callback, 200);

    // Should run callback immediate and set it as throttled for delay
    throttledCallback(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenNthCalledWith(1, 1);

    // 0ms - shouldn't run due to being throttled
    throttledCallback(2);
    expect(callback).toHaveBeenCalledTimes(1);

    // 199ms - shouldn't run due to being throttled
    vi.advanceTimersByTime(199);
    throttledCallback(3);
    expect(callback).toHaveBeenCalledTimes(1);

    // 200ms - shouldn't not automatically run previous throttled calls at end of throttle delay
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);

    // 200ms - should run since throttle delay is over
    throttledCallback(4);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(2, 4);
  });

  test("that `isThrottled` function property returns whether function is being throttled", () => {
    const throttledCallback = throttle(() => {}, 200);

    // Start with function not throttled
    expect(throttledCallback.isThrottled()).toEqual(false);

    // 0ms - make function throttled
    throttledCallback();
    expect(throttledCallback.isThrottled()).toEqual(true);

    // 199ms - still throttled
    vi.advanceTimersByTime(199);
    expect(throttledCallback.isThrottled()).toEqual(true);

    // 200ms - no longer throttled
    vi.advanceTimersByTime(1);
    expect(throttledCallback.isThrottled()).toEqual(false);
  });

  test("that `cancel` function property stops the function from being throttled", () => {
    const callback = vi.fn();

    const throttledCallback = throttle(callback, 200);

    throttledCallback();
    expect(callback).toHaveBeenCalledTimes(1);

    // These are ignored, since function is throttled
    throttledCallback();
    throttledCallback();
    throttledCallback();
    expect(callback).toHaveBeenCalledTimes(1);

    // Should stop function from being throttled, so it can run again
    throttledCallback.cancel();
    throttledCallback();
    expect(callback).toHaveBeenCalledTimes(2);

    // Finally, check that calling `cancel` doesn't interfere with throttling of future calls
    vi.advanceTimersByTime(200);
    throttledCallback();
    expect(callback).toHaveBeenCalledTimes(3);
  });

  test("that `force` function property runs function immediately and resets throttle period", () => {
    const callback = vi.fn();

    const throttledCallback = throttle(callback, 200);

    // If not throttling, `force` function acts same as regular non-throttled call
    throttledCallback.force();
    expect(callback).toHaveBeenCalledTimes(1);

    // 50ms - `force` should run function, even though it's throttled, and reset throttle delay
    vi.advanceTimersByTime(50);
    throttledCallback.force();
    expect(callback).toHaveBeenCalledTimes(2);

    // 200ms - function should still be throttled, since the delay was reset at 50ms (ends at 250ms)
    vi.advanceTimersByTime(150);
    throttledCallback();
    expect(callback).toHaveBeenCalledTimes(2);

    // 250ms - function should no longer be throttled
    vi.advanceTimersByTime(50);
    throttledCallback();
    expect(callback).toHaveBeenCalledTimes(3);
  });

  test("that `immediate` function property runs function immediately without affected throttled status", () => {
    const callback = vi.fn();

    const throttledCallback = throttle(callback, 200);

    // 0ms - should run
    throttledCallback();
    expect(callback).toHaveBeenCalledTimes(1);

    // 50ms - `immediate` should run function, even though it's throttled, and not change throttle delay
    vi.advanceTimersByTime(50);
    throttledCallback.immediate();
    expect(callback).toHaveBeenCalledTimes(2);

    // 200ms - should run due to function no longer being throttled
    // - `immediate` call at 50ms shouldn't have changed throttle delay (to 250ms)
    vi.advanceTimersByTime(150);
    throttledCallback();
    expect(callback).toHaveBeenCalledTimes(3);
  });
});
