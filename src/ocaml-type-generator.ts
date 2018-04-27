import { Type, Model, toLowerCase, toUpperCase } from './utils'

export function generateOcamlTypes (models: Model[]) {
  const messages: string[] = []
  for (const model of models) {
    if (model.kind === 'object') {
      const members = model.members.map(m => {
        const propertyType = getOcamlTypesProperty(models, m.type)
        if (propertyType) {
          return `  ${m.name}: ${m.optional ? toLowerCase(propertyType) + ' option' : toLowerCase(propertyType)}`
        }
        return undefined
      })
      messages.push(`type ${toLowerCase(model.name)} = {
${members.filter(m => m).map(m => m + ';').join('\n')}
}`)
    } else if (model.kind === 'enum') {
      const members = model.members.map(m => `  | ${toUpperCase(m.name)}`).join('\n')
      messages.push(`type ${toLowerCase(model.name)} =\n${members}`)
    }
  }
  return messages.join('\n\n') + '\n'
}

function getOcamlTypesProperty (models: Model[], memberType: Type): string {
  let propertyType = ''
  if (memberType.kind === 'array') {
    const elementPropertyType = getOcamlTypesProperty(models, memberType.type)
    if (elementPropertyType) {
      propertyType = `${toLowerCase(elementPropertyType)} list`
    }
  } else if (memberType.kind === 'enum') {
    propertyType = memberType.name
  } else if (memberType.kind === 'reference') {
    const model = models.find(m => m.kind === 'enum' && m.name === memberType.name)
    if (model && model.kind === 'enum' && model.type === 'string') {
      propertyType = 'string'
    } else {
      propertyType = memberType.name
    }
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
