export function toUpperCase(name: string) {
  return name[0].toUpperCase() + name.substring(1)
}

export function toLowerCase(name: string) {
  return name[0].toLowerCase() + name.substring(1)
}

export function warn(position: PositionValue, stage: string) {
  console.warn(`Warning for ${stage}: ${position.file}:${position.line + 1}:${position.character + 1}`)
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

export function getReferencesInType(type: Type): ReferenceType[] {
  const result: ReferenceType[] = []
  if (type.kind === 'reference') {
    result.push(type)
  } else if (type.kind === 'object') {
    for (const member of type.members) {
      result.push(...getReferencesInType(member.type))
    }
  } else if (type.kind === 'array') {
    result.push(...getReferencesInType(type.type))
  }
  return result
}

export interface Context {
  looseMode: boolean
  declarations: TypeDeclaration[]
  allowFileType?: boolean
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
  description?: string;
} & Position & Comments

interface Position {
  position: PositionValue
}

interface PositionValue {
  file: string
  line: number
  character: number
}

/**
 * @public
 */
export interface EnumMember {
  name: string;
  value: string | number;
  description?: string;
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
  objectType?: ObjectType;
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

export interface FunctionDeclaration extends Comments {
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
  | UnionType | FileType | VoidType

export type MapType = {
  kind: 'map';
  key: Type;
  value: Type;
  default?: unknown
  description?: string
} & Position & Comments

/**
 * @public
 */
export type EnumType = {
  kind: 'enum';
  type: string;
  name: string;
  enums: unknown[];
  default?: unknown
  description?: string
} & Position & Comments

export type ReferenceType = {
  kind: 'reference';
  name: string;
  default?: unknown;
  description?: string
} & Position & Comments

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
} & Position & Comments

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
} & Position & Comments

export type BooleanType = {
  kind: 'boolean';
  default?: boolean;
  title?: string;
  description?: string;
} & Position & Comments

/**
 * @public
 */
export type AnyType = {
  kind: undefined;
  default?: unknown
  description?: string
} & Position & Comments

export type ObjectType = {
  kind: 'object';
  members: Member[];
  minProperties: number;
  maxProperties?: number;
  additionalProperties?: boolean | Type;
  default?: unknown;
  title?: string;
  description?: string;
} & Position & Comments & Decorators

export type Decorator = {
  name: string
  parameters?: unknown[]
}

type Decorators = {
  decorators?: Decorator[]
}

export type ArrayType = {
  kind: 'array';
  type: Type;
  uniqueItems?: boolean;
  minItems?: number;
  maxItems?: number;
  default?: unknown[]
  title?: string;
  description?: string;
} & Position & Comments

/**
 * @public
 */
export type NullType = {
  kind: 'null'
  default?: unknown
  description?: string
} & Position & Comments

/**
 * @public
 */
 export type FileType = {
  kind: 'file'
  default?: unknown
  description?: string
} & Position

/**
 * @public
 */
 export type VoidType = {
  kind: 'void'
  default?: unknown
  description?: string
} & Position

/**
 * @public
 */
export type UnionType = {
  kind: 'union';
  members: Type[];
  default?: unknown
  description?: string
} & Position & Comments

export interface Member extends Comments, Decorators {
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

interface Comments {
  comments?: string[]
}

export interface Parameter extends Comments, Decorators {
  name: string;
  type: Type;
  optional?: boolean;
}

export interface Expression {
  name: string;
  type: Type;
  value: unknown;
}
