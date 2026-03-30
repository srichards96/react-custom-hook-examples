import type { Primitive } from "./primitive";

export type SerializablePrimitive = Exclude<Primitive, undefined | symbol>;

export type SerializableObject =
  | Array<SerializablePrimitive | SerializableObject>
  | { [key: string]: SerializablePrimitive | SerializableObject };

export type Serializable = SerializablePrimitive | SerializableObject;
