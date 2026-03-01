import { useEffect, useEffectEvent } from "react";

export function useWindowEventListener<TEvent extends keyof WindowEventMap>(
  type: TEvent,
  handler: (event: WindowEventMap[TEvent]) => void,
) {
  const handlerEvent = useEffectEvent(handler);

  useEffect(() => {
    window.addEventListener(type, handlerEvent);

    return () => {
      window.removeEventListener(type, handlerEvent);
    };
  }, [type]);
}
