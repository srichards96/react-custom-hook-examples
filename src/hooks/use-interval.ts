import { useEffect, useEffectEvent } from "react";

export function useInterval(callback: () => void, delay: number | null) {
  const callbackEvent = useEffectEvent(callback);

  useEffect(() => {
    if (delay == null) {
      return;
    }

    const handle = setInterval(callbackEvent, delay);

    return () => {
      clearInterval(handle);
    };
  }, [delay]);
}
