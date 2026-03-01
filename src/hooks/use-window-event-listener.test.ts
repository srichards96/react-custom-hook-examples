import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, renderHook } from "@testing-library/react";
import { useWindowEventListener } from "./use-window-event-listener";

type UseWindowEventListenerProps = Parameters<typeof useWindowEventListener>;

describe("useWindowEventListener", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should set up an event listener on mount", () => {
    vi.spyOn(window, "addEventListener");
    expect(window.addEventListener).toHaveBeenCalledTimes(0);

    renderHook((props: UseWindowEventListenerProps = ["click", () => {}]) =>
      useWindowEventListener(...props),
    );
    expect(window.addEventListener).toHaveBeenCalledTimes(1);
  });

  it("should remove event listener on unmount", () => {
    vi.spyOn(window, "removeEventListener");
    expect(window.removeEventListener).toHaveBeenCalledTimes(0);

    const { unmount } = renderHook(
      (props: UseWindowEventListenerProps = ["click", () => {}]) =>
        useWindowEventListener(...props),
    );
    expect(window.removeEventListener).toHaveBeenCalledTimes(0);

    unmount();
    expect(window.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it("should do nothing on rerender if no arguments have changed", () => {
    const handler = vi.fn();
    vi.spyOn(window, "addEventListener");
    vi.spyOn(window, "removeEventListener");
    expect(window.addEventListener).toHaveBeenCalledTimes(0);
    expect(window.removeEventListener).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (props: UseWindowEventListenerProps = ["click", handler]) =>
        useWindowEventListener(...props),
    );
    expect(window.addEventListener).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledTimes(0);

    // No change in props
    rerender(["click", handler]);
    expect(window.addEventListener).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledTimes(0);

    // And again...
    rerender(["click", handler]);
    expect(window.addEventListener).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledTimes(0);
  });

  it("should replace event listener when `type` has changed", () => {
    const handler = vi.fn();

    vi.spyOn(window, "addEventListener");
    vi.spyOn(window, "removeEventListener");
    expect(window.addEventListener).toHaveBeenCalledTimes(0);
    expect(window.removeEventListener).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (props: UseWindowEventListenerProps = ["click", handler]) =>
        useWindowEventListener(...props),
    );
    expect(window.addEventListener).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledTimes(0);

    // Change type (should call removeEventListener, then addEventListener)
    rerender(["keydown", handler]);
    expect(window.addEventListener).toHaveBeenCalledTimes(2);
    expect(window.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it("should not replace event listener when `handler` has changed", () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    vi.spyOn(window, "addEventListener");
    vi.spyOn(window, "removeEventListener");
    expect(window.addEventListener).toHaveBeenCalledTimes(0);
    expect(window.removeEventListener).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (props: UseWindowEventListenerProps = ["click", handler1]) =>
        useWindowEventListener(...props),
    );
    expect(window.addEventListener).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledTimes(0);

    // Change handler
    rerender(["click", handler2]);
    expect(window.addEventListener).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledTimes(0);

    // And again...
    rerender(["click", handler1]);
    expect(window.addEventListener).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledTimes(0);
  });

  it("should run the latest version of `handler` when the event fires", () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const { rerender } = renderHook(
      (props: UseWindowEventListenerProps = ["click", handler1]) =>
        useWindowEventListener(...props),
    );

    expect(handler1).toHaveBeenCalledTimes(0);
    expect(handler2).toHaveBeenCalledTimes(0);

    // Fire event with handler1
    fireEvent.click(window);
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(0);

    // Should work multiple times at once
    fireEvent.click(window);
    fireEvent.click(window);
    fireEvent.click(window);
    expect(handler1).toHaveBeenCalledTimes(4);
    expect(handler2).toHaveBeenCalledTimes(0);

    // Rerender with other callback, which should now be called
    rerender(["click", handler2]);
    fireEvent.click(window);
    expect(handler1).toHaveBeenCalledTimes(4);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it("should only run `handler` when `type` event fires", () => {
    const handler = vi.fn();

    const { rerender } = renderHook(
      (props: UseWindowEventListenerProps = ["click", handler]) =>
        useWindowEventListener(...props),
    );

    expect(handler).toHaveBeenCalledTimes(0);

    // Fire 'click' event, which should call handler
    fireEvent.click(window);
    expect(handler).toHaveBeenCalledTimes(1);
    // Fire 'mousedown' event, which shouldn't call handler
    fireEvent.mouseDown(window);
    expect(handler).toHaveBeenCalledTimes(1);

    // Change `type` prop to 'mousedown'
    rerender(["mousedown", handler]);

    // Fire 'click' event, which shouldn't call handler
    fireEvent.click(window);
    expect(handler).toHaveBeenCalledTimes(1);
    // Fire 'mousedown' event, which should call handler
    fireEvent.mouseDown(window);
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
