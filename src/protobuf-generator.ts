import { TypeDeclaration, Type, ReferenceType, MapType, ObjectDeclaration, EnumDeclaration, warn } from './utils'

export function generateProtobuf(typeDeclarations: TypeDeclaration[]) {
  const messages: string[] = []
  for (const typeDeclaration of typeDeclarations) {
    if (typeDeclaration.kind === 'object') {
      const message = generateProtobufOfObject(typeDeclarations, typeDeclaration)
      messages.push(message)
    } else if (typeDeclaration.kind === 'enum') {
      const message = generateProtobufOfEnum(typeDeclaration)
      if (message) {
        messages.push(message)
      }
    } else if (typeDeclaration.kind === 'union' && typeDeclaration.objectType) {
      const message = generateProtobufOfObject(typeDeclarations, { ...typeDeclaration, ...typeDeclaration.objectType })
      messages.push(message)
    }
  }
  return `syntax = "proto3";

${messages.join('\n\n')}
`
}

function generateProtobufOfObject(typeDeclarations: TypeDeclaration[], objectDeclaration: ObjectDeclaration) {
  const members: string[] = []
  let lastTag = objectDeclaration.members.reduce((p, c) => c.tag ? Math.max(p, c.tag) : p, 0)
  for (const member of objectDeclaration.members) {
    if (!member.tag) {
      lastTag++
    }
    const { modifier, propertyType } = getProtobufProperty(typeDeclarations, member.type)
    if (propertyType && member.name) {
      members.push(`    ${modifier}${propertyType} ${member.name} = ${member.tag ? member.tag : lastTag};`)
    } else {
      warn(member.type.position, 'protobuf generator')
    }
  }
  return `message ${objectDeclaration.name} {
${members.join('\n')}
}`
}

function generateProtobufOfEnum(enumDeclaration: EnumDeclaration) {
  const members: string[] = []
  for (const member of enumDeclaration.members) {
    if (typeof member.value === 'number') {
      members.push(`    ${member.name} = ${member.value};`)
    }
  }
  if (members.length > 0) {
    return `enum ${enumDeclaration.name} {
${members.join('\n')}
}`
  }
  return undefined
}

function getProtobufProperty(typeDeclarations: TypeDeclaration[], memberType: Type): { modifier: string, propertyType: string } {
  let modifier = ''
  let propertyType = ''
  if (memberType.kind === 'map') {
    propertyType = getProtobufPropertyOfMap(typeDeclarations, memberType)
  } else if (memberType.kind === 'array') {
    modifier = 'repeated ';
    ({ propertyType } = getProtobufProperty(typeDeclarations, memberType.type))
  } else if (memberType.kind === 'enum') {
    propertyType = memberType.type === 'string' ? 'string' : memberType.name
  } else if (memberType.kind === 'reference') {
    propertyType = getProtobufPropertyOfReference(typeDeclarations, memberType)
  } else if (memberType.kind === 'number') {
    if (memberType.type === 'number') {
      propertyType = 'double'
    } else if (memberType.type === 'integer') {
      propertyType = 'int32'
    } else {
      propertyType = memberType.type
    }
  } else if (memberType.kind === 'string') {
    propertyType = memberType.kind
  } else if (memberType.kind === 'boolean') {
    propertyType = 'bool'
  }
  return { modifier, propertyType }
}

function getProtobufPropertyOfReference(typeDeclarations: TypeDeclaration[], memberType: ReferenceType) {
  const typeDeclaration = typeDeclarations.find(m => m.kind === 'enum' && m.name === memberType.name)
  if (typeDeclaration && typeDeclaration.kind === 'enum' && typeDeclaration.type === 'string') {
    return 'string'
  }
  return memberType.name
}

function getProtobufPropertyOfMap(typeDeclarations: TypeDeclaration[], memberType: MapType) {
  let valueType = ''
  if (memberType.value.kind === 'number') {
    ({ propertyType: valueType } = getProtobufProperty(typeDeclarations, memberType.value))
  } else if (memberType.value.kind === 'reference') {
    valueType = memberType.value.name
  }
  if (valueType) {
    return `map<${memberType.key.kind}, ${valueType}>`
  }
  return ''
}
