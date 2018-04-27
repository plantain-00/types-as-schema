import { Model, Type } from './utils'

export function generateProtobuf (models: Model[]) {
  const messages: string[] = []
  for (const model of models) {
    if (model.kind === 'object') {
      const members: string[] = []
      let lastTag = model.members.reduce((p, c) => c.tag ? Math.max(p, c.tag) : p, 0)
      for (const member of model.members) {
        if (!member.tag) {
          lastTag++
        }
        const { modifier, propertyType } = getProtobufProperty(models, member.type)
        if (propertyType) {
          members.push(`    ${modifier}${propertyType} ${member.name} = ${member.tag ? member.tag : lastTag};`)
        }
      }
      messages.push(`message ${model.name} {
${members.join('\n')}
}`)
    } else if (model.kind === 'enum') {
      const members: string[] = []
      for (const member of model.members) {
        if (typeof member.value === 'number') {
          members.push(`    ${member.name} = ${member.value};`)
        }
      }
      if (members.length > 0) {
        messages.push(`enum ${model.name} {
${members.join('\n')}
}`)
      }
    }
  }
  return `syntax = "proto3";

${messages.join('\n\n')}
`
}

function getProtobufProperty (models: Model[], memberType: Type): { modifier: string, propertyType: string } {
  let modifier = ''
  let propertyType = ''
  if (memberType.kind === 'map') {
    let valueType = ''
    if (memberType.value.kind === 'number') {
      const { propertyType: valuePropertyType } = getProtobufProperty(models, memberType.value)
      valueType = valuePropertyType
    } else if (memberType.value.kind === 'reference') {
      valueType = memberType.value.name
    }
    if (valueType) {
      propertyType = `map<${memberType.key.kind}, ${valueType}>`
    }
  } else if (memberType.kind === 'array') {
    modifier = 'repeated '
    const { propertyType: elementPropertyType } = getProtobufProperty(models, memberType.type)
    propertyType = elementPropertyType
  } else if (memberType.kind === 'enum') {
    propertyType = memberType.type === 'string' ? 'string' : memberType.name
  } else if (memberType.kind === 'reference') {
    const model = models.find(m => m.kind === 'enum' && m.name === memberType.name)
    if (model && model.kind === 'enum' && model.type === 'string') {
      propertyType = 'string'
    } else {
      propertyType = memberType.name
    }
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
