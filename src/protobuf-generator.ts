import { Model, Type, ReferenceType, MapType, ObjectModel, EnumModel } from './utils'

export function generateProtobuf(models: Model[]) {
  const messages: string[] = []
  for (const model of models) {
    if (model.kind === 'object') {
      const message = generateProtobufOfObject(models, model)
      messages.push(message)
    } else if (model.kind === 'enum') {
      const message = generateProtobufOfEnum(models, model)
      if (message) {
        messages.push(message)
      }
    }
  }
  return `syntax = "proto3";

${messages.join('\n\n')}
`
}

function generateProtobufOfObject(models: Model[], model: ObjectModel) {
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
  return `message ${model.name} {
${members.join('\n')}
}`
}

function generateProtobufOfEnum(models: Model[], model: EnumModel) {
  const members: string[] = []
  for (const member of model.members) {
    if (typeof member.value === 'number') {
      members.push(`    ${member.name} = ${member.value};`)
    }
  }
  if (members.length > 0) {
    return `enum ${model.name} {
${members.join('\n')}
}`
  }
  return undefined
}

function getProtobufProperty(models: Model[], memberType: Type): { modifier: string, propertyType: string } {
  let modifier = ''
  let propertyType = ''
  if (memberType.kind === 'map') {
    propertyType = getProtobufPropertyOfMap(models, memberType)
  } else if (memberType.kind === 'array') {
    modifier = 'repeated ';
    ({ propertyType } = getProtobufProperty(models, memberType.type))
  } else if (memberType.kind === 'enum') {
    propertyType = memberType.type === 'string' ? 'string' : memberType.name
  } else if (memberType.kind === 'reference') {
    propertyType = getProtobufPropertyOfReference(models, memberType)
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

function getProtobufPropertyOfReference(models: Model[], memberType: ReferenceType) {
  const model = models.find(m => m.kind === 'enum' && m.name === memberType.name)
  if (model && model.kind === 'enum' && model.type === 'string') {
    return 'string'
  }
  return memberType.name
}

function getProtobufPropertyOfMap(models: Model[], memberType: MapType) {
  let valueType = ''
  if (memberType.value.kind === 'number') {
    ({ propertyType: valueType } = getProtobufProperty(models, memberType.value))
  } else if (memberType.value.kind === 'reference') {
    valueType = memberType.value.name
  }
  if (valueType) {
    return `map<${memberType.key.kind}, ${valueType}>`
  }
  return ''
}
