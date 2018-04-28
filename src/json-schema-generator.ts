import {
  Type,
  ObjectModel,
  ArrayModel,
  UnionModel,
  Model,
  NumberType
} from './utils'

export function generateJsonSchemas (models: Model[]) {
  const definitions: { [name: string]: Definition } = {}
  for (const model of models) {
    if (model.kind === 'object'
      || model.kind === 'array'
      || model.kind === 'union'
      || model.kind === 'string'
      || model.kind === 'number') {
      definitions[model.name] = getJsonSchemaProperty(model)
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

function getJsonSchemaProperty (memberType: Type | ObjectModel | ArrayModel | UnionModel): Definition {
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
      maxItems: memberType.maxItems
    }
  } else if (memberType.kind === 'enum') {
    if (memberType.type === 'string') {
      return {
        type: 'string',
        enum: memberType.enums
      }
    } else {
      const definition = getNumberType({
        kind: 'number',
        type: memberType.type
      })
      Object.assign(definition, {
        enum: memberType.enums,
        minimum: undefined,
        maximum: undefined
      })
      return definition
    }
  } else if (memberType.kind === 'reference') {
    return {
      type: undefined,
      $ref: `#/definitions/${memberType.name}`
    }
  } else if (memberType.kind === 'object') {
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
      maxProperties: memberType.maxProperties && memberType.maxProperties < memberType.members.length ? memberType.maxProperties : undefined
    }
  } else if (memberType.kind === 'string') {
    return {
      type: memberType.kind,
      minLength: memberType.minLength,
      maxLength: memberType.maxLength,
      pattern: memberType.pattern,
      default: memberType.default,
      enum: memberType.enums
    }
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

function getReferencedDefinitions (typeName: string | Definition, definitions: { [name: string]: Definition }) {
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
    if (definition.$ref) {
      const itemTypeName = definition.$ref.substring('#/definitions/'.length)
      Object.assign(result, getReferencedDefinitions(itemTypeName, definitions))
    }
    if (definition.anyOf) {
      for (const reference of definition.anyOf) {
        Object.assign(result, getReferencedDefinitions(reference, definitions))
      }
    }
  }
  return result
}

function getNumberType (numberType: NumberType): Definition {
  let definition: Definition
  if (numberType.type === 'double' || numberType.type === 'float') {
    definition = {
      type: 'number',
      minimum: numberType.minimum,
      maximum: numberType.maximum
    }
  } else if (numberType.type === 'uint32' || numberType.type === 'fixed32') {
    definition = {
      type: 'integer',
      minimum: numberType.minimum !== undefined ? numberType.minimum : 0,
      maximum: numberType.maximum !== undefined ? numberType.maximum : 4294967295
    }
  } else if (numberType.type === 'int32' || numberType.type === 'sint32' || numberType.type === 'sfixed32') {
    definition = {
      type: 'integer',
      minimum: numberType.minimum !== undefined ? numberType.minimum : -2147483648,
      maximum: numberType.maximum !== undefined ? numberType.maximum : 2147483647
    }
  } else if (numberType.type === 'uint64' || numberType.type === 'fixed64') {
    definition = {
      type: 'integer',
      minimum: numberType.minimum !== undefined ? numberType.minimum : 0,
      maximum: numberType.maximum !== undefined ? numberType.maximum : 18446744073709551615
    }
  } else if (numberType.type === 'int64' || numberType.type === 'sint64' || numberType.type === 'sfixed64') {
    definition = {
      type: 'integer',
      minimum: numberType.minimum !== undefined ? numberType.minimum : -9223372036854775808,
      maximum: numberType.maximum !== undefined ? numberType.maximum : 9223372036854775807
    }
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

type Definition =
  {
    type: 'number' | 'integer',
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number;
    exclusiveMaximum?: number;
    enum?: number[],
    multipleOf?: number;
    default?: number;
  }
  |
  {
    type: 'boolean';
    default?: boolean;
  }
  |
  {
    type: 'object',
    additionalProperties?: Definition | boolean,
    properties?: { [name: string]: Definition },
    required?: string[],
    minProperties?: number,
    maxProperties?: number,
    anyOf?: Definition[]
  }
  |
  {
    type: 'array',
    items: Definition,
    uniqueItems?: boolean,
    minItems?: number,
    maxItems?: number
  }
  |
  {
    type: undefined,
    $ref?: string,
    anyOf?: Definition[]
  }
  |
  {
    type: 'string',
    enum?: string[],
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    default?: string;
  }
  |
  {
    type: 'null'
  }
