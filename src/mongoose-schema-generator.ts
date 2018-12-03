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
  const propertyType = getMongooseSchemaProperty(member.type)
  const properties = [
    `type: ${propertyType}`,
    `required: ${!member.optional}`
  ]
  const defaultValue = getMongooseDefaultValue(member.type)
  if (defaultValue !== undefined) {
    properties.push(`default: ${defaultValue}`)
  }
  const enumValue = getMongooseEnumValue(member.type)
  if (enumValue !== undefined) {
    properties.push(`enum: [${enumValue}]`)
  }
  return `  ${member.name}: {
    ${properties.join(',\n    ')}
  },`
}

function getMongooseEnumValue(type: Type) {
  if (type.kind === 'enum' && type.type === 'string' && type.enums && type.enums.length > 0) {
    return type.enums.map((e) => `'${e}'`).join(', ')
  }
  return undefined
}

function getMongooseDefaultValue(type: Type) {
  if (typeof type.default === 'number') {
    return type.default
  }
  if (typeof type.default === 'string') {
    return `'${type.default}'`
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
  } else {
    propertyType = 'Mixed'
  }
  return `Schema.Types.${propertyType}`
}
