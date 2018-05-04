export function toUpperCase(name: string) {
  return name[0].toUpperCase() + name.substring(1)
}

export function toLowerCase(name: string) {
  return name[0].toLowerCase() + name.substring(1)
}

export type Model = EnumModel | ObjectModel | ArrayModel | UnionModel | StringModel | NumberModel | ReferenceModel

export type EnumModel = {
  kind: 'enum';
  name: string;
  type: string;
  members: EnumMember[];
}

/**
 * @public
 */
export type EnumMember = {
  name: string;
  value: string | number;
}

export type ObjectModel = ObjectType & {
  name: string;
  entry: string | undefined;
}

export type ArrayModel = ArrayType & {
  name: string;
  entry: string | undefined;
}

export type UnionModel = UnionType & {
  name: string;
  entry: string | undefined;
}

export type StringModel = StringType & {
  name: string;
}

export type NumberModel = NumberType & {
  name: string;
}

/**
 * @public
 */
export type ReferenceModel = ReferenceType & {
  newName: string;
}

export type Type = StringType | MapType | ArrayType | EnumType | ReferenceType
  | ObjectType | NumberType | BooleanType | AnyType | NullType
  | UnionType

/**
 * @public
 */
export type MapType = {
  kind: 'map';
  key: Type;
  value: Type;
}

/**
 * @public
 */
export type EnumType = {
  kind: 'enum';
  type: string;
  name: string;
  enums: any[];
}

/**
 * @public
 */
export type ReferenceType = {
  kind: 'reference';
  name: string;
  default?: any;
}

export type NumberType = {
  kind: 'number';
  type: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  default?: number;
  enums?: string[];
  title?: string;
  description?: string;
}

/**
 * @public
 */
export type StringType = {
  kind: 'string';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: string;
  enums?: string[];
  title?: string;
  description?: string;
}

/**
 * @public
 */
export type BooleanType = {
  kind: 'boolean';
  default?: boolean;
  title?: string;
  description?: string;
}

/**
 * @public
 */
export type AnyType = {
  kind: undefined;
}

export type ObjectType = {
  kind: 'object';
  members: Member[];
  minProperties: number;
  maxProperties?: number;
  additionalProperties?: boolean | Type;
  default?: any;
  title?: string;
  description?: string;
}

export type ArrayType = {
  kind: 'array';
  type: Type;
  uniqueItems?: boolean;
  minItems?: number;
  maxItems?: number;
  default?: any[]
  title?: string;
  description?: string;
}

/**
 * @public
 */
export type NullType = {
  kind: 'null'
}

/**
 * @public
 */
export type UnionType = {
  kind: 'union';
  members: Type[];
}

export type Member = {
  name: string;
  type: Type;
  optional?: boolean;
  tag?: number;
  enum?: any[];
  parameters?: MemberParameter[];
}

export type MemberParameter = {
  name: string;
  type: Type;
  optional?: boolean;
}
