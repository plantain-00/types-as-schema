/**
 * @param { import('../dist').TypeDeclaration[] } typeDeclarations
 * @param { import('../dist') } modules
 * @returns {string}
 */
module.exports = (typeDeclarations, modules) => {
  const result = []
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function') {
      const parameters = [
        `functionName: '${declaration.name}'`,
        ...declaration.parameters.map(modules.generateTypescriptOfFunctionParameter),
      ]
      result.push(`  (${parameters.join(', ')}): string`)
    }
  }
  return `type TestType = {
${result.join('\n')}
}
`
}
