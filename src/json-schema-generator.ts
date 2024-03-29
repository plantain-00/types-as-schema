import {
  Type,
  ObjectDeclaration,
  NumberType,
  ObjectType,
  StringType,
  isValidReference,
  Context, UnionType, templateLiteralToPattern
} from './utils'

export function generateJsonSchemas(context: Context) {
  const definitions = getAllDefinitions(context)
  const result: {
    entry: string
    schema: {
      $ref: string;
      definitions: {
        [name: string]: Definition;
      };
    };
  }[] = []
  for (const m of context.declarations) {
    if ((m.kind === 'object' || m.kind === 'array' || m.kind === 'union') && m.entry) {
      result.push({
        entry: m.entry,
        schema: {
          $ref: `#/definitions/${m.name}`,
          definitions: getReferencedDefinitions(m.name, definitions, [])
        }
      })
    }
  }
  if (result.length === 0) {
    console.warn('No json schema generated because no @entry found.')
  }
  return result
}

export function getAllDefinitions(context: Context) {
  const definitions: { [name: string]: Definition } = {}
  for (const typeDeclaration of context.declarations) {
    if (typeDeclaration.kind === 'object'
      || typeDeclaration.kind === 'array'
      || typeDeclaration.kind === 'union'
      || typeDeclaration.kind === 'string'
      || typeDeclaration.kind === 'number') {
      definitions[typeDeclaration.name] = getJsonSchemaProperty(typeDeclaration, context)
    } else if (typeDeclaration.kind === 'reference') {
      definitions[typeDeclaration.name] = {
        type: undefined,
        $ref: `#/definitions/${typeDeclaration.referenceName}`
      }
    } else if (typeDeclaration.kind === 'enum') {
      if (typeDeclaration.members.length === 1) {
        definitions[typeDeclaration.name] = {
          type: getTypeNameOfEnumOrConst(typeDeclaration.type),
          const: typeDeclaration.members[0]
        } as Definition
      } else {
        definitions[typeDeclaration.name] = {
          type: getTypeNameOfEnumOrConst(typeDeclaration.type),
          enum: typeDeclaration.members.map((m) => m.value)
        } as Definition
      }
    }
  }
  return definitions
}

function getTypeNameOfEnumOrConst(type: string) {
  if (type === 'boolean' || type === 'string') {
    return type
  }
  if (type === 'double' || type === 'float' || type === 'number') {
    return 'number'
  }
  return 'integer'
}

export function getJsonSchemaProperty(memberType: Type, context: Context): Definition {
  if (memberType.kind === 'number') {
    return getNumberType(memberType)
  } else if (memberType.kind === 'boolean') {
    return {
      type: 'boolean',
      default: memberType.default,
      title: memberType.title,
      description: memberType.description
    }
  } else if (memberType.kind === 'map') {
    return {
      type: 'object',
      additionalProperties: getJsonSchemaProperty(memberType.value, context)
    }
  } else if (memberType.kind === 'array') {
    return {
      type: 'array',
      items: getJsonSchemaProperty(memberType.type, context),
      uniqueItems: memberType.uniqueItems,
      minItems: memberType.minItems,
      maxItems: memberType.maxItems,
      default: memberType.default,
      title: memberType.title,
      description: memberType.description
    }
  } else if (memberType.kind === 'enum') {
    if (memberType.enums.length === 1) {
      return {
        type: getTypeNameOfEnumOrConst(memberType.type),
        const: memberType.enums[0]
      }
    }
    return {
      type: getTypeNameOfEnumOrConst(memberType.type),
      enum: memberType.enums,
      default: memberType.default as string,
    } as Definition
  } else if (memberType.kind === 'reference') {
    if (isValidReference(context.declarations, memberType.referenceName)) {
      return {
        type: undefined,
        $ref: `#/definitions/${memberType.referenceName}`,
        default: memberType.default
      }
    }
    return {
      type: undefined
    }
  } else if (memberType.kind === 'object') {
    return getJsonSchemaPropertyOfObject(memberType, context)
  } else if (memberType.kind === 'string') {
    return getJsonSchemaPropertyOfString(memberType)
  } else if (memberType.kind === 'union') {
    return getJsonSchemaPropertyOfUnion(memberType, context)
  } else if (memberType.kind === 'void') {
    return {
      type: undefined
    }
  } else if (memberType.kind === 'file') {
    if (!context.allowFileType) {
      return {
        type: undefined
      }
    }
  } else if (memberType.kind === 'function') {
    return {
      type: undefined
    }
  }
  return {
    type: memberType.kind
  }
}

