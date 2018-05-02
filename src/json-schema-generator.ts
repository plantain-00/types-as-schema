import {
  Type,
  ObjectModel,
  ArrayModel,
  UnionModel,
  Model,
  NumberType,
  ObjectType,
  StringType
} from './utils'

export function generateJsonSchemas(models: Model[]) {
  const definitions: { [name: string]: Definition } = {}
  for (const model of models) {
    if (model.kind === 'object'
      || model.kind === 'array'
      || model.kind === 'union'
      || model.kind === 'string'
      || model.kind === 'number') {
      definitions[model.name] = getJsonSchemaProperty(model)
    } else if (model.kind === 'reference') {
      definitions[model.newName] = {
        type: undefined,
        $ref: `#/definitions/${model.name}`
      }
    }
  }
  return models.filter(m => (m.kind === 'object' || m.kind === 'array' || m.kind === 'union') && m.entry)
    .map(m => ({
      entry: (m as ObjectModel | ArrayModel | UnionModel).entry!,
      schema: {
        $ref: `#/definitions/${m.name}`,
        definitions: getReferencedDefinitions(m.name, definitions)
      }
    }))
}

function getJsonSchemaProperty(memberType: Type | ObjectModel | ArrayModel | UnionModel): Definition {
  if (memberType.kind === 'number') {
    return getNumberType(memberType)
  } else if (memberType.kind === 'boolean') {
    return {
      type: 'boolean',
      default: memberType.default
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
      default: memberType.default
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
    return {
      type: undefined,
      anyOf: memberType.members.map(m => getJsonSchemaProperty(m))
    }
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

function getJsonSchemaPropertyOfString(memberType: StringType) {
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
    default: memberType.default
  }
}

function getJsonSchemaPropertyOfObject(memberType: ObjectModel | ObjectType): Definition {
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
    default: memberType.default
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

function getNumberType(numberType: NumberType): Definition {
  let definition: Definition
  if (numberType.type === 'double' || numberType.type === 'float') {
    definition = {
      type: 'number',
      minimum: numberType.minimum,
      maximum: numberType.maximum
    }
  } else if (numberType.type === 'uint32' || numberType.type === 'fixed32') {
    definition = getUInt32Type(numberType)
  } else if (numberType.type === 'int32' || numberType.type === 'sint32' || numberType.type === 'sfixed32') {
    definition = getInt32Type(numberType)
  } else if (numberType.type === 'uint64' || numberType.type === 'fixed64') {
    definition = getUint64Type(numberType)
  } else if (numberType.type === 'int64' || numberType.type === 'sint64' || numberType.type === 'sfixed64') {
    definition = getInt64Type(numberType)
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
    default: numberType.default
  })
  return definition
}

function getUInt32Type(numberType: NumberType): NumberDefinition {
  return {
    type: 'integer',
    minimum: numberType.minimum !== undefined ? numberType.minimum : 0,
    maximum: numberType.maximum !== undefined ? numberType.maximum : 4294967295
  }
}

function getInt32Type(numberType: NumberType): NumberDefinition {
  return {
    type: 'integer',
    minimum: numberType.minimum !== undefined ? numberType.minimum : -2147483648,
    maximum: numberType.maximum !== undefined ? numberType.maximum : 2147483647
  }
}

function getUint64Type(numberType: NumberType): NumberDefinition {
  return {
    type: 'integer',
    minimum: numberType.minimum !== undefined ? numberType.minimum : 0,
    maximum: numberType.maximum !== undefined ? numberType.maximum : 18446744073709551615
  }
}

function getInt64Type(numberType: NumberType): NumberDefinition {
  return {
    type: 'integer',
    minimum: numberType.minimum !== undefined ? numberType.minimum : -9223372036854775808,
    maximum: numberType.maximum !== undefined ? numberType.maximum : 9223372036854775807
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
}

/**
 * @public
 */
export type BooleanDefinition = {
  type: 'boolean';
  default?: boolean;
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
}

export type ArrayDefinition = {
  type: 'array',
  items: Definition,
  uniqueItems?: boolean,
  minItems?: number,
  maxItems?: number,
  default?: any[]
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
}

/**
 * @public
 */
export type NullDefinition = {
  type: 'null'
}
