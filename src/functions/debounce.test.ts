import { afterAll, beforeAll, describe, expect, it, test, vi } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it("should not call `callback` when called and instead call it after `delay` ms", () => {
    const callback = vi.fn();

    const debouncedCallback = debounce(callback, 200);

    debouncedCallback();
    expect(callback).toHaveBeenCalledTimes(0);

    // 199ms - Delay hasn't passed. Should not have been called
    vi.advanceTimersByTime(199);
    expect(callback).toHaveBeenCalledTimes(0);

    // 200ms - Delay has passed. Should have been called
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should reset delay if called before the previous delay has passed", () => {
    const callback = vi.fn();

    const debouncedCallback = debounce(callback, 200);

    debouncedCallback();
    expect(callback).toHaveBeenCalledTimes(0);

    // 199ms - Delay hasn't passed. Should not have been called
    vi.advanceTimersByTime(199);
    expect(callback).toHaveBeenCalledTimes(0);

    // Call again, resetting delay back to 200ms
    debouncedCallback();

    // 200ms (1ms) - Delay hasn't passed. Should not have been called
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(0);

    // 398ms (199ms) - Delay hasn't passed. Should not have been called
    vi.advanceTimersByTime(198);
    expect(callback).toHaveBeenCalledTimes(0);

    // 399ms (200ms) - Delay has passed. Should have been called
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should call `callback` with latest arguments when called multiple times within delay", () => {
    const callback = vi.fn();

    const debouncedCallback = debounce(callback, 200);

    debouncedCallback(1);
    debouncedCallback(2);
    debouncedCallback(3);

    expect(callback).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(200);
    // Called only once with 3. The previous calls with 1/2 were negated by the latest call with 3.
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenNthCalledWith(1, 3);
  });

  test("that `isPending` function property returns whether a call is pending", () => {
    const debouncedCallback = debounce(() => {}, 200);

    // Starts with nothing pending
    expect(debouncedCallback.isPending()).toEqual(false);

    // 0ms - make call pending
    debouncedCallback();
    expect(debouncedCallback.isPending()).toEqual(true);

    // 199ms - still pending
    vi.advanceTimersByTime(199);
    expect(debouncedCallback.isPending()).toEqual(true);

    // 200ms - no longer pending
    vi.advanceTimersByTime(1);
    expect(debouncedCallback.isPending()).toEqual(false);

    // 200m (0ms) - make call pending
    debouncedCallback();
    expect(debouncedCallback.isPending()).toEqual(true);

    // 399 (199ms) - still pending
    vi.advanceTimersByTime(199);
    expect(debouncedCallback.isPending()).toEqual(true);

    // reset pending call
    debouncedCallback();
    // 400 (1ms) - still pending
    vi.advanceTimersByTime(1);
    expect(debouncedCallback.isPending()).toEqual(true);

    // 599 (200ms) - no longer pending
    vi.advanceTimersByTime(199);
    expect(debouncedCallback.isPending()).toEqual(false);
  });

  test("that `cancel` function property cancels call, if one is pending", () => {
    const callback = vi.fn();

    const debouncedCallback = debounce(callback, 200);

    // 0ms - start pending callback
    debouncedCallback();
    expect(callback).toHaveBeenCalledTimes(0);

    // 199ms - still shouldn't have been called
    vi.advanceTimersByTime(199);
    expect(callback).toHaveBeenCalledTimes(0);

    // Cancel pending call
    debouncedCallback.cancel();
    expect(callback).toHaveBeenCalledTimes(0);

    // 200ms - shouldn't have been called due to being cancelled
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(0);

    // Call debounced function multiple times (to reset it), then cancel it
    debouncedCallback();
    vi.advanceTimersByTime(100);
    debouncedCallback();
    vi.advanceTimersByTime(100);
    debouncedCallback();
    vi.advanceTimersByTime(100);

    // 500ms (100ms) - shouldn't have been called
    expect(callback).toHaveBeenCalledTimes(0);

    // Cancel pending call
    debouncedCallback.cancel();
    expect(callback).toHaveBeenCalledTimes(0);

    // 600ms (200ms) - shouldn't have been called due to being cancelled
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(0);

    // Finally, check that calling `cancel` doesn't interfere with future uncancelled calls
    debouncedCallback();
    expect(callback).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("that `flush` function property makes pending call run immediately, if one is pending", () => {
    const callback = vi.fn();

    const debouncedCallback = debounce(callback, 200);

    // 0ms - start pending callback
    debouncedCallback();
    expect(callback).toHaveBeenCalledTimes(0);

    // 100ms - shouldn't have been called
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(0);

    // Calls pending call immediately
    debouncedCallback.flush();
    expect(callback).toHaveBeenCalledTimes(1);

    // 200ms - shouldn't have been called due to being "flushed" earlier
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);

    // If called multiple times within delay, the latest arguments should be used when `flush` is called
    debouncedCallback(1);
    debouncedCallback(2);
    debouncedCallback(3);
    debouncedCallback.flush();
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(2, 3);
  });

  test("that `immediate` function property calls callback immediately (like a non-debounced function)", () => {
    const callback = vi.fn();

    const debouncedCallback = debounce(callback, 200);

    // Runs callback immediately with given arguments
    debouncedCallback.immediate(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenNthCalledWith(1, 1);

    // Should not interfere with existing pending call...
    debouncedCallback("pending");
    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    debouncedCallback.immediate("immediate");
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(2, "immediate");

    // Should now run pending call, which `immediate` call shouldn't have interfered with
    // With the correct arguments - the arguments from the latest debounced function call
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(3, "pending");
  });
});
