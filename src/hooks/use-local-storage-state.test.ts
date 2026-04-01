import { beforeEach, describe, expect, it, test } from "vitest";
import {
  useLocalStorageState,
  type UseLocalStorageStateProps,
} from "./use-local-storage-state";
import { renderHook } from "@testing-library/react";
import z from "zod";
import { act } from "react";

describe("useLocalStorageState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return `defaultValue` if no value with `key` exists in localStorage", () => {
    const key = "key";
    const defaultValue = 10;

    const { result } = renderHook(
      (props: UseLocalStorageStateProps<number> = { key, defaultValue }) =>
        useLocalStorageState(props),
    );

    const [value] = result.current;
    expect(value).toBe(defaultValue);
  });

  it("should return value at `key` if it exists in localStorage", () => {
    const key = "key";
    const defaultValue = 10;

    localStorage.setItem(key, JSON.stringify(20));

    const { result } = renderHook(
      (props: UseLocalStorageStateProps<number> = { key, defaultValue }) =>
        useLocalStorageState(props),
    );

    const [value] = result.current;
    expect(value).toBe(20);
  });

  // This case shows why you should provide a `parseFn`...
  test("if no `parseFn` is provided, the value at `key` should be returned as-is, even if it is the wrong type", () => {
    const key = "key";
    const defaultValue = 10;

    localStorage.setItem(key, JSON.stringify("not a number..."));

    const { result } = renderHook(
      (props: UseLocalStorageStateProps<number> = { key, defaultValue }) =>
        useLocalStorageState(props),
    );

    // `value` is a string, even though TypeScript thinks it's a number...
    const [value] = result.current;
    expect(value).toBe("not a number...");
    expect(typeof value).toBe("string");
  });

  test("if `parseFn` is provided, and the value at `key` fails to parse (throws), `defaultValue` should be returned", () => {
    const key = "key";
    const defaultValue = 10;
    const schema = z.number();

    localStorage.setItem(key, JSON.stringify("not a number..."));

    const { result } = renderHook(
      (
        props: UseLocalStorageStateProps<number> = {
          key,
          defaultValue,
          parseFn: schema.parse,
        },
      ) => useLocalStorageState(props),
    );

    // Value at key made the `parseFn` throw, so `defaultValue` was returned instead
    const [value] = result.current;
    expect(value).toBe(defaultValue);
    expect(typeof value).toBe("number");
  });

  it("should return `defaultValue` if the value at `key` is malformed JSON", () => {
    const key = "key";
    const defaultValue = 10;

    localStorage.setItem(key, "{{ a: 10 }");

    const { result } = renderHook(
      (props: UseLocalStorageStateProps<number> = { key, defaultValue }) =>
        useLocalStorageState(props),
    );

    // Value at key was malformed JSON, so `defaultValue` should be returned
    const [value] = result.current;
    expect(value).toBe(defaultValue);
  });

  it("should return `defaultValue` if the value at `key` is parsed as an object type, and no `equalityComparer` prop was provided", () => {
    type Obj = { a: number; b: number };
    type Arr = number[];
    const keyObj = "key1";
    const keyArr = "key2";
    const defaultValueObj: Obj = { a: 10, b: 10 };
    const defaultValueArr: Arr = [1, 2, 3];

    const valueAtKeyObj = { a: 50, b: 50 };
    const valueAtKeyArr = [7, 8, 9];

    localStorage.setItem(keyObj, JSON.stringify(valueAtKeyObj));
    localStorage.setItem(keyArr, JSON.stringify(valueAtKeyArr));

    const { result: result1 } = renderHook(
      (
        props: UseLocalStorageStateProps<Obj> = {
          key: keyObj,
          defaultValue: defaultValueObj,
        },
      ) => useLocalStorageState(props),
    );

    // Value at key was an object, so `defaultValue` should be returned
    const [value1] = result1.current;
    expect(value1).toBe(defaultValueObj);

    const { result: result2 } = renderHook(
      (
        props: UseLocalStorageStateProps<Arr> = {
          key: keyArr,
          defaultValue: defaultValueArr,
        },
      ) => useLocalStorageState(props),
    );

    // Value at key was an array, so `defaultValue` should be returned
    const [value2] = result2.current;
    expect(value2).toBe(defaultValueArr);
  });

  it("should return value at `key` if it is parsed as an object type, if an `equalityComparer` prop was provided", () => {
    type Obj = { a: number; b: number };
    type Arr = number[];
    const keyObj = "keyObj";
    const keyArr = "keyArr";
    const defaultValueObj: Obj = { a: 10, b: 10 };
    const defaultValueArr: Arr = [1, 2, 3];
    const equalityComparerObj = (a: Obj, b: Obj) => a.a === b.a && a.b === b.b;
    const equalityComparerArr = (a: Arr, b: Arr) => {
      if (a.length !== b.length) {
        return false;
      }
      for (const i in a) {
        if (a[i] !== b[i]) {
          return false;
        }
      }

      return true;
    };

    const valueAtKeyObj = { a: 50, b: 50 };
    const valueAtKeyArr = [7, 8, 9];

    localStorage.setItem(keyObj, JSON.stringify(valueAtKeyObj));
    localStorage.setItem(keyArr, JSON.stringify(valueAtKeyArr));

    const { result: result1 } = renderHook(
      (
        props: UseLocalStorageStateProps<Obj> = {
          key: keyObj,
          defaultValue: defaultValueObj,
          equalityComparer: equalityComparerObj,
        },
      ) => useLocalStorageState(props),
    );

    // Value at key was an object, so `defaultValue` should be returned
    const [value1] = result1.current;
    expect(value1).toEqual(valueAtKeyObj);
    expect(value1).not.toBe(valueAtKeyObj);

    const { result: result2 } = renderHook(
      (
        props: UseLocalStorageStateProps<Arr> = {
          key: keyArr,
          defaultValue: defaultValueArr,
          equalityComparer: equalityComparerArr,
        },
      ) => useLocalStorageState(props),
    );

    // Value at key was an array, so `defaultValue` should be returned
    const [value2] = result2.current;
    expect(value2).toEqual(valueAtKeyArr);
    expect(value2).not.toBe(valueAtKeyArr);
  });

  it("should update value (including in localStorage) when `setValue` is called", () => {
    type Obj = { a: number; b: number };
    const keyPrimitive = "keyPrimitve";
    const defaultValuePrimitve = 10;
    const newValuePrimitive = 20;

    const { result: resultPrimitive } = renderHook(
      (
        props: UseLocalStorageStateProps<number> = {
          key: keyPrimitive,
          defaultValue: defaultValuePrimitve,
        },
      ) => useLocalStorageState(props),
    );

    let [valuePrimitive, setValuePrimitive] = resultPrimitive.current;
    expect(valuePrimitive).toBe(defaultValuePrimitve);

    // Set value
    act(() => {
      setValuePrimitive(newValuePrimitive);
    });
    [valuePrimitive, setValuePrimitive] = resultPrimitive.current;

    // Should have set value, both in the hook and in localStorage
    expect(valuePrimitive).toBe(newValuePrimitive);
    expect(JSON.parse(localStorage.getItem(keyPrimitive)!)).toBe(
      newValuePrimitive,
    );

    // Should work with object types (by value, not reference) if a `equalityComparer` is provided
    // Object
    const keyObj = "keyObj";
    const defaultValueObj: Obj = { a: 10, b: 10 };
    const equalityComparerObj = (a: Obj, b: Obj) => a.a === b.a && a.b === b.b;
    const newValueObj: Obj = { a: 50, b: 50 };

    const { result: resultObj } = renderHook(
      (
        props: UseLocalStorageStateProps<Obj> = {
          key: keyObj,
          defaultValue: defaultValueObj,
          equalityComparer: equalityComparerObj,
        },
      ) => useLocalStorageState(props),
    );

    let [valueObj, setValueObj] = resultObj.current;
    expect(valueObj).toBe(defaultValueObj);

    // Set value
    act(() => {
      setValueObj(newValueObj);
    });
    [valueObj, setValueObj] = resultObj.current;

    // Should have set value, both in the hook and in localStorage
    expect(valueObj).toEqual(newValueObj);
    expect(JSON.parse(localStorage.getItem(keyObj)!)).toEqual(newValueObj);

    // Array
    type Arr = number[];
    const keyArr = "keyArr";
    const defaultValueArr: Arr = [1, 2, 3];
    const equalityComparerArr = (a: Arr, b: Arr) => {
      if (a.length !== b.length) {
        return false;
      }
      for (const i in a) {
        if (a[i] !== b[i]) {
          return false;
        }
      }

      return true;
    };
    const newValueArr: Arr = [7, 8, 9];

    const { result: resultArr } = renderHook(
      (
        props: UseLocalStorageStateProps<Arr> = {
          key: keyArr,
          defaultValue: defaultValueArr,
          equalityComparer: equalityComparerArr,
        },
      ) => useLocalStorageState(props),
    );

    let [valueArr, setValueArr] = resultArr.current;
    expect(valueArr).toBe(defaultValueArr);

    // Set value
    act(() => {
      setValueArr(newValueArr);
    });
    [valueArr, setValueArr] = resultArr.current;

    // Should have set value, both in the hook and in localStorage
    expect(valueArr).toEqual(newValueArr);
    expect(JSON.parse(localStorage.getItem(keyArr)!)).toEqual(newValueArr);
  });

  it("should reset value to `defaultValue` (and delete key from localStorage) when `deleteValue` is called", () => {
    const key = "key";
    const defaultValue = 10;
    const valueAtKey = 50;

    localStorage.setItem(key, JSON.stringify(valueAtKey));

    const { result } = renderHook(
      (props: UseLocalStorageStateProps<number> = { key, defaultValue }) =>
        useLocalStorageState(props),
    );

    // Value should be value at key, which should exist
    let [value, , deleteValue] = result.current;
    expect(value).toBe(valueAtKey);
    expect(localStorage.getItem(key)).not.toBeNull();

    // Delete value
    act(() => {
      deleteValue();
    });

    // Value should be `defaultValue`, and no value should exist at key
    [value, , deleteValue] = result.current;
    expect(value).toBe(defaultValue);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it("should update result for all consumers (that use the same `key`) when one updates the value", () => {
    const key = "key";
    const defaultValue = 10;
    const valueAtKey = 50;

    const { result: result1 } = renderHook(
      (props: UseLocalStorageStateProps<number> = { key, defaultValue }) =>
        useLocalStorageState(props),
    );
    const { result: result2 } = renderHook(
      (props: UseLocalStorageStateProps<number> = { key, defaultValue }) =>
        useLocalStorageState(props),
    );
    const { result: result3 } = renderHook(
      (props: UseLocalStorageStateProps<number> = { key, defaultValue }) =>
        useLocalStorageState(props),
    );

    // All 3 should start with `defaultValue`
    expect(result1.current[0]).toBe(defaultValue);
    expect(result2.current[0]).toBe(defaultValue);
    expect(result3.current[0]).toBe(defaultValue);

    // Call setter of 1st hook
    act(() => {
      result1.current[1](valueAtKey);
    });

    // All 3 should have updated to new value
    expect(result1.current[0]).toBe(valueAtKey);
    expect(result2.current[0]).toBe(valueAtKey);
    expect(result3.current[0]).toBe(valueAtKey);

    // Call delete of 3rd hook
    act(() => {
      result3.current[2]();
    });

    // All 3 should have updated to `defaultValue`
    expect(result1.current[0]).toBe(defaultValue);
    expect(result2.current[0]).toBe(defaultValue);
    expect(result3.current[0]).toBe(defaultValue);
  });

  it("should attempt to read value at new `key` when `key` changes", () => {
    const key1 = "key1";
    const key2 = "key2";
    const key3 = "key3";
    const value1 = 20;
    const value2 = 30;
    const defaultValue = 10;

    localStorage.setItem(key1, JSON.stringify(value1));
    localStorage.setItem(key2, JSON.stringify(value2));

    const { result, rerender } = renderHook(
      (
        props: UseLocalStorageStateProps<number> = { key: key1, defaultValue },
      ) => useLocalStorageState(props),
    );

    // Starts on value at `key2`
    let [value] = result.current;
    expect(value).toBe(value1);

    // Immediately changes to value at `key2`
    rerender({ key: key2, defaultValue });
    [value] = result.current;
    expect(value).toBe(value2);

    // Immediately changes to `defaultValue`, since no value exists at `key3`
    rerender({ key: key3, defaultValue });
    [value] = result.current;
    expect(value).toBe(defaultValue);

    // Change multiple times shouldn't have interfered with values at previous keys
    rerender({ key: key1, defaultValue });
    [value] = result.current;
    expect(value).toBe(value1);
  });

  it("should return new `defaultValue` when `defaultValue` changes, if no value exists at `key`", () => {
    const key = "key";
    const defaultValue1 = 10;
    const defaultValue2 = 20;
    const defaultValue3 = 30;
    const valueAtKey = 50;

    const { result, rerender } = renderHook(
      (
        props: UseLocalStorageStateProps<number> = {
          key,
          defaultValue: defaultValue1,
        },
      ) => useLocalStorageState(props),
    );

    // Starts on `defaultValue1`, since no value exists at key
    let [value, setValue] = result.current;
    expect(value).toBe(defaultValue1);

    // Changes to `defaultValue2`, since no value exists at key
    rerender({ key, defaultValue: defaultValue2 });
    [value, setValue] = result.current;
    expect(value).toBe(defaultValue2);

    // Set a value at `key`.
    act(() => {
      setValue(valueAtKey);
    });
    [value, setValue] = result.current;
    expect(value).toBe(valueAtKey);

    // Changing `defaultValue` should do nothing, since a value now exists at `key`
    rerender({ key, defaultValue: defaultValue3 });
    [value, setValue] = result.current;
    expect(value).toBe(valueAtKey);
  });

  it("should re-parse value at `key` when `parseFn` changes", () => {
    const key = "key";
    const defaultValue = 10;
    const schema1 = z.number().min(100);
    const schema2 = z.number().min(50);
    const valueAtKey = 50;

    localStorage.setItem(key, JSON.stringify(valueAtKey));

    const { result, rerender } = renderHook(
      (
        props: UseLocalStorageStateProps<number> = {
          key,
          defaultValue,
          parseFn: schema1.parse,
        },
      ) => useLocalStorageState(props),
    );

    // Starts on `defaultValue`, since value at key fails schema parse
    let [value] = result.current;
    expect(value).toBe(defaultValue);

    // Changes to value at key, since it passes the new schema parse
    rerender({ key, defaultValue, parseFn: schema2.parse });
    [value] = result.current;
    expect(value).toBe(valueAtKey);

    // Changes back to `defaultValue`, since value at key fails new schema parse
    rerender({ key, defaultValue, parseFn: schema1.parse });
    [value] = result.current;
    expect(value).toBe(defaultValue);
  });

  it("should return a memoized functions", () => {
    type Obj = { a: number; b: number };
    const key1 = "key1";
    const key2 = "key2";
    const defaultValue1: Obj = { a: 10, b: 10 };
    const defaultValue2: Obj = { a: 20, b: 20 };
    const schema1 = z.object({ a: z.number(), b: z.number() });
    const schema2 = z.object({ a: z.number(), b: z.number() });
    const equalityComparer1 = (a: Obj, b: Obj) => a.a === b.a && a.b === b.b;
    const equalityComparer2 = (a: Obj, b: Obj) => a.a === b.a && a.b === b.b;

    const { result, rerender } = renderHook(
      (
        props: UseLocalStorageStateProps<Obj> = {
          key: key1,
          defaultValue: defaultValue1,
          parseFn: schema1.parse,
          equalityComparer: equalityComparer1,
        },
      ) => useLocalStorageState(props),
    );

    let [, prevSetValue, prevDeleteValue] = result.current;
    let [, setValue, deleteValue] = result.current;

    // Rerender with same arguments. No change
    rerender({
      key: key1,
      defaultValue: defaultValue1,
      parseFn: schema1.parse,
      equalityComparer: equalityComparer1,
    });
    [, setValue, deleteValue] = result.current;
    expect(setValue).toBe(prevSetValue);
    expect(deleteValue).toBe(prevDeleteValue);
    [, prevSetValue, prevDeleteValue] = result.current;

    // Rerender with different `key`. Changes
    rerender({
      key: key2,
      defaultValue: defaultValue1,
      parseFn: schema1.parse,
      equalityComparer: equalityComparer1,
    });
    [, setValue, deleteValue] = result.current;
    expect(setValue).not.toBe(prevSetValue);
    expect(deleteValue).not.toBe(prevDeleteValue);
    [, prevSetValue, prevDeleteValue] = result.current;

    // Rerender with different `defaultValue`. Changes
    rerender({
      key: key2,
      defaultValue: defaultValue2,
      parseFn: schema1.parse,
      equalityComparer: equalityComparer1,
    });
    [, setValue, deleteValue] = result.current;
    expect(setValue).not.toBe(prevSetValue);
    expect(deleteValue).not.toBe(prevDeleteValue);
    [, prevSetValue, prevDeleteValue] = result.current;

    // Rerender with different `parseFn`. Changes
    rerender({
      key: key2,
      defaultValue: defaultValue2,
      parseFn: schema2.parse,
      equalityComparer: equalityComparer1,
    });
    [, setValue, deleteValue] = result.current;
    expect(setValue).not.toBe(prevSetValue);
    expect(deleteValue).not.toBe(prevDeleteValue);
    [, prevSetValue, prevDeleteValue] = result.current;

    // Rerender with different parseFn. Changes
    rerender({
      key: key2,
      defaultValue: defaultValue2,
      parseFn: schema2.parse,
      equalityComparer: equalityComparer2,
    });
    [, setValue, deleteValue] = result.current;
    expect(setValue).not.toBe(prevSetValue);
    expect(deleteValue).not.toBe(prevDeleteValue);
    [, prevSetValue, prevDeleteValue] = result.current;

    // Call `setValue`. No change
    act(() => {
      setValue({ a: 50, b: 50 });
    });
    [, setValue, deleteValue] = result.current;
    expect(setValue).toBe(prevSetValue);
    expect(deleteValue).toBe(prevDeleteValue);
    [, prevSetValue, prevDeleteValue] = result.current;

    // Call `deleteValue`. No change
    act(() => {
      deleteValue();
    });
    [, setValue, deleteValue] = result.current;
    expect(setValue).toBe(prevSetValue);
    expect(deleteValue).toBe(prevDeleteValue);
  });
});
