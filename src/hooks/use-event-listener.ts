import { useEffect, useEffectEvent, type RefObject } from "react";

export function useEventListener<
  TElement extends HTMLElement,
  TEvent extends keyof HTMLElementEventMap,
>(
  elementRef: RefObject<TElement | null>,
  type: TEvent,
  handler: (event: HTMLElementEventMap[TEvent]) => void,
) {
  const handlerEvent = useEffectEvent(handler);

  useEffect(() => {
    const element = elementRef.current;

    if (element == null) {
      return;
    }

    element.addEventListener(type, handlerEvent);

    return () => {
      element.removeEventListener(type, handlerEvent);
    };
  }, [elementRef, type]);
}
