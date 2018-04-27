import { Model, Type } from './utils'

export function generateGraphqlSchema (models: Model[]) {
  const messages: string[] = []
  for (const model of models) {
    if (model.kind === 'object') {
      const members = model.members.map(m => {
        const propertyType = getGraphqlSchemaProperty(models, m.type)
        if (propertyType) {
          let parameterList = ''
          if (m.parameters) {
            const parameters: string[] = []
            for (const parameter of m.parameters) {
              const parameterPropertyType = getGraphqlSchemaProperty(models, parameter.type)
              if (parameterPropertyType) {
                if (parameter.optional) {
                  parameters.push(`${parameter.name}: ${parameterPropertyType}`)
                } else {
                  parameters.push(`${parameter.name}: ${parameterPropertyType}!`)
                }
              }
            }
            parameterList = `(${parameters.join(', ')})`
          }
          return `  ${m.name}${parameterList}: ${m.optional ? propertyType : propertyType + '!'}`
        }
        return undefined
      })
      messages.push(`type ${model.name} {
${members.filter(m => m).join('\n')}
}`)
    } else if (model.kind === 'enum') {
      const members = model.members.map(m => `  ${m.name}`)
      messages.push(`enum ${model.name} {
${members.join('\n')}
}`)
    }
  }
  return messages.join('\n\n') + '\n'
}

function getGraphqlSchemaProperty (models: Model[], memberType: Type): string {
  let propertyType = ''
  if (memberType.kind === 'array') {
    const elementPropertyType = getGraphqlSchemaProperty(models, memberType.type)
    if (elementPropertyType) {
      propertyType = `[${elementPropertyType}]`
    }
  } else if (memberType.kind === 'enum') {
    propertyType = memberType.name
  } else if (memberType.kind === 'reference') {
    const model = models.find(m => m.kind === 'enum' && m.name === memberType.name)
    if (model && model.kind === 'enum' && model.type === 'string') {
      propertyType = 'String'
    } else {
      propertyType = memberType.name
    }
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
