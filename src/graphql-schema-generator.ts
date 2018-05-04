import { TypeDeclaration, Type, ReferenceType, ObjectDeclaration, Member, MemberParameter } from './utils'

export function generateGraphqlSchema(declarations: TypeDeclaration[]) {
  const messages: string[] = []
  for (const typeDeclaration of declarations) {
    if (typeDeclaration.kind === 'object') {
      const message = generateGraphqlSchemaOfObject(declarations, typeDeclaration)
      messages.push(message)
    } else if (typeDeclaration.kind === 'enum') {
      const members = typeDeclaration.members.map(m => `  ${m.name}`)
      messages.push(`enum ${typeDeclaration.name} {
${members.join('\n')}
}`)
    }
  }
  return messages.join('\n\n') + '\n'
}

function generateGraphqlSchemaOfObject(typeDeclarations: TypeDeclaration[], objectDeclaration: ObjectDeclaration) {
  const members = objectDeclaration.members.map(m => generateGraphqlSchemaOfObjectMember(typeDeclarations, m))
  return `type ${objectDeclaration.name} {
${members.filter(m => m).join('\n')}
}`
}

function generateGraphqlSchemaOfObjectMember(typeDeclarations: TypeDeclaration[], member: Member) {
  const propertyType = getGraphqlSchemaProperty(typeDeclarations, member.type)
  if (propertyType) {
    let parameterList = ''
    if (member.parameters) {
      parameterList = generateGraphqlSchemaOfParameters(typeDeclarations, member.parameters)
    }
    return `  ${member.name}${parameterList}: ${member.optional ? propertyType : propertyType + '!'}`
  }
  return undefined
}

function generateGraphqlSchemaOfParameters(typeDeclarations: TypeDeclaration[], memberParameters: MemberParameter[]) {
  const parameters: string[] = []
  for (const parameter of memberParameters) {
    const parameterPropertyType = getGraphqlSchemaProperty(typeDeclarations, parameter.type)
    if (parameterPropertyType) {
      if (parameter.optional) {
        parameters.push(`${parameter.name}: ${parameterPropertyType}`)
      } else {
        parameters.push(`${parameter.name}: ${parameterPropertyType}!`)
      }
    }
  }
  return `(${parameters.join(', ')})`
}

function getGraphqlSchemaProperty(typeDeclarations: TypeDeclaration[], memberType: Type): string {
  let propertyType = ''
  if (memberType.kind === 'array') {
    const elementPropertyType = getGraphqlSchemaProperty(typeDeclarations, memberType.type)
    if (elementPropertyType) {
      propertyType = `[${elementPropertyType}]`
    }
  } else if (memberType.kind === 'enum') {
    propertyType = memberType.name
  } else if (memberType.kind === 'reference') {
    propertyType = getGraphqlSchemaPropertyOfReference(typeDeclarations, memberType)
  } else if (memberType.kind === 'number') {
    if (memberType.type === 'number'
      || memberType.type === 'float'
      || memberType.type === 'double') {
      propertyType = 'Float'
    } else {
      propertyType = 'Int'
    }
  } else if (memberType.kind === 'string') {
    propertyType = 'String'
  } else if (memberType.kind === 'boolean') {
    propertyType = 'Boolean'
  }
  return propertyType
}

function getGraphqlSchemaPropertyOfReference(typeDeclarations: TypeDeclaration[], memberType: ReferenceType) {
  const typeDeclaration = typeDeclarations.find(m => m.kind === 'enum' && m.name === memberType.name)
  if (typeDeclaration && typeDeclaration.kind === 'enum' && typeDeclaration.type === 'string') {
    return 'String'
  }
  return memberType.name
}
