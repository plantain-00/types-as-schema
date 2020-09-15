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
  NumberDeclaration
} from './utils'

/**
 * @public
 */
export function generateTypescript(declarations: TypeDeclaration[]) {
  const messages: string[] = []
  for (const declaration of declarations) {
    if (declaration.kind === 'function') {
      messages.push(generateTypescriptOfFunctionDeclaration(declaration))
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
  return `type ${declaration.newName} = ${declaration.name}`
}

/**
 * @public
 */
export function generateTypescriptOfStringOrNumberDeclaration(declaration: StringDeclaration | NumberDeclaration) {
  const members = declaration.enums ? declaration.enums.map((e) => JSON.stringify(e)).join(' | ') : declaration.kind
  return `type ${declaration.name} = ${members}`
}

/**
 * @public
 */
export function generateTypescriptOfUnionDeclaration(declaration: UnionDeclaration) {
  const members = declaration.members.map(generateTypescriptOfType)
  return `type ${declaration.name} = ${members.join(' | ')}`
}

/**
 * @public
 */
export function generateTypescriptOfObjectDeclaration(declaration: ObjectDeclaration) {
  const members = declaration.members.map((m) => '  ' + generateTypescriptOfFunctionParameter(m))
  if (declaration.additionalProperties) {
    members.push('  ' + generateTypescriptOfObjectAdditionalProperties(declaration.additionalProperties))
  }
  return `interface ${declaration.name} {
${members.join('\n')}
}`
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
  const members = declaration.members.map(generateTypescriptOfEnumMember)
  return `const enum ${declaration.name} {
${members.join('\n')}
}`
}

/**
 * @public
 */
export function generateTypescriptOfEnumMember(member: EnumMember) {
  const value = JSON.stringify(member.value)
  return `  ${member.name} = ${value},`
}

/**
 * @public
 */
export function generateTypescriptOfFunctionDeclaration(declaration: FunctionDeclaration) {
  const parameters = declaration.parameters.map(generateTypescriptOfFunctionParameter)
  const type = generateTypescriptOfType(declaration.type)
  return `declare function ${declaration.name}(${parameters.join(', ')}): ${type}`
}

/**
 * @public
 */
export function generateTypescriptOfFunctionParameter(parameter: FunctionParameter) {
  const optional = parameter.optional ? '?' : ''
  return `${parameter.name}${optional}: ${generateTypescriptOfType(parameter.type)}`
}

/**
 * @public
 */
export function generateTypescriptOfType(type: Type): string {
  if (type.kind === 'enum') {
    return type.enums.map((e) => JSON.stringify(e)).join(' | ')
  }
  if (type.kind === 'boolean' || type.kind === 'number' || type.kind === 'string' || type.kind === 'null') {
    return type.kind
  }
  if (type.kind === 'array') {
    const item = generateTypescriptOfType(type.type)
    if (type.minItems && type.maxItems && type.minItems === type.maxItems) {
      return `[${Array.from({ length: type.minItems }).fill(item).join(', ')}]`
    }
    if ((type.type.kind === 'enum' || type.type.kind === 'number' || type.type.kind === 'string') && type.type.enums && type.type.enums.length > 1) {
      return `(${item})[]`
    }
    return `${item}[]`
  }
  if (type.kind === 'reference') {
    return type.name
  }
  if (type.kind === 'union') {
    return type.members.map((e) => generateTypescriptOfType(e)).join(' | ')
  }
  if (type.kind === 'object') {
    const members = type.members.map(generateTypescriptOfFunctionParameter)
    if (type.additionalProperties) {
      members.push(generateTypescriptOfObjectAdditionalProperties(type.additionalProperties))
    }
    return `{ ${members.join(', ')} }`
  }
  if (type.kind === 'map') {
    const keyType = generateTypescriptOfType(type.key)
    const valueType = generateTypescriptOfType(type.value)
    return `{ [name: ${keyType}]: ${valueType} }`
  }
  return 'unknown'
}

