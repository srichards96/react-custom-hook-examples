import { useCallback, useMemo, useState } from "react";

export function useBoolean(initialState: boolean) {
  const [value, setValue] = useState(initialState);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  const toggle = useCallback(() => {
    setValue((x) => !x);
  }, []);

  return useMemo(
    () => ({
      value,
      setValue,
      setTrue,
      setFalse,
      toggle,
    }),
    [value, setTrue, setFalse, toggle],
  );
}