function getJsonSchemaPropertyOfUnion(memberType: UnionType, context: Context): Definition {
  if (memberType.members.every(m => m.kind === 'enum' || m.kind === 'null')) {
    let enums: unknown[] = []
    for (const member of memberType.members) {
      if (member.kind === 'enum') {
        enums = enums.concat(member.enums)
      } else if (member.kind === 'null') {
        enums.push(null)
      }
    }
    return {
      type: undefined,
      enum: enums
    }
  }
  return {
    type: undefined,
    anyOf: memberType.members.map(m => getJsonSchemaProperty(m, context))
  }
}

function getJsonSchemaPropertyOfString(memberType: StringType): Definition {
  if (memberType.enums) {
    if (memberType.enums.length === 1) {
      return {
        type: 'string',
        const: memberType.enums[0]
      }
    }
    return {
      type: 'string',
      enum: memberType.enums
    }
  }
  let pattern: string | undefined
  if (memberType.templateLiteral) {
    pattern = templateLiteralToPattern(memberType.templateLiteral)
  } else {
    pattern = memberType.pattern
  }
  return {
    type: memberType.kind,
    minLength: memberType.minLength,
    maxLength: memberType.maxLength,
    pattern,
    default: memberType.default,
    title: memberType.title,
    description: memberType.description
  }
}

function getJsonSchemaPropertyOfObject(memberType: ObjectDeclaration | ObjectType, context: Context): ObjectDefinition {
  const properties: { [name: string]: Definition } = {}
  const required: string[] = []
  for (const member of memberType.members) {
    if (!member.optional) {
      required.push(member.name)
    }
    properties[member.name] = getJsonSchemaProperty(member.type, context)
  }
  let additionalProperties: Definition | boolean | undefined
  if (memberType.additionalProperties === undefined) {
    additionalProperties = context.looseMode ? undefined : false
  } else if (typeof memberType.additionalProperties === 'boolean') {
    additionalProperties = memberType.additionalProperties
  } else {
    additionalProperties = getJsonSchemaProperty(memberType.additionalProperties, context)
  }
  return {
    type: 'object',
    properties,
    required,
    additionalProperties,
    minProperties: memberType.minProperties > memberType.members.filter(m => !m.optional).length ? memberType.minProperties : undefined,
    maxProperties: memberType.maxProperties && memberType.maxProperties < memberType.members.length ? memberType.maxProperties : undefined,
    default: memberType.default,
    title: memberType.title,
    description: memberType.description
  }
}

export function getReferencedDefinitions(
  typeName: string | Definition,
  definitions: { [name: string]: Definition },
  dependents: string[]
) {
  const result: { [name: string]: Definition } = {}
  const definition = typeof typeName === 'string' ? definitions[typeName] : typeName
  if (definition === undefined) {
    return result
  }
  if (typeof typeName === 'string') {
    result[typeName] = definition
    if (dependents.includes(typeName)) {
      return result
    }
    dependents.push(typeName)
  }
  if (definition.type === 'array') {
    Object.assign(result, getReferencedDefinitions(definition.items, definitions, dependents))
  } else if (definition.type === 'object') {
    if (definition.properties) {
      for (const propertyName in definition.properties) {
        if (definition.properties.hasOwnProperty(propertyName)) {
          const propertyDefinition = definition.properties[propertyName]!
          Object.assign(result, getReferencedDefinitions(propertyDefinition, definitions, dependents))
        }
      }
    }
    if (definition.additionalProperties
      && definition.additionalProperties !== true
      && definition.additionalProperties.type === undefined) {
      Object.assign(result, getJsonSchemaPropertyOfUndefined(definition.additionalProperties, definitions, dependents))
    }
  } else if (definition.type === undefined) {
    Object.assign(result, getJsonSchemaPropertyOfUndefined(definition, definitions, dependents))
  }
  if (typeof typeName === 'string') {
    dependents.pop()
  }
  return result
}

