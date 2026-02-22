import { renderHook } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, test, vi } from "vitest";
import { useDebounce } from "./use-debounce";

type UseDebounceProps = Parameters<typeof useDebounce>;

describe("useDebounce", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it("should not call `callback` when called and instead call it after `delay` ms", () => {
    const callback = vi.fn();

    const { result } = renderHook((props: UseDebounceProps = [callback, 200]) =>
      useDebounce(...props),
    );

    result.current();
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

    const { result } = renderHook((props: UseDebounceProps = [callback, 200]) =>
      useDebounce(...props),
    );

    result.current();
    expect(callback).toHaveBeenCalledTimes(0);

    // 199ms - Delay hasn't passed. Should not have been called
    vi.advanceTimersByTime(199);
    expect(callback).toHaveBeenCalledTimes(0);

    // Call again, resetting delay back to 200ms
    result.current();

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

    const { result } = renderHook((props: UseDebounceProps = [callback, 200]) =>
      useDebounce(...props),
    );

    result.current(1);
    result.current(2);
    result.current(3);

    expect(callback).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(200);
    // Called only once with 3. The previous calls with 1/2 were negated by the latest call with 3.
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenNthCalledWith(1, 3);
  });

  test("that `isPending` function property returns whether a call is pending", () => {
    const { result } = renderHook((props: UseDebounceProps = [() => {}, 200]) =>
      useDebounce(...props),
    );

    // Starts with nothing pending
    expect(result.current.isPending()).toEqual(false);

    // 0ms - make call pending
    result.current();
    expect(result.current.isPending()).toEqual(true);

    // 199ms - still pending
    vi.advanceTimersByTime(199);
    expect(result.current.isPending()).toEqual(true);

    // 200ms - no longer pending
    vi.advanceTimersByTime(1);
    expect(result.current.isPending()).toEqual(false);

    // 200m (0ms) - make call pending
    result.current();
    expect(result.current.isPending()).toEqual(true);

    // 399 (199ms) - still pending
    vi.advanceTimersByTime(199);
    expect(result.current.isPending()).toEqual(true);

    // reset pending call
    result.current();
    // 400 (1ms) - still pending
    vi.advanceTimersByTime(1);
    expect(result.current.isPending()).toEqual(true);

    // 599 (200ms) - no longer pending
    vi.advanceTimersByTime(199);
    expect(result.current.isPending()).toEqual(false);
  });

  test("that `clear` function property cancels call, if one is pending", () => {
    const callback = vi.fn();

    const { result } = renderHook((props: UseDebounceProps = [callback, 200]) =>
      useDebounce(...props),
    );

    // 0ms - start pending callback
    result.current();
    expect(callback).toHaveBeenCalledTimes(0);

    // 199ms - still shouldn't have been called
    vi.advanceTimersByTime(199);
    expect(callback).toHaveBeenCalledTimes(0);

    // Cancel pending call
    result.current.cancel();
    expect(callback).toHaveBeenCalledTimes(0);

    // 200ms - shouldn't have been called due to being cancelled
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(0);

    // Call debounced function multiple times (to reset it), then cancel it
    result.current();
    vi.advanceTimersByTime(100);
    result.current();
    vi.advanceTimersByTime(100);
    result.current();
    vi.advanceTimersByTime(100);

    // 500ms (100ms) - shouldn't have been called
    expect(callback).toHaveBeenCalledTimes(0);

    // Cancel pending call
    result.current.cancel();
    expect(callback).toHaveBeenCalledTimes(0);

    // 600ms (200ms) - shouldn't have been called due to being cancelled
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(0);

    // Finally, check that calling `cancel` doesn't interfere with future uncancelled calls
    result.current();
    expect(callback).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("that `flush` function property makes pending call run immediately, if one is pending", () => {
    const callback = vi.fn();

    const { result } = renderHook((props: UseDebounceProps = [callback, 200]) =>
      useDebounce(...props),
    );

    // 0ms - start pending callback
    result.current();
    expect(callback).toHaveBeenCalledTimes(0);

    // 100ms - shouldn't have been called
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(0);

    // Calls pending call immediately
    result.current.flush();
    expect(callback).toHaveBeenCalledTimes(1);

    // 200ms - shouldn't have been called due to being "flushed" earlier
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);

    // If called multiple times within delay, the latest arguments should be used when `flush` is called
    result.current(1);
    result.current(2);
    result.current(3);
    result.current.flush();
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(2, 3);
  });

  test("that `immediate` function property calls callback immediately (like a non-debounced function)", () => {
    const callback = vi.fn();

    const { result } = renderHook((props: UseDebounceProps = [callback, 200]) =>
      useDebounce(...props),
    );

    // Runs callback immediately with given arguments
    result.current.immediate(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenNthCalledWith(1, 1);

    // Should not interfere with existing pending call...
    result.current("pending");
    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    result.current.immediate("immediate");
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(2, "immediate");

    // Should now run pending call, which `immediate` call shouldn't have interfered with
    // With the correct arguments - the arguments from the latest debounced function call
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(3, "pending");
  });

  test("that the result is memoized", () => {
    const delay = 200;
    const callback = vi.fn();
    const callback2 = vi.fn();

    const { result, rerender } = renderHook(
      (props: UseDebounceProps = [callback, delay]) => useDebounce(...props),
    );

    let latestResult = result.current;

    // All references should remain the same when rerendering with same props
    rerender();
    expect(result.current).toBe(latestResult);
    expect(result.current.isPending).toBe(latestResult.isPending);
    expect(result.current.cancel).toBe(latestResult.cancel);
    expect(result.current.flush).toBe(latestResult.flush);
    expect(result.current.immediate).toBe(latestResult.immediate);

    // All references should change when `callback` prop changes
    latestResult = result.current;
    rerender([callback2, delay]);
    expect(result.current).not.toBe(latestResult);
    expect(result.current.isPending).not.toBe(latestResult.isPending);
    expect(result.current.cancel).not.toBe(latestResult.cancel);
    expect(result.current.flush).not.toBe(latestResult.flush);
    expect(result.current.immediate).not.toBe(latestResult.immediate);

    // All references should change when `delay` prop changes
    latestResult = result.current;
    rerender([callback2, 100]);
    expect(result.current).not.toBe(latestResult);
    expect(result.current.isPending).not.toBe(latestResult.isPending);
    expect(result.current.cancel).not.toBe(latestResult.cancel);
    expect(result.current.flush).not.toBe(latestResult.flush);
    expect(result.current.immediate).not.toBe(latestResult.immediate);
  });
});
