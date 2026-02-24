import { useEffect, useEffectEvent } from "react";

export function useTimeout(callback: () => void, delay: number | null) {
  const callbackEvent = useEffectEvent(callback);

  useEffect(() => {
    if (delay == null) {
      return;
    }

    const handle = setTimeout(callbackEvent, delay);

    return () => {
      clearTimeout(handle);
    };
  }, [delay]);
}
