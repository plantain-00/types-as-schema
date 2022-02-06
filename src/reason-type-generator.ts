import { TypeDeclaration, Type, toLowerCase, toUpperCase, ReferenceType, ObjectDeclaration } from './utils'

export function generateReasonTypes(typeDeclarations: TypeDeclaration[]) {
  const messages: string[] = []
  for (const typeDeclaration of typeDeclarations) {
    if (typeDeclaration.kind === 'object') {
      messages.push(getReasonTypeOfObjectDeclaration(typeDeclarations, typeDeclaration))
    } else if (typeDeclaration.kind === 'enum') {
      const members = typeDeclaration.members.map(m => `  | ${toUpperCase(m.name)}`).join('\n')
      messages.push(`type ${toLowerCase(typeDeclaration.name)} =\n${members};`)
    } else if (typeDeclaration.kind === 'union' && typeDeclaration.objectType) {
      messages.push(getReasonTypeOfObjectDeclaration(typeDeclarations, { ...typeDeclaration, ...typeDeclaration.objectType }))
    }
  }
  return messages.join('\n\n') + '\n'
}

function getReasonTypeOfObjectDeclaration(typeDeclarations: TypeDeclaration[], objectDeclaration: ObjectDeclaration) {
  const members = objectDeclaration.members.map(m => {
    const propertyType = getReasonTypesProperty(typeDeclarations, m.type)
    if (propertyType && m.name) {
      const type = m.optional ? `option(${toLowerCase(propertyType)})` : toLowerCase(propertyType)
      return `  ${m.name}: ${type}`
    }
    return undefined
  })
  return `type ${toLowerCase(objectDeclaration.name)} = {
  .
${members.filter(m => m).map(m => m + ',').join('\n')}
};`
}

function getReasonTypesProperty(typeDeclarations: TypeDeclaration[], memberType: Type): string {
  let propertyType = ''
  if (memberType.kind === 'array') {
    const elementPropertyType = getReasonTypesProperty(typeDeclarations, memberType.type)
    if (elementPropertyType) {
      propertyType = `list(${toLowerCase(elementPropertyType)})`
    }
  } else if (memberType.kind === 'enum') {
    propertyType = memberType.name
  } else if (memberType.kind === 'reference') {
    propertyType = getReasonTypesPropertyOfReference(typeDeclarations, memberType)
  } else if (memberType.kind === 'number') {
    if (memberType.type === 'number'
      || memberType.type === 'float'
      || memberType.type === 'double') {
      propertyType = 'float'
    } else {
      propertyType = 'int'
    }
  } else if (memberType.kind === 'string') {
    propertyType = 'string'
  } else if (memberType.kind === 'boolean') {
    propertyType = 'bool'
  }
  return propertyType
}

function getReasonTypesPropertyOfReference(typeDeclarations: TypeDeclaration[], memberType: ReferenceType): string {
  const typeDeclaration = typeDeclarations.find(m => m.kind === 'enum' && m.name === memberType.name)
  if (typeDeclaration && typeDeclaration.kind === 'enum' && typeDeclaration.type === 'string') {
    return 'string'
  }
  return memberType.name
}