function getJsonSchemaPropertyOfUndefined(
  definition: UndefinedDefinition,
  definitions: { [name: string]: Definition },
  dependents: string[]
) {
  const result: { [name: string]: Definition } = {}
  if (definition.$ref) {
    const itemTypeName = definition.$ref.substring('#/definitions/'.length)
    Object.assign(result, getReferencedDefinitions(itemTypeName, definitions, dependents))
  }
  if (definition.anyOf) {
    for (const reference of definition.anyOf) {
      Object.assign(result, getReferencedDefinitions(reference, definitions, dependents))
    }
  }
  return result
}

function getNumberType(numberType: NumberType): NumberDefinition {
  let definition: Definition
  if (numberType.type === 'double' || numberType.type === 'float') {
    definition = {
      type: 'number',
      minimum: numberType.minimum,
      maximum: numberType.maximum
    }
  } else if (numberType.type === 'uint32' || numberType.type === 'fixed32') {
    definition = getIntegerType(numberType, 0, 4294967295)
  } else if (numberType.type === 'int32' || numberType.type === 'sint32' || numberType.type === 'sfixed32') {
    definition = getIntegerType(numberType, -2147483648, 2147483647)
  } else if (numberType.type === 'uint64' || numberType.type === 'fixed64') {
    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    definition = getIntegerType(numberType, 0, 18446744073709551615)
  } else if (numberType.type === 'int64' || numberType.type === 'sint64' || numberType.type === 'sfixed64') {
    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    definition = getIntegerType(numberType, -9223372036854775808, 9223372036854775807)
  } else if (numberType.type === 'number' || numberType.type === 'integer') {
    definition = {
      type: numberType.type,
      minimum: numberType.minimum,
      maximum: numberType.maximum
    }
  } else {
    definition = {
      type: numberType.kind,
      minimum: numberType.minimum,
      maximum: numberType.maximum
    }
  }
  Object.assign(definition, {
    multipleOf: numberType.multipleOf,
    exclusiveMinimum: numberType.exclusiveMinimum,
    exclusiveMaximum: numberType.exclusiveMaximum,
    default: numberType.default,
    title: numberType.title,
    description: numberType.description
  })
  return definition
}

function getIntegerType(numberType: NumberType, minimum: number, maximum: number): NumberDefinition {
  return {
    type: 'integer',
    minimum: numberType.minimum !== undefined ? numberType.minimum : minimum,
    maximum: numberType.maximum !== undefined ? numberType.maximum : maximum
  }
}

/**
 * @public
 */
export type Definition =
  | NumberDefinition
  | BooleanDefinition
  | ObjectDefinition
  | ArrayDefinition
  | UndefinedDefinition
  | StringDefinition
  | NullDefinition
  | FileDefinition

/**
 * @public
 */
export type NumberDefinition = {
  type: 'number' | 'integer'
  minimum?: number
  maximum?: number
  exclusiveMinimum?: number
  exclusiveMaximum?: number
  multipleOf?: number
  default?: number
} & CommonDefinition

/**
 * @public
 */
export type BooleanDefinition = {
  type: 'boolean'
  default?: boolean
} & CommonDefinition

/**
 * @public
 */
export type ObjectDefinition = {
  type: 'object'
  additionalProperties?: Definition | boolean
  properties?: { [name: string]: Definition }
  required?: string[]
  minProperties?: number
  maxProperties?: number
  anyOf?: Definition[]
  default?: unknown
} & CommonDefinition

/**
 * @public
 */
export type ArrayDefinition = {
  type: 'array'
  items: Definition
  uniqueItems?: boolean
  minItems?: number
  maxItems?: number
  default?: unknown[]
} & CommonDefinition

/**
 * @public
 */
export type UndefinedDefinition = {
  type: undefined
  $ref?: string
  anyOf?: Definition[]
  default?: unknown
} & CommonDefinition

type FileDefinition = {
  type: 'file'
}

interface CommonDefinition {
  enum?: unknown[]
  const?: unknown
  title?: string
  description?: string;
}

/**
 * @public
 */
export type StringDefinition = {
  type: 'string',
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: string;
} & CommonDefinition

/**
 * @public
 */
export interface NullDefinition {
  type: 'null'
}
