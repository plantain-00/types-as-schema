/**
 * @param { import('../dist').TypeDeclaration[] } typeDeclarations
 * @returns {string}
 */
module.exports = (typeDeclarations) => {
  const result = []
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function') {
      const parameters = []
      for (const parameter of declaration.parameters) {
        const optional = parameter.optional ? '?' : ''
        parameters.push(`${parameter.name}${optional}: ${getType(parameter.type)}`)
      }
      result.push(`  (name: '${declaration.name}', ${parameters.join(', ')}): string`)
    }
  }
  return `type TestType = {
${result.join('\n')}
}
`
}

/**
 * @param { import('../dist').Type } type
 * @returns {string}
 */
function getType(type) {
  if (type.kind === undefined) {
    return 'any'
  }
  if (type.kind === 'enum') {
    return type.enums.map((e) => type.type === 'string' ? `'${e}'` : e).join(' | ')
  }
  if (type.kind === 'boolean' || type.kind === 'number' || type.kind === 'string' || type.kind === 'null') {
    return type.kind
  }
  if (type.kind === 'array') {
    return `Array<${getType(type.type)}>`
  }
  if (type.kind === 'reference') {
    return type.name
  }
  return 'any'
}
