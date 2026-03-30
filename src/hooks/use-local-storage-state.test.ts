import { beforeEach, describe, expect, it, test } from "vitest";
import type { Serializable } from "../types/serializable";
import { useLocalStorageState } from "./use-local-storage-state";
import { renderHook } from "@testing-library/react";
import z from "zod";
import { act } from "react";

type UseLocalStorageStateProps<T extends Serializable> = Parameters<
  typeof useLocalStorageState<T>
>;

describe("useLocalStorageState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return `defaultValue` if no value with `key` exists in localStorage", () => {
    const key = "key";
    const defaultValue = 10;

    const { result } = renderHook(
      (props: UseLocalStorageStateProps<number> = [key, defaultValue]) =>
        useLocalStorageState(...props),
    );

    const [value] = result.current;
    expect(value).toBe(defaultValue);
  });

  it("should return value at `key` if it exists in localStorage", () => {
    const key = "key";
    const defaultValue = 10;

    localStorage.setItem(key, JSON.stringify(20));

    const { result } = renderHook(
      (props: UseLocalStorageStateProps<number> = [key, defaultValue]) =>
        useLocalStorageState(...props),
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
      (props: UseLocalStorageStateProps<number> = [key, defaultValue]) =>
        useLocalStorageState(...props),
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
        props: UseLocalStorageStateProps<number> = [
          key,
          defaultValue,
          schema.parse,
        ],
      ) => useLocalStorageState(...props),
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
      (props: UseLocalStorageStateProps<number> = [key, defaultValue]) =>
        useLocalStorageState(...props),
    );

    // Value at key was malformed JSON, so `defaultValue` should be returned
    const [value] = result.current;
    expect(value).toBe(defaultValue);
  });

  it("should return `defaultValue` if the value at `key` is parsed as an object type (only primitives are supported)", () => {
    const key1 = "key1";
    const key2 = "key2";
    const defaultValue = 10;

    localStorage.setItem(key1, JSON.stringify({ a: 10 }));
    localStorage.setItem(key2, JSON.stringify([1, 2, 3]));

    const { result: result1 } = renderHook(
      (
        props: UseLocalStorageStateProps<number> = [
          key1,
          defaultValue,
          undefined,
        ],
      ) => useLocalStorageState(...props),
    );

    // Value at key was an object, so `defaultValue` should be returned
    const [value1] = result1.current;
    expect(value1).toBe(defaultValue);

    const { result: result2 } = renderHook(
      (props: UseLocalStorageStateProps<number> = [key2, defaultValue]) =>
        useLocalStorageState(...props),
    );

    // Value at key was an array, so `defaultValue` should be returned
    const [value2] = result2.current;
    expect(value2).toBe(defaultValue);
  });

  it("should update value (including in localStorage) when `setValue` is called", () => {
    const key = "key";
    const defaultValue = 10;
    const newValue1 = 20;
    const newValue2 = 30;

    const { result } = renderHook(
      (props: UseLocalStorageStateProps<number> = [key, defaultValue]) =>
        useLocalStorageState(...props),
    );

    let [value, setValue] = result.current;
    expect(value).toBe(defaultValue);

    // Set value
    act(() => {
      setValue(newValue1);
    });
    [value, setValue] = result.current;

    // Should have set value, both in the hook and in localStorage
    expect(value).toBe(newValue1);
    expect(JSON.parse(localStorage.getItem(key)!)).toBe(newValue1);

    // And again...
    act(() => {
      setValue(newValue2);
    });
    [value, setValue] = result.current;

    expect(value).toBe(newValue2);
    expect(JSON.parse(localStorage.getItem(key)!)).toBe(newValue2);
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
      (props: UseLocalStorageStateProps<number> = [key1, defaultValue]) =>
        useLocalStorageState(...props),
    );

    // Starts on value at `key2`
    let [value] = result.current;
    expect(value).toBe(value1);

    // Immediately changes to value at `key2`
    rerender([key2, defaultValue]);
    [value] = result.current;
    expect(value).toBe(value2);

    // Immediately changes to `defaultValue`, since no value exists at `key3`
    rerender([key3, defaultValue]);
    [value] = result.current;
    expect(value).toBe(defaultValue);

    // Change multiple times shouldn't have interfered with values at previous keys
    rerender([key1, defaultValue]);
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
      (props: UseLocalStorageStateProps<number> = [key, defaultValue1]) =>
        useLocalStorageState(...props),
    );

    // Starts on `defaultValue1`, since no value exists at key
    let [value, setValue] = result.current;
    expect(value).toBe(defaultValue1);

    // Changes to `defaultValue2`, since no value exists at key
    rerender([key, defaultValue2]);
    [value, setValue] = result.current;
    expect(value).toBe(defaultValue2);

    // Set a value at `key`.
    act(() => {
      setValue(valueAtKey);
    });
    [value, setValue] = result.current;
    expect(value).toBe(valueAtKey);

    // Changing `defaultValue` should do nothing, since a value now exists at `key`
    rerender([key, defaultValue3]);
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
        props: UseLocalStorageStateProps<number> = [
          key,
          defaultValue,
          schema1.parse,
        ],
      ) => useLocalStorageState(...props),
    );

    // Starts on `defaultValue`, since value at key fails schema parse
    let [value] = result.current;
    expect(value).toBe(defaultValue);

    // Changes to value at key, since it passes the new schema parse
    rerender([key, defaultValue, schema2.parse]);
    [value] = result.current;
    expect(value).toBe(valueAtKey);

    // Changes back to `defaultValue`, since value at key fails new schema parse
    rerender([key, defaultValue, schema1.parse]);
    [value] = result.current;
    expect(value).toBe(defaultValue);
  });

  it("should return a memoized setter function", () => {
    const key1 = "key1";
    const key2 = "key2";
    const defaultValue1 = 10;
    const defaultValue2 = 20;
    const schema1 = z.number();
    const schema2 = z.number();

    const { result, rerender } = renderHook(
      (
        props: UseLocalStorageStateProps<number> = [
          key1,
          defaultValue1,
          schema1.parse,
        ],
      ) => useLocalStorageState(...props),
    );

    let [, prevSetValue] = result.current;
    let [, setValue] = result.current;

    // Rerender with same arguments. No change
    rerender([key1, defaultValue1, schema1.parse]);
    [, setValue] = result.current;
    expect(setValue).toBe(prevSetValue);
    [, prevSetValue] = result.current;

    // Rerender with different `key`. Changes
    rerender([key2, defaultValue1, schema1.parse]);
    [, setValue] = result.current;
    expect(setValue).not.toBe(prevSetValue);
    [, prevSetValue] = result.current;

    // Rerender with different `defaultValue`. Changes
    rerender([key2, defaultValue2, schema1.parse]);
    [, setValue] = result.current;
    expect(setValue).not.toBe(prevSetValue);
    [, prevSetValue] = result.current;

    // Rerender with different `parseFn`. Changes
    rerender([key2, defaultValue2, schema2.parse]);
    [, setValue] = result.current;
    expect(setValue).not.toBe(prevSetValue);
    [, prevSetValue] = result.current;

    // Call `setValue`. No change
    act(() => {
      setValue(50);
    });
    [, setValue] = result.current;
    expect(setValue).toBe(prevSetValue);
  });
});
