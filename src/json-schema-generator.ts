import {
  Type,
  ObjectDeclaration,
  ArrayDeclaration,
  UnionDeclaration,
  TypeDeclaration,
  NumberType,
  ObjectType,
  StringType
} from './utils'

export function generateJsonSchemas(typeDeclarations: TypeDeclaration[]) {
  const definitions: { [name: string]: Definition } = {}
  for (const typeDeclaration of typeDeclarations) {
    if (typeDeclaration.kind === 'object'
      || typeDeclaration.kind === 'array'
      || typeDeclaration.kind === 'union'
      || typeDeclaration.kind === 'string'
      || typeDeclaration.kind === 'number') {
      definitions[typeDeclaration.name] = getJsonSchemaProperty(typeDeclaration)
    } else if (typeDeclaration.kind === 'reference') {
      definitions[typeDeclaration.newName] = {
        type: undefined,
        $ref: `#/definitions/${typeDeclaration.name}`
      }
    }
  }
  return typeDeclarations.filter(m => (m.kind === 'object' || m.kind === 'array' || m.kind === 'union') && m.entry)
    .map(m => ({
      entry: (m as ObjectDeclaration | ArrayDeclaration | UnionDeclaration).entry!,
      schema: {
        $ref: `#/definitions/${m.name}`,
        definitions: getReferencedDefinitions(m.name, definitions)
      }
    }))
}

function getJsonSchemaProperty(memberType: Type): Definition {
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
      additionalProperties: getJsonSchemaProperty(memberType.value)
    }
  } else if (memberType.kind === 'array') {
    return {
      type: 'array',
      items: getJsonSchemaProperty(memberType.type),
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
        type: undefined,
        const: memberType.enums[0]
      }
    }
    return {
      type: undefined,
      enum: memberType.enums
    }
  } else if (memberType.kind === 'reference') {
    return {
      type: undefined,
      $ref: `#/definitions/${memberType.name}`,
      default: memberType.default
    }
  } else if (memberType.kind === 'object') {
    return getJsonSchemaPropertyOfObject(memberType)
  } else if (memberType.kind === 'string') {
    return getJsonSchemaPropertyOfString(memberType)
  } else if (memberType.kind === 'union') {
    return getJsonSchemaPropertyOfUnion(memberType as UnionDeclaration)
  } else if (memberType.kind === 'null') {
    return {
      type: 'null'
    }
  } else {
    return {
      type: memberType.kind
    }
  }
}

function getJsonSchemaPropertyOfUnion(memberType: UnionDeclaration): Definition {
  if (memberType.members.every(m => m.kind === 'enum' || m.kind === 'null')) {
    let enums: any[] = []
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
    anyOf: memberType.members.map(m => getJsonSchemaProperty(m))
  }
}

function getJsonSchemaPropertyOfString(memberType: StringType): Definition {
  if (memberType.enums) {
    if (memberType.enums.length === 1) {
      return {
        type: undefined,
        const: memberType.enums[0]
      }
    }
    return {
      type: undefined,
      enum: memberType.enums
    }
  }
  return {
    type: memberType.kind,
    minLength: memberType.minLength,
    maxLength: memberType.maxLength,
    pattern: memberType.pattern,
    default: memberType.default,
    title: memberType.title,
    description: memberType.description
  }
}

function getJsonSchemaPropertyOfObject(memberType: ObjectDeclaration | ObjectType): ObjectDefinition {
  const properties: { [name: string]: Definition } = {}
  const required: string[] = []
  for (const member of memberType.members) {
    if (!member.optional) {
      required.push(member.name)
    }
    properties[member.name] = getJsonSchemaProperty(member.type)
  }
  let additionalProperties: Definition | boolean | undefined
  if (memberType.additionalProperties === undefined) {
    additionalProperties = memberType.additionalProperties === undefined ? false : undefined
  } else if (memberType.additionalProperties === true || memberType.additionalProperties === false) {
    additionalProperties = memberType.additionalProperties
  } else {
    additionalProperties = getJsonSchemaProperty(memberType.additionalProperties)
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

function getReferencedDefinitions(typeName: string | Definition, definitions: { [name: string]: Definition }) {
  const result: { [name: string]: Definition } = {}
  const definition = typeof typeName === 'string' ? definitions[typeName] : typeName
  if (definition === undefined) {
    return result
  }
  if (typeof typeName === 'string') {
    result[typeName] = definition
  }
  if (definition.type === 'array') {
    Object.assign(result, getReferencedDefinitions(definition.items, definitions))
  } else if (definition.type === 'object') {
    if (definition.properties) {
      for (const propertyName in definition.properties) {
        if (definition.properties.hasOwnProperty(propertyName)) {
          const propertyDefinition = definition.properties[propertyName]
          Object.assign(result, getReferencedDefinitions(propertyDefinition, definitions))
        }
      }
    }
  } else if (definition.type === undefined) {
    Object.assign(result, getJsonSchemaPropertyOfUndefined(definition, definitions))
  }
  return result
}

function getJsonSchemaPropertyOfUndefined(definition: UndefinedDefinition, definitions: { [name: string]: Definition }) {
  const result: { [name: string]: Definition } = {}
  if (definition.$ref) {
    const itemTypeName = definition.$ref.substring('#/definitions/'.length)
    Object.assign(result, getReferencedDefinitions(itemTypeName, definitions))
  }
  if (definition.anyOf) {
    for (const reference of definition.anyOf) {
      Object.assign(result, getReferencedDefinitions(reference, definitions))
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
    definition = getIntegerType(numberType, 0, 18446744073709551615)
  } else if (numberType.type === 'int64' || numberType.type === 'sint64' || numberType.type === 'sfixed64') {
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

/**
 * @public
 */
export type NumberDefinition = {
  type: 'number' | 'integer',
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  default?: number;
  title?: string;
  description?: string;
}

/**
 * @public
 */
export type BooleanDefinition = {
  type: 'boolean';
  default?: boolean;
  title?: string;
  description?: string;
}

export type ObjectDefinition = {
  type: 'object',
  additionalProperties?: Definition | boolean,
  properties?: { [name: string]: Definition },
  required?: string[],
  minProperties?: number,
  maxProperties?: number,
  anyOf?: Definition[],
  default?: any
  title?: string;
  description?: string;
}

export type ArrayDefinition = {
  type: 'array',
  items: Definition,
  uniqueItems?: boolean,
  minItems?: number,
  maxItems?: number,
  default?: any[]
  title?: string;
  description?: string;
}

export type UndefinedDefinition = {
  type: undefined,
  $ref?: string,
  anyOf?: Definition[]
  enum?: any[]
  const?: any
  default?: any
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
  title?: string;
  description?: string;
}

/**
 * @public
 */
export type NullDefinition = {
  type: 'null'
}
