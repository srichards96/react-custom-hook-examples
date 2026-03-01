import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { useInterval } from "./use-interval";
import { renderHook } from "@testing-library/react";
import { act } from "react";

type UseIntervalProps = Parameters<typeof useInterval>;

describe("useInterval", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should set up an interval on mount, if `delay` is not null", () => {
    vi.spyOn(window, "setInterval");

    renderHook(() => useInterval(() => {}, 1000));

    expect(setInterval).toHaveBeenCalled();
  });

  it("should not set up an interval on mount, if `delay` is null", () => {
    vi.spyOn(window, "setInterval");

    renderHook(() => useInterval(() => {}, null));

    expect(setInterval).not.toHaveBeenCalled();
  });

  it("should clear the old interval when `delay` changes", () => {
    const callback = vi.fn();
    vi.spyOn(window, "clearInterval");

    const { rerender } = renderHook(
      (props: UseIntervalProps = [callback, 1000]) => useInterval(...props),
    );

    expect(clearInterval).not.toHaveBeenCalled();

    // Should clear old interval
    act(() => {
      rerender([callback, null]);
    });
    expect(clearInterval).toHaveBeenCalled();
  });

  it("should set up a new interval when `delay` changes to a non-null value", () => {
    const callback = vi.fn();
    vi.spyOn(window, "setInterval");
    vi.spyOn(window, "clearInterval");

    const { rerender } = renderHook(
      (props: UseIntervalProps = [callback, 1000]) => useInterval(...props),
    );

    expect(setInterval).toHaveBeenCalled();

    // Should clear old interval and set up new interval
    act(() => {
      rerender([callback, 500]);
    });
    expect(clearInterval).toHaveBeenCalled();
    expect(setInterval).toHaveBeenCalledTimes(2);
  });

  it("should not set up a new interval when `delay` changes to null", () => {
    const callback = vi.fn();
    vi.spyOn(window, "clearInterval");
    vi.spyOn(window, "setInterval");

    const { rerender } = renderHook(
      (props: UseIntervalProps = [callback, 1000]) => useInterval(...props),
    );

    expect(setInterval).toHaveBeenCalled();

    // Should clear old interval and not set up new interval
    act(() => {
      rerender([callback, null]);
    });
    expect(clearInterval).toHaveBeenCalled();
    expect(setInterval).toHaveBeenCalledTimes(1);
  });

  it("should not clear the interval or set up a new interval when `callback` changes", () => {
    const delay = 1000;
    vi.spyOn(window, "setInterval");
    vi.spyOn(window, "clearInterval");

    const { rerender } = renderHook(
      (props: UseIntervalProps = [vi.fn(), delay]) => useInterval(...props),
    );

    expect(setInterval).toHaveBeenCalled();

    // Shouldn't clear old interval or set up new one
    act(() => {
      rerender([vi.fn(), delay]);
    });
    expect(clearInterval).not.toHaveBeenCalled();
    expect(setInterval).toHaveBeenCalledTimes(1);

    // Still shouldn't clear old interval or set up new one
    act(() => {
      rerender([vi.fn(), delay]);
    });
    expect(clearInterval).not.toHaveBeenCalled();
    expect(setInterval).toHaveBeenCalledTimes(1);
  });

  it("should run the callback function every `delay` ms, if `delay` is not null", () => {
    const callback = vi.fn();
    const delay = 1000;
    vi.spyOn(window, "setInterval");
    vi.spyOn(window, "clearInterval");

    renderHook(() => useInterval(callback, delay));

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

    // Should have ran 2 times after delay * 2 ms
    vi.advanceTimersByTime(delay - 1);
    expect(callback).toHaveBeenCalledTimes(2);

    // Should have ran 7 times after delay * 7 ms
    vi.advanceTimersByTime(delay * 5);
    expect(callback).toHaveBeenCalledTimes(7);
  });

  it("should reset the interval delay if `delay` changes to a non-null value", () => {
    const callback = vi.fn();

    const { rerender } = renderHook(
      (props: UseIntervalProps = [callback, 1000]) => useInterval(...props),
    );

    expect(callback).toHaveBeenCalledTimes(0);

    // Shouldn't have run before delay ms (1000)
    vi.advanceTimersByTime(700);
    expect(callback).toHaveBeenCalledTimes(0);

    // Change delay (should reset interval)
    rerender([callback, 500]);

    // Shouldn't have run after original delay ms (1000)
    // Since delay was set to 500ms after 700ms, so it should run 500ms after 700ms
    vi.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalledTimes(0);

    // After 1200ms, callback should have ran
    vi.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalledTimes(1);

    // After 1700ms (1000ms since new 500ms delay at 700ms), should have ran 2 times
    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(2);

    // After 2100ms (1400ms since new 500ms delay at 700ms), should still have ran 2 times
    vi.advanceTimersByTime(400);
    expect(callback).toHaveBeenCalledTimes(2);

    // Change delay (should reset interval)
    rerender([callback, 1000]);

    // Shouldn't have run after previous delay ms (500)
    // Since delay was set to 1000ms at 2100ms, so it should run 1000ms after 2100ms
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(2);

    // After 3100ms (1000ms since new 1000ms delay at 2100ms), should have ran 3 times
    vi.advanceTimersByTime(900);
    expect(callback).toHaveBeenCalledTimes(3);
  });
});
