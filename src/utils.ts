import ts from 'typescript'
import * as path from 'path'

export function toUpperCase(name: string) {
  return name[0].toUpperCase() + name.substring(1)
}

export function toLowerCase(name: string) {
  return name[0].toLowerCase() + name.substring(1)
}

export function warn(position: PositionValue, stage: string) {
  console.warn(`Warning for ${stage}: ${position.file}:${position.line + 1}:${position.character + 1}`)
}

export function getPosition(typeNode: ts.Node, sourceFile: ts.SourceFile) {
  return {
    file: path.relative(process.cwd(), sourceFile.fileName),
    ...ts.getLineAndCharacterOfPosition(sourceFile, typeNode.getStart(sourceFile))
  }
}

export function isValidReference(declarations: TypeDeclaration[], referenceName: string) {
  for (const declaration of declarations) {
    if (declaration.kind === 'reference') {
      if (declaration.newName === referenceName) {
        return true
      }
    } else if (declaration.name === referenceName) {
      return true
    }
  }
  return false
}

export interface Context {
  looseMode: boolean
  declarations: TypeDeclaration[]
}

export type TypeDeclaration =
  | EnumDeclaration
  | ObjectDeclaration
  | ArrayDeclaration
  | UnionDeclaration
  | StringDeclaration
  | NumberDeclaration
  | ReferenceDeclaration
  | FunctionDeclaration

export type EnumDeclaration = {
  kind: 'enum';
  name: string;
  type: string;
  members: EnumMember[];
} & Position

type Position = {
  position: PositionValue
}

type PositionValue = {
  file: string
  line: number
  character: number
}

/**
 * @public
 */
export type EnumMember = {
  name: string;
  value: string | number;
}

export type ObjectDeclaration = ObjectType & {
  name: string;
  entry?: string;
}

export type ArrayDeclaration = ArrayType & {
  name: string;
  entry?: string;
}

export type UnionDeclaration = UnionType & {
  name: string;
  entry?: string;
}

export type StringDeclaration = StringType & {
  name: string;
}

export type NumberDeclaration = NumberType & {
  name: string;
}

export type ReferenceDeclaration = ReferenceType & {
  newName: string;
}

export type FunctionDeclaration = {
  kind: 'function';
  name: string;
  type: Type;
  optional?: boolean;
  parameters: FunctionParameter[];
  method?: string;
  path?: string;
  description?: string
  summary?: string
  deprecated?: boolean
  tags?: string[]
}

export type FunctionParameter = Parameter & {
  in?: string
}

export type Type = StringType | MapType | ArrayType | EnumType | ReferenceType
  | ObjectType | NumberType | BooleanType | AnyType | NullType
  | UnionType

export type MapType = {
  kind: 'map';
  key: Type;
  value: Type;
  default?: unknown
} & Position

/**
 * @public
 */
export type EnumType = {
  kind: 'enum';
  type: string;
  name: string;
  enums: unknown[];
  default?: unknown
} & Position

export type ReferenceType = {
  kind: 'reference';
  name: string;
  default?: unknown;
} & Position

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
} & Position

export type StringType = {
  kind: 'string';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: string;
  enums?: string[];
  title?: string;
  description?: string;
  lowercase?: boolean;
  uppercase?: boolean;
  trim?: boolean;
} & Position

export type BooleanType = {
  kind: 'boolean';
  default?: boolean;
  title?: string;
  description?: string;
} & Position

/**
 * @public
 */
export type AnyType = {
  kind: undefined;
  default?: unknown
} & Position

export type ObjectType = {
  kind: 'object';
  members: Member[];
  minProperties: number;
  maxProperties?: number;
  additionalProperties?: boolean | Type;
  default?: unknown;
  title?: string;
  description?: string;
} & Position

export type ArrayType = {
  kind: 'array';
  type: Type;
  uniqueItems?: boolean;
  minItems?: number;
  maxItems?: number;
  default?: unknown[]
  title?: string;
  description?: string;
} & Position

/**
 * @public
 */
export type NullType = {
  kind: 'null'
  default?: unknown
} & Position

/**
 * @public
 */
export type UnionType = {
  kind: 'union';
  members: Type[];
  default?: unknown
} & Position

export type Member = {
  name: string;
  type: Type;
  optional?: boolean;
  tag?: number;
  index?: boolean
  unique?: boolean
  sparse?: boolean
  select?: boolean
  alias?: string
  parameters?: Parameter[];
}

export type Parameter = {
  name: string;
  type: Type;
  optional?: boolean;
}

export type Expression = {
  name: string;
  type: Type;
  value: unknown;
}
