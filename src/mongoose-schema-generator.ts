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
  return `  ${member.name}: {
    type: ${propertyType},
    required: ${!member.optional}
  },`
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
