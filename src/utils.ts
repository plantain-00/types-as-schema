export function warn(position: PositionValue, stage: string) {
  console.warn(`Warning for ${stage}: ${position.file}:${position.line + 1}:${position.character + 1}`)
}

export function isValidReference(declarations: TypeDeclaration[], referenceName: string) {
  for (const declaration of declarations) {
    if (declaration.kind === 'reference') {
      if (declaration.name === referenceName) {
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
  | BooleanDeclaration
  | MapDeclaration
  | ReferenceDeclaration
  | FunctionDeclaration
  | NullDeclaration
  | UnknownDeclaration

/**
 * @public
 */
export type UnknownDeclaration = {
  kind: 'unknown';
  description?: string;
} & Position & JsDocAndComment & Modifiers & TypeArguments & DeclarationCommon

export type EnumDeclaration = DeclarationCommon & {
  kind: 'enum';
  type: string;
  members: EnumMember[];
  description?: string;
} & Position & JsDocAndComment & Modifiers

/**
 * @public
 */
export interface Position {
  position: PositionValue
}

/**
 * @public
 */
export interface PositionValue {
  file: string
  line: number
  character: number
}

/**
 * @public
 */
export interface Modifiers {
  modifiers?: Modifier[]
}

/**
 * @public
 */
export type Modifier =
  | 'abstract'
  | 'async'
  | 'const'
  | 'declare'
  | 'default'
  | 'export'
  | 'private'
  | 'protected'
  | 'public'
  | 'override'
  | 'readonly'
  | 'static'

/**
 * @public
 */
export interface EnumMember {
  name: string;
  value: string | number;
  description?: string;
}

export type ObjectDeclaration = ObjectType & Modifiers & DeclarationCommon

export type ArrayDeclaration = ArrayType & Modifiers & DeclarationCommon

export type UnionDeclaration = UnionType & Modifiers & DeclarationCommon & {
  objectType?: ObjectType;
}

export type StringDeclaration = StringType & Modifiers & DeclarationCommon

export type NumberDeclaration = NumberType & Modifiers & DeclarationCommon

/**
 * @public
 */
export type BooleanDeclaration = BooleanType & Modifiers & DeclarationCommon

/**
 * @public
 */
export type NullDeclaration = NullType & Modifiers & DeclarationCommon

/**
 * @public
 */
export type MapDeclaration = MapType & Modifiers & DeclarationCommon

export type ReferenceDeclaration = ReferenceType & Modifiers & DeclarationCommon

interface DeclarationCommon {
  name: string
  entry?: string;
}

export type FunctionDeclaration = FunctionType & Modifiers & JsDocAndComment & TypeArguments & TypeParameters & DeclarationCommon & {
  optional?: boolean;
  method?: string;
  path?: string;
  summary?: string
  deprecated?: boolean
  tags?: string[]
  body?: string
}

/**
 * @public
 */
export interface FunctionType extends Position {
  kind: 'function';
  type: Type;
  parameters: FunctionParameter[];
  default?: unknown;
  description?: string

}

export type FunctionParameter = Parameter & {
  in?: string
}

export type Type = StringType | MapType | ArrayType | EnumType | ReferenceType
  | ObjectType | NumberType | BooleanType | AnyType | NullType
  | UnionType | FileType | VoidType | FunctionType

export type MapType = {
  kind: 'map';
  key: Type;
  value: Type;
  default?: unknown
  description?: string
} & Position & JsDocAndComment

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
} & Position & JsDocAndComment

export type ReferenceType = {
  kind: 'reference';
  referenceName: string;
  default?: unknown;
  description?: string
} & Position & JsDocAndComment

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
} & Position & JsDocAndComment

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
  templateLiteral?: TemplateLiteralPart[];
} & Position & JsDocAndComment

export type TemplateLiteralPart =
  | {
    kind: 'enum'
    enums: string[]
  }
  | {
    kind: 'string'
  }
  | {
    kind: 'number'
  }
  | {
    kind: 'boolean'
  }

export function templateLiteralToPattern(templateLiteral: TemplateLiteralPart[]) {
  let pattern = ''
  for (const t of templateLiteral) {
    if (t.kind === 'string') {
      pattern += '.*'
    } else if (t.kind === 'number') {
      pattern += '\\d+'
    } else if (t.kind === 'boolean') {
      pattern += 'true|false'
    } else if (t.kind === 'enum') {
      pattern += t.enums.map((e) => escapeRegex(e)).join('|')
    }
  }
  return `^${pattern}$`
}

function escapeRegex(s: string) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export type BooleanType = {
  kind: 'boolean';
  default?: boolean;
  title?: string;
  description?: string;
} & Position & JsDocAndComment

/**
 * @public
 */
export type AnyType = {
  kind: undefined;
  default?: unknown
  description?: string
} & Position & JsDocAndComment

export type ObjectType = {
  kind: 'object';
  members: Member[];
  minProperties: number;
  maxProperties?: number;
  additionalProperties?: boolean | Type;
  default?: unknown;
  title?: string;
  description?: string;
} & Position & JsDocAndComment & Decorators

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
} & Position & JsDocAndComment

/**
 * @public
 */
export type NullType = {
  kind: 'null'
  default?: unknown
  description?: string
} & Position & JsDocAndComment

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
} & Position & JsDocAndComment

export interface Member extends JsDocAndComment, Decorators {
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

export interface JsDocAndComment {
  comments?: string[]
  jsDocs?: JsDoc[]
}

export interface JsDoc {
  name: string;
  type?: Type;
  paramName?: string;
  comment?: string;
  optional?: boolean;
}

/**
 * @public
 */
export interface Parameter extends JsDocAndComment, Decorators {
  name: string;
  type: Type;
  optional?: boolean;
}

export interface Expression {
  name: string;
  type: Type;
  value: unknown;
}

/**
 * @public
 */
export interface TypeArguments {
  typeArguments?: Type[]
}

/**
 * @public
 */
export interface TypeParameters {
  typeParameters?: TypeParameter[]
}

/**
 * @public
 */
export interface TypeParameter {
  name: string
  constraint?: Type
}
