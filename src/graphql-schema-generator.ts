import { TypeDeclaration, Type, ReferenceType, ObjectDeclaration, Member, Parameter, warn } from './utils'

const stageName = 'grapql schema generator'

export function generateGraphqlSchema(declarations: TypeDeclaration[]) {
  const inputTypeSet = new Set<TypeDeclaration>()
  for (const typeDeclaration of declarations) {
    collectInputTypeSet(typeDeclaration, declarations, inputTypeSet, false)
  }

  const messages: string[] = []
  let hasJSON = false
  for (const typeDeclaration of declarations) {
    if (typeDeclaration.kind === 'object') {
      const message = generateGraphqlSchemaOfObject(declarations, typeDeclaration, inputTypeSet)
      if (message) {
        messages.push(message.result)
        if (!hasJSON) {
          hasJSON = message.hasJSON
        }
      }
    } else if (typeDeclaration.kind === 'enum') {
      const members = typeDeclaration.members.map(m => `  ${m.name}`)
      messages.push(`enum ${typeDeclaration.name} {
${members.join('\n')}
}`)
    } else if (typeDeclaration.kind === 'union') {
      if (typeDeclaration.members.every((m): m is ReferenceType => m.kind === 'reference')) {
        const members = typeDeclaration.members.map(m => m.name)
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
  const scalars = hasJSON ? `scalar JSON\n\n` : ''
  return scalars + messages.join('\n\n') + '\n'
}

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
  const hasJSON = members.some((m) => m.hasJSON)
  const type = inputTypeSet.has(objectDeclaration) ? 'input' : 'type'
  const result = `${type} ${objectDeclaration.name} {
${members.filter(m => m.result).map(m => m.result).join('\n')}
}`
  return {
    result,
    hasJSON
  }
}

function generateGraphqlSchemaOfObjectMember(typeDeclarations: TypeDeclaration[], member: Member) {
  const propertyType = getGraphqlSchemaProperty(typeDeclarations, member.type)
  let hasJSON = false
  let result: string | undefined
  if (propertyType.propertyType) {
    hasJSON = propertyType.hasJSON
    let parameterList = ''
    if (member.parameters) {
      const parameterResult = generateGraphqlSchemaOfParameters(typeDeclarations, member.parameters)
      parameterList = parameterResult.result
      if (!hasJSON) {
        hasJSON = parameterResult.hasJSON
      }
    }
    result = `  ${member.name}${parameterList}: ${member.optional ? propertyType.propertyType : propertyType.propertyType + '!'}`
  }
  return {
    result,
    hasJSON
  }
}

function generateGraphqlSchemaOfParameters(typeDeclarations: TypeDeclaration[], memberParameters: Parameter[]) {
  const parameters: string[] = []
  let hasJSON = false
  for (const parameter of memberParameters) {
    const parameterPropertyType = getGraphqlSchemaProperty(typeDeclarations, parameter.type)
    if (parameterPropertyType.propertyType) {
      if (parameter.optional) {
        parameters.push(`${parameter.name}: ${parameterPropertyType.propertyType}`)
      } else {
        parameters.push(`${parameter.name}: ${parameterPropertyType.propertyType}!`)
      }
      hasJSON = parameterPropertyType.hasJSON
    }
  }
  return {
    result: parameters.length > 0 ? `(${parameters.join(', ')})` : '',
    hasJSON
  }
}

function getGraphqlSchemaProperty(typeDeclarations: TypeDeclaration[], memberType: Type): { propertyType: string, hasJSON: boolean } {
  let propertyType = ''
  let hasJSON = false
  if (memberType.kind === 'array') {
    const elementPropertyType = getGraphqlSchemaProperty(typeDeclarations, memberType.type)
    if (elementPropertyType.propertyType) {
      propertyType = `[${elementPropertyType.propertyType}]`
      hasJSON = elementPropertyType.hasJSON
    }
  } else if (memberType.kind === 'enum') {
    if (memberType.name === 'string') {
      propertyType = 'String'
    } else {
      propertyType = memberType.name
    }
  } else if (memberType.kind === 'reference') {
    const referencePropertyType = getGraphqlSchemaPropertyOfReference(typeDeclarations, memberType)
    propertyType = referencePropertyType.propertyType
    hasJSON = referencePropertyType.hasJSON
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
    hasJSON = true
  } else if (memberType.kind === 'union') {
    if (memberType.members.some(m => m.kind !== 'reference')) {
      warn(memberType.position, stageName)
      propertyType = 'JSON'
      hasJSON = true
    }
  } else if (memberType.kind === undefined) {
    propertyType = 'JSON'
    hasJSON = true
  }
  return {
    propertyType,
    hasJSON
  }
}

function getGraphqlSchemaPropertyOfReference(typeDeclarations: TypeDeclaration[], memberType: ReferenceType) {
  const typeDeclaration = typeDeclarations.find(m => m.name === memberType.name)
  let hasJSON = false
  let propertyType = memberType.name
  if (typeDeclaration) {
    if (typeDeclaration.kind === 'enum' && typeDeclaration.type === 'string') {
      propertyType = 'String'
    } else if (typeDeclaration.kind === 'object' && typeDeclaration.members.length === 0) {
      warn(memberType.position, stageName)
      propertyType = 'JSON'
      hasJSON = true
    } else if (typeDeclaration.kind === 'union' && typeDeclaration.members.some(m => m.kind !== 'reference')) {
      warn(memberType.position, stageName)
      propertyType = 'JSON'
      hasJSON = true
    }
  }
  return {
    propertyType,
    hasJSON
  }
}
