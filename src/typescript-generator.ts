import {
  TypeDeclaration,
  Type,
  FunctionDeclaration,
  FunctionParameter,
  EnumDeclaration,
  EnumMember,
  ObjectDeclaration,
  UnionDeclaration,
  StringDeclaration,
  ReferenceDeclaration,
  NumberDeclaration,
  TemplateLiteralPart,
  Member
} from './utils'

/**
 * @public
 */
export function generateTypescript(declarations: TypeDeclaration[]) {
  const messages: string[] = []
  for (const declaration of declarations) {
    if (declaration.kind === 'function') {
      if (declaration.name) {
        messages.push(generateTypescriptOfFunctionDeclaration(declaration))
      }
    } else if (declaration.kind === 'enum') {
      messages.push(generateTypescriptOfEnumDeclaration(declaration))
    } else if (declaration.kind === 'object') {
      messages.push(generateTypescriptOfObjectDeclaration(declaration))
    } else if (declaration.kind === 'union') {
      messages.push(generateTypescriptOfUnionDeclaration(declaration))
    } else if (declaration.kind === 'string' || declaration.kind === 'number') {
      messages.push(generateTypescriptOfStringOrNumberDeclaration(declaration))
    } else if (declaration.kind === 'reference') {
      messages.push(generateTypescriptOfReferenceDeclaration(declaration))
    }
  }
  return `/* eslint-disable */

${messages.join('\n\n')}
`
}

/**
 * @public
 */
export function generateTypescriptOfReferenceDeclaration(declaration: ReferenceDeclaration) {
  const comments = declaration.comments ? declaration.comments.join('\n') + '\n' : ''
  if (declaration.name.includes('.')) {
    const [namespace, typeName] = declaration.name.split('.')
    return `namespace ${namespace} {
${comments}  export type ${typeName} = ${declaration.referenceName}}
}`
  }
  return `${comments}type ${declaration.name} = ${declaration.referenceName}`
}

/**
 * @public
 */
export function generateTypescriptOfStringOrNumberDeclaration(declaration: StringDeclaration | NumberDeclaration) {
  const comments = declaration.comments ? declaration.comments.join('\n') + '\n' : ''
  const members = declaration.enums ? declaration.enums.map((e) => JSON.stringify(e)).join(' | ') : declaration.kind
  if (declaration.name.includes('.')) {
    const [namespace, typeName] = declaration.name.split('.')
    return `namespace ${namespace} {
${comments}  export type ${typeName} = ${members}}
}`
  }
  return `${comments}type ${declaration.name} = ${members}`
}

/**
 * @public
 */
export function generateTypescriptOfUnionDeclaration(declaration: UnionDeclaration) {
  const members = declaration.members.map((m) => generateTypescriptOfType(m))
  const comments = declaration.comments ? declaration.comments.join('\n') + '\n' : ''
  if (declaration.name.includes('.')) {
    const [namespace, typeName] = declaration.name.split('.')
    return `namespace ${namespace} {
${comments}  export type ${typeName} = ${members.join(' | ')}
}`
  }
  return `${comments}type ${declaration.name} = ${members.join(' | ')}`
}

/**
 * @public
 */
export function generateTypescriptOfObjectDeclaration(declaration: ObjectDeclaration) {
  const members = declaration.members.map((m) => {
    const comments = m.comments ? m.comments.join('\n') + '\n  ' : ''
    return (declaration.name.includes('.') ? '    ' : '  ') + comments + generateTypescriptOfMember(m)}
  )
  if (declaration.additionalProperties) {
    members.push('  ' + generateTypescriptOfObjectAdditionalProperties(declaration.additionalProperties))
  }
  const comments = declaration.comments ? declaration.comments.join('\n') + '\n' : ''
  if (declaration.name.includes('.')) {
    const [namespace, typeName] = declaration.name.split('.')
    return `namespace ${namespace} {
${comments}  export interface ${typeName} {
${members.join('\n')}
  }
}`
  }
  return `${comments}interface ${declaration.name} {
${members.join('\n')}
}`
}

function generateTypescriptOfMember(member: Member, processChild?: (type: Type) => string | void | undefined) {
  if (member.parameters) {
    const parameters = member.parameters.map((m) => generateTypescriptOfFunctionParameter(m))
    return `${member.name}(${parameters.join(', ')}): ${generateTypescriptOfType(member.type, processChild)}`
  }
  return generateTypescriptOfFunctionParameter(member, processChild)
}

/**
 * @public
 */
export function generateTypescriptOfObjectAdditionalProperties(additionalProperties: true | Type) {
  const type = additionalProperties === true ? 'unknown' : generateTypescriptOfType(additionalProperties)
  return `[name: string]: ${type}`
}

/**
 * @public
 */
