import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEventListener } from "./use-event-listener";
import { fireEvent, renderHook } from "@testing-library/react";
import type { RefObject } from "react";

type UseEventListenerProps = Parameters<typeof useEventListener>;

describe("useEventListener", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should set up an event listener on mount", () => {
    const ref: RefObject<HTMLDivElement> = {
      current: document.createElement("div"),
    };
    vi.spyOn(ref.current, "addEventListener");
    expect(ref.current.addEventListener).toHaveBeenCalledTimes(0);

    renderHook((props: UseEventListenerProps = [ref, "click", () => {}]) =>
      useEventListener(...props),
    );
    expect(ref.current.addEventListener).toHaveBeenCalledTimes(1);
  });

  it("should remove event listener on unmount", () => {
    const ref: RefObject<HTMLDivElement> = {
      current: document.createElement("div"),
    };
    vi.spyOn(ref.current, "removeEventListener");
    expect(ref.current.removeEventListener).toHaveBeenCalledTimes(0);

    const { unmount } = renderHook(
      (props: UseEventListenerProps = [ref, "click", () => {}]) =>
        useEventListener(...props),
    );
    expect(ref.current.removeEventListener).toHaveBeenCalledTimes(0);

    unmount();
    expect(ref.current.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it("should do nothing on rerender if no arguments have changed", () => {
    const handler = vi.fn();
    const ref: RefObject<HTMLDivElement> = {
      current: document.createElement("div"),
    };
    vi.spyOn(ref.current, "addEventListener");
    vi.spyOn(ref.current, "removeEventListener");
    expect(ref.current.addEventListener).toHaveBeenCalledTimes(0);
    expect(ref.current.removeEventListener).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (props: UseEventListenerProps = [ref, "click", handler]) =>
        useEventListener(...props),
    );
    expect(ref.current.addEventListener).toHaveBeenCalledTimes(1);
    expect(ref.current.removeEventListener).toHaveBeenCalledTimes(0);

    // No change in props
    rerender([ref, "click", handler]);
    expect(ref.current.addEventListener).toHaveBeenCalledTimes(1);
    expect(ref.current.removeEventListener).toHaveBeenCalledTimes(0);

    // And again...
    rerender([ref, "click", handler]);
    expect(ref.current.addEventListener).toHaveBeenCalledTimes(1);
    expect(ref.current.removeEventListener).toHaveBeenCalledTimes(0);
  });

  it("should replace event listener when `element` or `type` have changed", () => {
    const handler = vi.fn();
    const ref: RefObject<HTMLDivElement> = {
      current: document.createElement("div"),
    };
    vi.spyOn(ref.current, "addEventListener");
    vi.spyOn(ref.current, "removeEventListener");
    expect(ref.current.addEventListener).toHaveBeenCalledTimes(0);
    expect(ref.current.removeEventListener).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (props: UseEventListenerProps = [ref, "click", handler]) =>
        useEventListener(...props),
    );
    expect(ref.current.addEventListener).toHaveBeenCalledTimes(1);
    expect(ref.current.removeEventListener).toHaveBeenCalledTimes(0);

    // Change type (should call removeEventListener, then addEventListener)
    rerender([ref, "keydown", handler]);
    expect(ref.current.addEventListener).toHaveBeenCalledTimes(2);
    expect(ref.current.removeEventListener).toHaveBeenCalledTimes(1);

    // Set up another element/ref and spy on it
    const ref2: RefObject<HTMLDivElement> = {
      current: document.createElement("div"),
    };
    vi.spyOn(ref2.current, "addEventListener");
    vi.spyOn(ref2.current, "removeEventListener");
    expect(ref2.current.addEventListener).toHaveBeenCalledTimes(0);
    expect(ref2.current.removeEventListener).toHaveBeenCalledTimes(0);

    // Change ref (should call removeEventListener on old element and addEventListener on new element)
    rerender([ref2, "keydown", handler]);
    // Old ref removeEventListener
    expect(ref.current.addEventListener).toHaveBeenCalledTimes(2);
    expect(ref.current.removeEventListener).toHaveBeenCalledTimes(2);
    // New ref addEventListener
    expect(ref2.current.addEventListener).toHaveBeenCalledTimes(1);
    expect(ref2.current.removeEventListener).toHaveBeenCalledTimes(0);
  });

  it("should not replace event listener when `handler` has changed", () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const ref: RefObject<HTMLDivElement> = {
      current: document.createElement("div"),
    };
    vi.spyOn(ref.current, "addEventListener");
    vi.spyOn(ref.current, "removeEventListener");
    expect(ref.current.addEventListener).toHaveBeenCalledTimes(0);
    expect(ref.current.removeEventListener).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (props: UseEventListenerProps = [ref, "click", handler1]) =>
        useEventListener(...props),
    );
    expect(ref.current.addEventListener).toHaveBeenCalledTimes(1);
    expect(ref.current.removeEventListener).toHaveBeenCalledTimes(0);

    // Change handler
    rerender([ref, "click", handler2]);
    expect(ref.current.addEventListener).toHaveBeenCalledTimes(1);
    expect(ref.current.removeEventListener).toHaveBeenCalledTimes(0);

    // And again...
    rerender([ref, "click", handler1]);
    expect(ref.current.addEventListener).toHaveBeenCalledTimes(1);
    expect(ref.current.removeEventListener).toHaveBeenCalledTimes(0);
  });

  it("should run the latest version of `handler` when the event fires", () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const ref: RefObject<HTMLDivElement> = {
      current: document.createElement("div"),
    };

    const { rerender } = renderHook(
      (props: UseEventListenerProps = [ref, "click", handler1]) =>
        useEventListener(...props),
    );

    expect(handler1).toHaveBeenCalledTimes(0);
    expect(handler2).toHaveBeenCalledTimes(0);

    // Fire event with handler1
    fireEvent.click(ref.current);
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(0);

    // Should work multiple times at once
    fireEvent.click(ref.current);
    fireEvent.click(ref.current);
    fireEvent.click(ref.current);
    expect(handler1).toHaveBeenCalledTimes(4);
    expect(handler2).toHaveBeenCalledTimes(0);

    // Rerender with other callback, which should now be called
    rerender([ref, "click", handler2]);
    fireEvent.click(ref.current);
    expect(handler1).toHaveBeenCalledTimes(4);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it("should only run `handler` when `type` event fires", () => {
    const handler = vi.fn();

    const ref: RefObject<HTMLDivElement> = {
      current: document.createElement("div"),
    };

    const { rerender } = renderHook(
      (props: UseEventListenerProps = [ref, "click", handler]) =>
        useEventListener(...props),
    );

    expect(handler).toHaveBeenCalledTimes(0);

    // Fire 'click' event, which should call handler
    fireEvent.click(ref.current);
    expect(handler).toHaveBeenCalledTimes(1);
    // Fire 'mousedown' event, which shouldn't call handler
    fireEvent.mouseDown(ref.current);
    expect(handler).toHaveBeenCalledTimes(1);

    // Change `type` prop to 'mousedown'
    rerender([ref, "mousedown", handler]);

    // Fire 'click' event, which shouldn't call handler
    fireEvent.click(ref.current);
    expect(handler).toHaveBeenCalledTimes(1);
    // Fire 'mousedown' event, which should call handler
    fireEvent.mouseDown(ref.current);
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
