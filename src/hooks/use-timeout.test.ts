import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import { useTimeout } from "./use-timeout";

type UseTimeoutProps = Parameters<typeof useTimeout>;

describe("useTimeout", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should set up a timeout on mount, if `delay` is not null", () => {
    vi.spyOn(window, "setTimeout");

    renderHook(() => useTimeout(() => {}, 1000));

    expect(setTimeout).toHaveBeenCalled();
  });

  it("should not set up a timeout on mount, if `delay` is null", () => {
    vi.spyOn(window, "setTimeout");

    renderHook(() => useTimeout(() => {}, null));

    expect(setTimeout).not.toHaveBeenCalled();
  });

  it("should clear the old timeout when `delay` changes", () => {
    const callback = vi.fn();
    vi.spyOn(window, "clearTimeout");

    const { rerender } = renderHook(
      (props: UseTimeoutProps = [callback, 1000]) => useTimeout(...props),
    );

    expect(clearTimeout).not.toHaveBeenCalled();

    // Should clear old timeout
    act(() => {
      rerender([callback, null]);
    });
    expect(clearTimeout).toHaveBeenCalled();
  });

  it("should set up a new timeout when `delay` changes to a non-null value", () => {
    const callback = vi.fn();
    vi.spyOn(window, "setTimeout");
    vi.spyOn(window, "clearTimeout");

    const { rerender } = renderHook(
      (props: UseTimeoutProps = [callback, 1000]) => useTimeout(...props),
    );

    expect(setTimeout).toHaveBeenCalled();

    // Should clear old timeout and set up new timeout
    act(() => {
      rerender([callback, 500]);
    });
    expect(clearTimeout).toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledTimes(2);
  });

  it("should not set up a new timeout when `delay` changes to null", () => {
    const callback = vi.fn();
    vi.spyOn(window, "clearTimeout");
    vi.spyOn(window, "setTimeout");

    const { rerender } = renderHook(
      (props: UseTimeoutProps = [callback, 1000]) => useTimeout(...props),
    );

    expect(setTimeout).toHaveBeenCalled();

    // Should clear old timeout and not set up new timeout
    act(() => {
      rerender([callback, null]);
    });
    expect(clearTimeout).toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledTimes(1);
  });

  it("should not clear the timeout or set up a new timeout when `callback` changes", () => {
    const delay = 1000;
    vi.spyOn(window, "setTimeout");
    vi.spyOn(window, "clearTimeout");

    const { rerender } = renderHook(
      (props: UseTimeoutProps = [vi.fn(), delay]) => useTimeout(...props),
    );

    expect(setTimeout).toHaveBeenCalled();

    // Shouldn't clear old timeout or set up new one
    act(() => {
      rerender([vi.fn(), delay]);
    });
    expect(clearTimeout).not.toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledTimes(1);

    // Still shouldn't clear old timeout or set up new one
    act(() => {
      rerender([vi.fn(), delay]);
    });
    expect(clearTimeout).not.toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledTimes(1);
  });

  it("should run the callback function once after `delay` ms, if `delay` is not null", () => {
    const callback = vi.fn();
    const delay = 1000;
    vi.spyOn(window, "setTimeout");
    vi.spyOn(window, "clearTimeout");

    renderHook(() => useTimeout(callback, delay));

    expect(callback).toHaveBeenCalledTimes(0);

    // Shouldn't have ran after 1ms
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(0);

    // Shouldn't have ran after delay - 1 ms
    vi.advanceTimersByTime(delay - 2);
    expect(callback).toHaveBeenCalledTimes(0);

    // Should have ran 1 time after exactly delay ms
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);

    // Should have ran only 1 time between delay and delay * 2 ms
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);

    // Should have still ran only 1 time after delay * 2 ms
    vi.advanceTimersByTime(delay - 1);
    expect(callback).toHaveBeenCalledTimes(1);

    // Should have still ran only 1 time after delay * 7 ms
    vi.advanceTimersByTime(delay * 5);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should reset the timeout delay if `delay` changes to a non-null value", () => {
    const callback = vi.fn();

    const { rerender } = renderHook(
      (props: UseTimeoutProps = [callback, 1000]) => useTimeout(...props),
    );

    expect(callback).toHaveBeenCalledTimes(0);

    // 700ms - shouldn't have run since delay hasn't passed
    vi.advanceTimersByTime(700);
    expect(callback).toHaveBeenCalledTimes(0);

    // 700ms - Change delay, reseting timeout delay
    rerender([callback, 500]);

    // 1000ms (300ms) - Shouldn't have run after original delay (1000ms)
    vi.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalledTimes(0);

    // 1200ms (500ms) - callback should have ran
    vi.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalledTimes(1);

    // 1700ms (1000ms) - callback should have still ran only 1 time
    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);

    // Set delay to null, which should not set up a timeout
    rerender([callback, null]);
    expect(callback).toHaveBeenCalledTimes(1);

    // 6700ms (5000ms) - callback should have ran 0 times during 10x previous delay
    vi.advanceTimersByTime(5000);
    expect(callback).toHaveBeenCalledTimes(1);

    // Set delay to defined, which should set up a new timeout
    rerender([callback, 300]);
    expect(callback).toHaveBeenCalledTimes(1);

    // 7000ms (300ms) - callback should have ran again, since `delay` change reset delay
    vi.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
