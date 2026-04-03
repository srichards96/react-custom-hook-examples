import { createFileRoute } from "@tanstack/react-router";
import { useStorageState } from "../../hooks/use-storage-state";
import z from "zod";

export const Route = createFileRoute("/hooks/use-storage-state")({
  component: UseDebouncePage,
});

function arraysAreEqual<T>(a: T[], b: T[]) {
  if (a.length !== b.length) {
    return false;
  }

  for (const i in a) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

function objectsAreEqual<T extends { [key: string]: string }>(a: T, b: T) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (!arraysAreEqual(aKeys, bKeys)) {
    return false;
  }

  for (const key of aKeys) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

const stringSchema = z.string();
const numberSchema = z.number();
const booleanSchema = z.boolean();

const stringArraySchema = z.array(z.string());
const objectSchema = z.record(z.string(), z.string());

function UseDebouncePage() {
  const [string, setString, deleteString] = useStorageState({
    key: "useLocalStoragePage.string",
    defaultValue: "",
    parseFn: stringSchema.parse,
    storageApi: sessionStorage,
  });
  const [number, setNumber, deleteNumber] = useStorageState({
    key: "useLocalStoragePage.number",
    defaultValue: 0,
    parseFn: numberSchema.parse,
  });
  const [boolean, setBoolean, deleteBoolean] = useStorageState({
    key: "useLocalStoragePage.boolean",
    defaultValue: false,
    parseFn: booleanSchema.parse,
  });

  const [stringArray, setStringArray, deleteStringArray] = useStorageState({
    key: "useLocalStoragePage.stringArray",
    defaultValue: [],
    parseFn: stringArraySchema.parse,
    equalityComparer: arraysAreEqual,
  });

  const [object, setObject, deleteObject] = useStorageState({
    key: "useLocalStoragePage.object",
    defaultValue: {},
    parseFn: objectSchema.parse,
    equalityComparer: objectsAreEqual,
  });

  return (
    <div className="container mx-auto py-4">
      <div>
        <div>
          <label>
            String:{" "}
            <input
              type="text"
              value={string}
              onChange={(e) => setString(e.target.value)}
            />
          </label>
        </div>
        <button onClick={deleteString}>Delete</button>
      </div>

      <hr />

      <div>
        <div>
          <label>
            Number:{" "}
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.valueAsNumber)}
            />
          </label>
        </div>
        <button onClick={deleteNumber}>Delete</button>
      </div>

      <hr />

      <div>
        <div>
          <label>
            Boolean:{" "}
            <input
              type="checkbox"
              checked={boolean}
              onChange={(e) => setBoolean(e.target.checked)}
            />
          </label>
        </div>
        <button onClick={deleteBoolean}>Delete</button>
      </div>

      <hr />

      <div>
        <div>String array</div>
        <div>
          <button
            onClick={() =>
              setStringArray((x) => [...x, `Item ${stringArray.length + 1}`])
            }
          >
            Add
          </button>
        </div>
        <div>
          <button onClick={() => setStringArray([])}>Clear</button>
        </div>
        <div>
          <button onClick={deleteStringArray}>Delete</button>
        </div>
        <div>
          <pre>{JSON.stringify(stringArray, null, 2)}</pre>
        </div>
      </div>

      <hr />

      <div>
        <div>Object</div>
        <div>
          <button
            onClick={() => {
              setObject((x) => {
                const newIndex = Object.keys(object).length + 1;
                return {
                  ...x,
                  [`key${newIndex}`]: newIndex.toString(),
                };
              });
            }}
          >
            Add
          </button>
        </div>
        <div>
          <button onClick={() => setObject({})}>Clear</button>
        </div>
        <div>
          <button onClick={deleteObject}>Delete</button>
        </div>
        <div>
          <pre>{JSON.stringify(object, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
