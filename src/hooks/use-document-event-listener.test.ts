import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, renderHook } from "@testing-library/react";
import { useDocumentEventListener } from "./use-document-event-listener";

type UseDocumentEventListenerProps = Parameters<
  typeof useDocumentEventListener
>;

describe("useDocumentEventListener", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // For some reason, in the first test that `useDocumentEventListener` is called,
  // `document.addEventListener` apparently gets called twice (but `document.removeEventListener` zero times?)
  // I can only assume this is due to Jest/Vitest doing some internal nonsense with the `document` object...
  // Especially given that this test case takes considerably longer to run (like 5x) than every other test case...
  it("", () => {
    renderHook((props: UseDocumentEventListenerProps = ["click", () => {}]) =>
      useDocumentEventListener(...props),
    );
  });

  it("should set up an event listener on mount", () => {
    const handler = vi.fn();
    vi.spyOn(document, "addEventListener");
    expect(document.addEventListener).toHaveBeenCalledTimes(0);

    renderHook((props: UseDocumentEventListenerProps = ["click", handler]) =>
      useDocumentEventListener(...props),
    );
    expect(document.addEventListener).toHaveBeenCalledTimes(1);
  });

  it("should remove event listener on unmount", () => {
    vi.spyOn(document, "removeEventListener");
    expect(document.removeEventListener).toHaveBeenCalledTimes(0);

    const { unmount } = renderHook(
      (props: UseDocumentEventListenerProps = ["click", () => {}]) =>
        useDocumentEventListener(...props),
    );
    expect(document.removeEventListener).toHaveBeenCalledTimes(0);

    unmount();
    expect(document.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it("should do nothing on rerender if no arguments have changed", () => {
    const handler = vi.fn();
    vi.spyOn(document, "addEventListener");
    vi.spyOn(document, "removeEventListener");
    expect(document.addEventListener).toHaveBeenCalledTimes(0);
    expect(document.removeEventListener).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (props: UseDocumentEventListenerProps = ["click", handler]) =>
        useDocumentEventListener(...props),
    );
    expect(document.addEventListener).toHaveBeenCalledTimes(1);
    expect(document.removeEventListener).toHaveBeenCalledTimes(0);

    // No change in props
    rerender(["click", handler]);
    expect(document.addEventListener).toHaveBeenCalledTimes(1);
    expect(document.removeEventListener).toHaveBeenCalledTimes(0);

    // And again...
    rerender(["click", handler]);
    expect(document.addEventListener).toHaveBeenCalledTimes(1);
    expect(document.removeEventListener).toHaveBeenCalledTimes(0);
  });

  it("should replace event listener when `type` has changed", () => {
    const handler = vi.fn();

    vi.spyOn(document, "addEventListener");
    vi.spyOn(document, "removeEventListener");
    expect(document.addEventListener).toHaveBeenCalledTimes(0);
    expect(document.removeEventListener).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (props: UseDocumentEventListenerProps = ["click", handler]) =>
        useDocumentEventListener(...props),
    );
    expect(document.addEventListener).toHaveBeenCalledTimes(1);
    expect(document.removeEventListener).toHaveBeenCalledTimes(0);

    // Change type (should call removeEventListener, then addEventListener)
    rerender(["keydown", handler]);
    expect(document.addEventListener).toHaveBeenCalledTimes(2);
    expect(document.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it("should not replace event listener when `handler` has changed", () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    vi.spyOn(document, "addEventListener");
    vi.spyOn(document, "removeEventListener");
    expect(document.addEventListener).toHaveBeenCalledTimes(0);
    expect(document.removeEventListener).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (props: UseDocumentEventListenerProps = ["click", handler1]) =>
        useDocumentEventListener(...props),
    );
    expect(document.addEventListener).toHaveBeenCalledTimes(1);
    expect(document.removeEventListener).toHaveBeenCalledTimes(0);

    // Change handler
    rerender(["click", handler2]);
    expect(document.addEventListener).toHaveBeenCalledTimes(1);
    expect(document.removeEventListener).toHaveBeenCalledTimes(0);

    // And again...
    rerender(["click", handler1]);
    expect(document.addEventListener).toHaveBeenCalledTimes(1);
    expect(document.removeEventListener).toHaveBeenCalledTimes(0);
  });

  it("should run the latest version of `handler` when the event fires", () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const { rerender } = renderHook(
      (props: UseDocumentEventListenerProps = ["click", handler1]) =>
        useDocumentEventListener(...props),
    );

    expect(handler1).toHaveBeenCalledTimes(0);
    expect(handler2).toHaveBeenCalledTimes(0);

    // Fire event with handler1
    fireEvent.click(document);
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(0);

    // Should work multiple times at once
    fireEvent.click(document);
    fireEvent.click(document);
    fireEvent.click(document);
    expect(handler1).toHaveBeenCalledTimes(4);
    expect(handler2).toHaveBeenCalledTimes(0);

    // Rerender with other callback, which should now be called
    rerender(["click", handler2]);
    fireEvent.click(document);
    expect(handler1).toHaveBeenCalledTimes(4);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it("should only run `handler` when `type` event fires", () => {
    const handler = vi.fn();

    const { rerender } = renderHook(
      (props: UseDocumentEventListenerProps = ["click", handler]) =>
        useDocumentEventListener(...props),
    );

    expect(handler).toHaveBeenCalledTimes(0);

    // Fire 'click' event, which should call handler
    fireEvent.click(document);
    expect(handler).toHaveBeenCalledTimes(1);
    // Fire 'mousedown' event, which shouldn't call handler
    fireEvent.mouseDown(document);
    expect(handler).toHaveBeenCalledTimes(1);

    // Change `type` prop to 'mousedown'
    rerender(["mousedown", handler]);

    // Fire 'click' event, which shouldn't call handler
    fireEvent.click(document);
    expect(handler).toHaveBeenCalledTimes(1);
    // Fire 'mousedown' event, which should call handler
    fireEvent.mouseDown(document);
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
