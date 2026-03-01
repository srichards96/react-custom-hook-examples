import { useEffect, useEffectEvent } from "react";

export function useDocumentEventListener<TEvent extends keyof DocumentEventMap>(
  type: TEvent,
  handler: (event: DocumentEventMap[TEvent]) => void,
) {
  const handlerEvent = useEffectEvent(handler);

  useEffect(() => {
    document.addEventListener(type, handlerEvent);

    return () => {
      document.removeEventListener(type, handlerEvent);
    };
  }, [type]);
}
