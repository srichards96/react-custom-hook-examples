import { createFileRoute } from "@tanstack/react-router";
import { useStorageState } from "../../hooks/use-storage-state";
import z from "zod";
import { PageWrapper } from "../../components/layout/page-wrapper";
import {
  Heading2,
  Heading3,
  ListItem,
  UnorderedList,
} from "../../components/ui/typography";
import { Textbox } from "../../components/ui/textbox";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";

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
    <PageWrapper>
      <Heading2>use-storage-state</Heading2>

      <div className="grid gap-4">
        <div>
          <Heading3>Generics</Heading3>
          <UnorderedList>
            <ListItem>
              <pre>T extends Serializable</pre>
            </ListItem>
            <UnorderedList>
              <ListItem>
                Serializable is any value which can represented as JSON
              </ListItem>
              <UnorderedList>
                <ListItem>
                  <pre>string</pre>
                </ListItem>
                <ListItem>
                  <pre>number</pre>
                </ListItem>
                <ListItem>
                  <pre>bigint</pre>
                </ListItem>
                <ListItem>
                  <pre>boolean</pre>
                </ListItem>
                <ListItem>
                  <pre>null</pre>
                </ListItem>
                <ListItem>
                  <pre>Array literals (elements must also be Serializable)</pre>
                </ListItem>
                <ListItem>
                  <pre>Object literals (values must also be Serializable)</pre>
                </ListItem>
              </UnorderedList>
            </UnorderedList>
          </UnorderedList>

          <Heading3>Props</Heading3>
          <UnorderedList>
            <ListItem>
              <pre>key: string</pre>
            </ListItem>

            <ListItem>
              <pre>defaultValue: T</pre>
            </ListItem>
            <UnorderedList>
              <ListItem>
                Value returned if either no value exists at key, or value is
                invalid (malformed JSON or makes parseFn throw)
              </ListItem>
            </UnorderedList>

            <ListItem>
              <pre>parseFn?: {"(value: unknown) => T"}</pre>
            </ListItem>
            <UnorderedList>
              <ListItem>
                Function which takes parsed JSON value from storage and
                validates it
              </ListItem>
              <ListItem>If valid, should return value as T</ListItem>
              <ListItem>Otherwise, it should throw</ListItem>
              <ListItem>
                Optional. Default simply blindly asserts value as being T
              </ListItem>
            </UnorderedList>

            <ListItem>
              <pre>equalityComparer?: {"(a: T, b: T) => boolean"}</pre>
            </ListItem>
            <UnorderedList>
              <ListItem>
                Function which takes two instances of T and determines whether
                they are different
              </ListItem>
              <ListItem>Optional*. Default is Object.is</ListItem>
              *If T is an object type, equalityComparer is required for the hook
              to work correctly
            </UnorderedList>

            <ListItem>
              <pre>storageApi?: Storage</pre>
            </ListItem>
            <UnorderedList>
              <ListItem>
                Browser storage api to use (localStorage, sessionStorage, etc)
              </ListItem>
              <ListItem>Optional. Default is localStorage</ListItem>
            </UnorderedList>
          </UnorderedList>

          <Heading3>Returns</Heading3>
          <UnorderedList>
            <ListItem>3 item type</ListItem>
            <UnorderedList>
              <ListItem>
                <pre>[value, setValue, deleteValue]</pre>
              </ListItem>
              <UnorderedList>
                <ListItem>
                  value is the value at key in storage, if it exists and is
                  valid. Otherwise, it is defaultValue
                </ListItem>
                <ListItem>setValue sets the value</ListItem>
                <ListItem>
                  deleteValue deletes the key-value pair from storage. This
                  causes value to revert to defaultValue
                </ListItem>
              </UnorderedList>
            </UnorderedList>
          </UnorderedList>
        </div>

        <div className="grid gap-4">
          <div className="flex items-end gap-4 p-4 border-2 border-purple-400 rounded-sm">
            <div className="grow">
              <Textbox
                label="string"
                value={string}
                onChange={(e) => setString(e.target.value)}
              />
            </div>

            <Button onClick={deleteString}>Delete</Button>
          </div>
        </div>

        <div className="flex items-end gap-4 p-4 border-2 border-purple-400 rounded-sm">
          <div className="grow">
            <Textbox
              label="number"
              type="number"
              value={number}
              onChange={(e) => {
                const value = e.target.valueAsNumber;
                setNumber(isNaN(value) ? 0 : value);
              }}
            />
          </div>

          <Button onClick={deleteNumber}>Delete</Button>
        </div>

        <div className="flex gap-4  p-4 border-2 border-purple-400 rounded-sm">
          <div className="grow">
            <Checkbox
              label="boolean"
              checked={boolean}
              onChange={(e) => setBoolean(e.target.checked)}
            />
          </div>

          <Button onClick={deleteBoolean}>Delete</Button>
        </div>

        <div className="flex items-start gap-4 p-4 border-2 border-purple-400 rounded-sm">
          <div className="grow">
            <Heading3>Array</Heading3>
            <pre>{JSON.stringify(stringArray, null, 2)}</pre>
          </div>

          <div className="grid gap-4">
            <Button
              onClick={() =>
                setStringArray((old) => [
                  ...old,
                  `Item ${stringArray.length + 1}`,
                ])
              }
            >
              Push
            </Button>
            <Button
              onClick={() =>
                setStringArray((old) => old.slice(0, old.length - 1))
              }
            >
              Pop
            </Button>
            <Button onClick={deleteStringArray}>Delete</Button>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 border-2 border-purple-400 rounded-sm">
          <div className="grow">
            <Heading3>Object</Heading3>
            <pre>{JSON.stringify(object, null, 2)}</pre>
          </div>

          <div className="grid gap-4">
            <Button
              onClick={() =>
                setObject((x) => {
                  const newIndex = Object.keys(object).length + 1;
                  return {
                    ...x,
                    [`key${newIndex}`]: newIndex.toString(),
                  };
                })
              }
            >
              Push
            </Button>
            <Button
              onClick={() => {
                const lastIndex = Object.keys(object).length;
                setObject(({ [`key${lastIndex}`]: _, ...rest }) => rest);
              }}
            >
              Pop
            </Button>
            <Button onClick={deleteObject}>Delete</Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
