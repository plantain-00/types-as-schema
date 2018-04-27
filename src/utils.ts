export function toUpperCase (name: string) {
  return name[0].toUpperCase() + name.substring(1)
}

export function toLowerCase (name: string) {
  return name[0].toLowerCase() + name.substring(1)
}

export type Model = EnumModel | ObjectModel | ArrayModel | UnionModel

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

export type UnionModel = {
  kind: 'union';
  name: string;
  members: UnionMember[];
  entry: string | undefined;
}

export type UnionMember = {
  name: string;
}

export type Type = StringType | MapType | ArrayType | EnumType | ReferenceType | ObjectType | NumberType | BooleanType | UnknownType

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
}

/**
 * @public
 */
export type BooleanType = {
  kind: 'boolean';
  default?: boolean;
}

/**
 * @public
 */
export type UnknownType = {
  kind: 'unknown';
}

export type ObjectType = {
  kind: 'object';
  members: Member[];
  minProperties: number;
  maxProperties: number;
  additionalProperties?: true;
}

export type ArrayType = {
  kind: 'array';
  type: Type;
  uniqueItems?: boolean;
  minItems?: number;
  maxItems?: number;
}

export type Member = {
  name: string;
  type: Type;
  optional?: boolean;
  tag?: number;
  enum?: any[];
  parameters?: {
    name: string;
    type: Type;
    optional?: boolean;
  }[];
}
