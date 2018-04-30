import { Model, Type, ReferenceType, ObjectModel, Member, MemberParameter } from './utils'

export function generateGraphqlSchema(models: Model[]) {
  const messages: string[] = []
  for (const model of models) {
    if (model.kind === 'object') {
      const message = generateGraphqlSchemaOfObject(models, model)
      messages.push(message)
    } else if (model.kind === 'enum') {
      const members = model.members.map(m => `  ${m.name}`)
      messages.push(`enum ${model.name} {
${members.join('\n')}
}`)
    }
  }
  return messages.join('\n\n') + '\n'
}

function generateGraphqlSchemaOfObject(models: Model[], model: ObjectModel) {
  const members = model.members.map(m => generateGraphqlSchemaOfObjectMember(models, m))
  return `type ${model.name} {
${members.filter(m => m).join('\n')}
}`
}

function generateGraphqlSchemaOfObjectMember(models: Model[], member: Member) {
  const propertyType = getGraphqlSchemaProperty(models, member.type)
  if (propertyType) {
    let parameterList = ''
    if (member.parameters) {
      parameterList = generateGraphqlSchemaOfParameters(models, member.parameters)
    }
    return `  ${member.name}${parameterList}: ${member.optional ? propertyType : propertyType + '!'}`
  }
  return undefined
}

function generateGraphqlSchemaOfParameters(models: Model[], memberParameters: MemberParameter[]) {
  const parameters: string[] = []
  for (const parameter of memberParameters) {
    const parameterPropertyType = getGraphqlSchemaProperty(models, parameter.type)
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

function getGraphqlSchemaProperty(models: Model[], memberType: Type): string {
  let propertyType = ''
  if (memberType.kind === 'array') {
    const elementPropertyType = getGraphqlSchemaProperty(models, memberType.type)
    if (elementPropertyType) {
      propertyType = `[${elementPropertyType}]`
    }
  } else if (memberType.kind === 'enum') {
    propertyType = memberType.name
  } else if (memberType.kind === 'reference') {
    propertyType = getGraphqlSchemaPropertyOfReference(models, memberType)
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

function getGraphqlSchemaPropertyOfReference(models: Model[], memberType: ReferenceType) {
  const model = models.find(m => m.kind === 'enum' && m.name === memberType.name)
  if (model && model.kind === 'enum' && model.type === 'string') {
    return 'String'
  }
  return memberType.name
}
