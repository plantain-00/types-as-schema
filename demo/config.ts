import { generateTypescriptOfFunctionParameter, TypeDeclaration } from '../dist/core'

export = (typeDeclarations: TypeDeclaration[]) => {
  const result = []
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function') {
      const parameters = [
        `functionName: '${declaration.name}'`,
        ...declaration.parameters.map(generateTypescriptOfFunctionParameter),
      ]
      result.push(`  (${parameters.join(', ')}): string`)
    }
  }
  return `type TestType = {
${result.join('\n')}
}
`
}