export function generateTypescriptOfEnumDeclaration(declaration: EnumDeclaration) {
  const indent = declaration.name.includes('.') ? '    ' : '  '
  const members = declaration.members.map((m) => generateTypescriptOfEnumMember(m, indent))
  if (declaration.name.includes('.')) {
    const [namespace, typeName] = declaration.name.split('.')
    return `namespace ${namespace} {
  export const enum ${typeName} {
${members.join('\n')}
  }
}`
  }
  return `const enum ${declaration.name} {
${members.join('\n')}
}`
}

/**
 * @public
 */
export function generateTypescriptOfEnumMember(member: EnumMember, indent = '  ') {
  const value = JSON.stringify(member.value)
  return `${indent}${member.name} = ${value},`
}

/**
 * @public
 */
export function generateTypescriptOfFunctionDeclaration(declaration: FunctionDeclaration) {
  const parameters = declaration.parameters.map((m) => generateTypescriptOfFunctionParameter(m))
  const type = generateTypescriptOfType(declaration.type)
  const comments = declaration.comments ? declaration.comments.join('\n') + '\n' : ''
  const typeParameters = declaration.typeParameters && declaration.typeParameters.length > 0
    ? '<' + declaration.typeParameters.map((t) => t.constraint ? `${t.name} extends ${generateTypescriptOfType(t.constraint)}` : t.name).join(', ') + '>'
    : ''
  if (declaration.name.includes('.')) {
    const [namespace, typeName] = declaration.name.split('.')
    return `namespace ${namespace} {
${comments}  export declare function ${typeName}${typeParameters}(${parameters.join(', ')}): ${type}
}`
  }
  return `${comments}declare function ${declaration.name}${typeParameters}(${parameters.join(', ')}): ${type}`
}

/**
 * @public
 */
export function generateTypescriptOfFunctionParameter(parameter: FunctionParameter, processChild?: (type: Type) => string | void | undefined) {
  const optional = parameter.optional ? '?' : ''
  return `${parameter.name}${optional}: ${generateTypescriptOfType(parameter.type, processChild)}`
}

function generateTypescriptTemplateLiteral(templateLiteral: TemplateLiteralPart[]) {
  let result = ''
  for (const part of templateLiteral) {
    if (part.kind === 'string') {
      result += '${string}'
    } else if (part.kind === 'number') {
      result += '${number}'
    } else if (part.kind === 'boolean') {
      result += '${boolean}'
    } else if (part.kind === 'enum') {
      if (part.enums.length === 1) {
        result += part.enums[0]
      } else {
        result += `\${${part.enums.map((e) => JSON.stringify(e)).join(' | ')}}`
      }
    }
  }
  return `\`${result}\``
}

/**
 * @public
 */
export function generateTypescriptOfType(type: Type, processChild?: (type: Type) => string | void | undefined): string {
  if (processChild) {
    const childResult = processChild(type)
    if (childResult !== undefined) {
      return childResult
    }
  }
  if (type.kind === 'enum') {
    return type.enums.map((e) => JSON.stringify(e)).join(' | ')
  }
  if (type.kind === 'string' && type.templateLiteral) {
    return generateTypescriptTemplateLiteral(type.templateLiteral)
  }
  if (type.kind === 'boolean' || type.kind === 'number' || type.kind === 'string' || type.kind === 'null') {
    return type.kind
  }
  if (type.kind === 'array') {
    const item = generateTypescriptOfType(type.type, processChild)
    if (type.minItems && type.maxItems && type.minItems === type.maxItems) {
      return `[${Array.from({ length: type.minItems }).fill(item).join(', ')}]`
    }
    if ((type.type.kind === 'enum' || type.type.kind === 'number' || type.type.kind === 'string') && type.type.enums && type.type.enums.length > 1) {
      return `(${item})[]`
    }
    return `${item}[]`
  }
  if (type.kind === 'reference') {
    return type.referenceName
  }
  if (type.kind === 'file') {
    return 'File'
  }
  if (type.kind === 'void') {
    return 'void'
  }
  if (type.kind === 'union') {
    return type.members.map((e) => generateTypescriptOfType(e, processChild)).join(' | ')
  }
  if (type.kind === 'object') {
    const members = type.members.map((m) => generateTypescriptOfMember(m, processChild))
    if (type.additionalProperties) {
      members.push(generateTypescriptOfObjectAdditionalProperties(type.additionalProperties))
    }
    return `{ ${members.join(', ')} }`
  }
  if (type.kind === 'map') {
    const keyType = generateTypescriptOfType(type.key, processChild)
    const valueType = generateTypescriptOfType(type.value, processChild)
    return `{ [name: ${keyType}]: ${valueType} }`
  }
  if (type.kind === 'function') {
    const parameters = type.parameters.map((m) => generateTypescriptOfFunctionParameter(m, processChild))
    return `(${parameters.join(', ')}) => ${generateTypescriptOfType(type.type)}`
  }
  return 'unknown'
}
