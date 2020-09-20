import { Type, TypeDeclaration, toLowerCase, toUpperCase, ReferenceType, ObjectDeclaration } from './utils'

export function generateOcamlTypes(typeDeclarations: TypeDeclaration[]) {
  const messages: string[] = []
  for (const typeDeclaration of typeDeclarations) {
    if (typeDeclaration.kind === 'object') {
      messages.push(getOcamlTypeOfObjectDeclaration(typeDeclarations, typeDeclaration))
    } else if (typeDeclaration.kind === 'enum') {
      const members = typeDeclaration.members.map(m => `  | ${toUpperCase(m.name)}`).join('\n')
      messages.push(`type ${toLowerCase(typeDeclaration.name)} =\n${members}`)
    } else if (typeDeclaration.kind === 'union' && typeDeclaration.objectType) {
      messages.push(getOcamlTypeOfObjectDeclaration(typeDeclarations, { ...typeDeclaration, ...typeDeclaration.objectType }))
    }
  }
  return messages.join('\n\n') + '\n'
}

function getOcamlTypeOfObjectDeclaration(typeDeclarations: TypeDeclaration[], objectDeclaration: ObjectDeclaration): string {
  const members = objectDeclaration.members.map(m => {
    const propertyType = getOcamlTypesProperty(typeDeclarations, m.type)
    if (propertyType) {
      return `  ${m.name}: ${m.optional ? toLowerCase(propertyType) + ' option' : toLowerCase(propertyType)}`
    }
    return undefined
  })
  return `type ${toLowerCase(objectDeclaration.name)} = {
${members.filter(m => m).map(m => m + ';').join('\n')}
}`
}

function getOcamlTypesProperty(typeDeclarations: TypeDeclaration[], memberType: Type): string {
  let propertyType = ''
  if (memberType.kind === 'array') {
    const elementPropertyType = getOcamlTypesProperty(typeDeclarations, memberType.type)
    if (elementPropertyType) {
      propertyType = `${toLowerCase(elementPropertyType)} list`
    }
  } else if (memberType.kind === 'enum') {
    propertyType = memberType.name
  } else if (memberType.kind === 'reference') {
    propertyType = getOcamlTypesPropertyOfReference(typeDeclarations, memberType)
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

function getOcamlTypesPropertyOfReference(typeDeclarations: TypeDeclaration[], memberType: ReferenceType) {
  const typeDeclaration = typeDeclarations.find(m => m.kind === 'enum' && m.name === memberType.name)
  if (typeDeclaration && typeDeclaration.kind === 'enum' && typeDeclaration.type === 'string') {
    return 'string'
  }
  return memberType.name
}
