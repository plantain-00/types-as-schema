import { generateTypescriptOfFunctionParameter, TypeDeclaration } from '../dist/core'

export default (typeDeclarations: TypeDeclaration[]): string => {
  const result = []
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function') {
      const parameters = [
        `functionName: '${declaration.name}'`,
        ...declaration.parameters.map((m) => generateTypescriptOfFunctionParameter(m)),
      ]
      result.push(`  (${parameters.join(', ')}): string`)
    }
  }
  return `type TestType = {
${result.join('\n')}
}
`
}
