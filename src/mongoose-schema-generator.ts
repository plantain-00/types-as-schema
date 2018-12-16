import { TypeDeclaration, ObjectDeclaration, toLowerCase, Member, Type } from './utils'

export function generateMongooseSchema(typeDeclarations: TypeDeclaration[]) {
  const messages: string[] = []
  for (const typeDeclaration of typeDeclarations) {
    if (typeDeclaration.kind === 'object') {
      messages.push(generateMongooseSchemaOfObject(typeDeclaration))
    }
  }
  return `// tslint:disable

import { Schema } from 'mongoose'

` + messages.join('\n\n') + '\n'
}

function generateMongooseSchemaOfObject(objectDeclaration: ObjectDeclaration) {
  const members = objectDeclaration.members.map(m => generateMongooseSchemaOfObjectMember(m))
  return `export const ${toLowerCase(objectDeclaration.name)}Schema = {
${members.join('\n')}
}`
}

function generateMongooseSchemaOfObjectMember(member: Member) {
  const type = generateType(member.type, 2, member.optional, member.index, member.unique, member.sparse, member.select, member.alias)
  return `  ${member.name}: ${type},`
}

// tslint:disable-next-line:cognitive-complexity
function generateType(
  type: Type,
  indentationCount: number,
  optional?: boolean,
  index?: boolean,
  unique?: boolean,
  sparse?: boolean,
  select?: boolean,
  alias?: string
) {
  const propertyType = getMongooseSchemaProperty(type)
  const properties = [
    `type: ${propertyType}`,
    `required: ${!optional}`
  ]

  const defaultValue = getMongooseDefaultValue(type)
  if (defaultValue !== undefined) {
    properties.push(`default: ${defaultValue}`)
  }

  const enumValue = getMongooseEnumValue(type)
  if (enumValue !== undefined) {
    properties.push(`enum: [${enumValue}]`)
  }

  if (type.kind === 'number') {
    if (type.minimum !== undefined) {
      properties.push(`min: ${type.minimum}`)
    }
    if (type.maximum !== undefined) {
      properties.push(`max: ${type.maximum}`)
    }
  }

  if (type.kind === 'string') {
    if (type.minLength !== undefined) {
      properties.push(`minLength: ${type.minLength}`)
    }
    if (type.maxLength !== undefined) {
      properties.push(`maxLength: ${type.maxLength}`)
    }
    if (type.pattern !== undefined) {
      properties.push(`match: ${escapeStringLiteral(type.pattern)}`)
    }
    if (type.lowercase) {
      properties.push(`lowercase: true`)
    }
    if (type.uppercase) {
      properties.push(`uppercase: true`)
    }
    if (type.trim) {
      properties.push(`trim: true`)
    }
  }

  if (index) {
    properties.push(`index: true`)
  }
  if (unique) {
    properties.push(`unique: true`)
  }
  if (sparse) {
    properties.push(`sparse: true`)
  }
  if (select) {
    properties.push(`select: true`)
  }
  if (alias) {
    properties.push(`alias: ${escapeStringLiteral(alias)}`)
  }

  const indentation = '  '.repeat(indentationCount)
  return `{
${indentation}${properties.join(',\n' + indentation)}
${'  '.repeat(indentationCount - 1)}}`
}

function getMongooseEnumValue(type: Type) {
  if (type.kind === 'enum' && type.type === 'string' && type.enums && type.enums.length > 0) {
    return type.enums.map((e) => `${escapeStringLiteral(e)}`).join(', ')
  }
  return undefined
}

function getMongooseDefaultValue(type: Type) {
  if (typeof type.default === 'number') {
    return type.default
  }
  if (typeof type.default === 'string') {
    return escapeStringLiteral(type.default)
  }
  return undefined
}

function getMongooseSchemaProperty(memberType: Type) {
  let propertyType = ''
  if (memberType.kind === 'string') {
    propertyType = 'String'
  } else if (memberType.kind === 'boolean') {
    propertyType = 'Boolean'
  } else if (memberType.kind === 'number') {
    propertyType = 'Number'
  } else if (memberType.kind === 'array') {
    const itemType = generateType(memberType.type, 4)
    propertyType = `[
      ${itemType}
    ]`
  } else if (memberType.kind === 'reference') {
    if ((memberType.name === 'ObjectId' || memberType.name === 'ObjectID')) {
      propertyType = 'Schema.Types.ObjectId'
    } else if (memberType.name === 'Date') {
      propertyType = 'Date'
    } else if (memberType.name === 'Decimal128') {
      propertyType = 'Schema.Types.Decimal128'
    } else if (memberType.name === 'Buffer') {
      propertyType = 'Schema.Types.Buffer'
    } else {
      propertyType = 'Schema.Types.Mixed'
    }
  } else {
    propertyType = 'Schema.Types.Mixed'
  }
  return propertyType
}

function escapeStringLiteral(s: string) {
  return JSON.stringify(s)
}
