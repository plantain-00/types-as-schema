import { TypeDeclaration, Type, ReferenceType, ObjectDeclaration, Member, MemberParameter, warn } from './utils'

const stageName = 'grapql schema generator'

export function generateGraphqlSchema(declarations: TypeDeclaration[]) {
  const inputTypeSet = new Set<TypeDeclaration>()
  for (const typeDeclaration of declarations) {
    collectInputTypeSet(typeDeclaration, declarations, inputTypeSet, false)
  }

  const messages: string[] = []
  for (const typeDeclaration of declarations) {
    if (typeDeclaration.kind === 'object') {
      const message = generateGraphqlSchemaOfObject(declarations, typeDeclaration, inputTypeSet)
      if (message) {
        messages.push(message)
      }
    } else if (typeDeclaration.kind === 'enum') {
      const members = typeDeclaration.members.map(m => `  ${m.name}`)
      messages.push(`enum ${typeDeclaration.name} {
${members.join('\n')}
}`)
    } else if (typeDeclaration.kind === 'union') {
      if (typeDeclaration.members.every(m => m.kind === 'reference')) {
        const members = (typeDeclaration.members as ReferenceType[]).map(m => m.name)
        messages.push(`union ${typeDeclaration.name} = ${members.join(' | ')}`)
      } else {
        warn(typeDeclaration.position, stageName)
      }
    } else if (typeDeclaration.kind === 'string' && typeDeclaration.enums) {
      const members = typeDeclaration.enums.map(m => `  ${m}`)
      messages.push(`enum ${typeDeclaration.name} {
${members.join('\n')}
}`)
    }
  }
  return messages.join('\n\n') + '\n'
}

// tslint:disable-next-line:cognitive-complexity
function collectInputTypeSet(
  typeDeclaration: TypeDeclaration,
  declarations: TypeDeclaration[],
  inputTypeSet: Set<TypeDeclaration>,
  isSureInput: boolean
) {
  if (typeDeclaration.kind === 'object') {
    for (const member of typeDeclaration.members) {
      if (member.parameters) {
        for (const parameter of member.parameters) {
          if (parameter.type.kind === 'reference') {
            const referenceName = parameter.type.name
            const declaration = declarations.find((d) => d.name === referenceName)
            if (declaration) {
              collectInputTypeSet(declaration, declarations, inputTypeSet, true)
            }
          }
        }
      }

      if (isSureInput && member.type.kind === 'reference') {
        const referenceName = member.type.name
        const declaration = declarations.find((d) => d.name === referenceName)
        if (declaration) {
          collectInputTypeSet(declaration, declarations, inputTypeSet, true)
        }
      }
    }
  }

  if (isSureInput && !inputTypeSet.has(typeDeclaration)) {
    inputTypeSet.add(typeDeclaration)
    collectInputTypeSet(typeDeclaration, declarations, inputTypeSet, true)
  }
}

function generateGraphqlSchemaOfObject(typeDeclarations: TypeDeclaration[], objectDeclaration: ObjectDeclaration, inputTypeSet: Set<TypeDeclaration>) {
  if (objectDeclaration.members.length === 0) {
    return undefined
  }
  const members = objectDeclaration.members.map(m => generateGraphqlSchemaOfObjectMember(typeDeclarations, m))
  const type = inputTypeSet.has(objectDeclaration) ? 'input' : 'type'
  return `${type} ${objectDeclaration.name} {
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
  return parameters.length > 0 ? `(${parameters.join(', ')})` : ''
}

// tslint:disable-next-line:cognitive-complexity
function getGraphqlSchemaProperty(typeDeclarations: TypeDeclaration[], memberType: Type): string {
  let propertyType = ''
  if (memberType.kind === 'array') {
    const elementPropertyType = getGraphqlSchemaProperty(typeDeclarations, memberType.type)
    if (elementPropertyType) {
      propertyType = `[${elementPropertyType}]`
    }
  } else if (memberType.kind === 'enum') {
    if (memberType.name === 'string') {
      propertyType = 'String'
    } else {
      propertyType = memberType.name
    }
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
  } else if (memberType.kind === 'map') {
    warn(memberType.position, stageName)
    propertyType = 'JSON'
  } else if (memberType.kind === 'union') {
    // tslint:disable-next-line:no-collapsible-if
    if (memberType.members.some(m => m.kind !== 'reference')) {
      warn(memberType.position, stageName)
      propertyType = 'JSON'
    }
  }
  return propertyType
}

function getGraphqlSchemaPropertyOfReference(typeDeclarations: TypeDeclaration[], memberType: ReferenceType) {
  const typeDeclaration = typeDeclarations.find(m => m.name === memberType.name)
  if (typeDeclaration) {
    if (typeDeclaration.kind === 'enum' && typeDeclaration.type === 'string') {
      return 'String'
    }
    if (typeDeclaration.kind === 'object' && typeDeclaration.members.length === 0) {
      warn(memberType.position, stageName)
      return 'JSON'
    }
    if (typeDeclaration.kind === 'union' && typeDeclaration.members.some(m => m.kind !== 'reference')) {
      warn(memberType.position, stageName)
      return 'JSON'
    }
  }
  return memberType.name
}
