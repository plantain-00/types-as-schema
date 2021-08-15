import { generateTypescriptOfFunctionParameter, TypeDeclaration } from '../dist/core'

export default (typeDeclarations: TypeDeclaration[]): { path: string, content: string }[] => {
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
  const content = `type TestType = {
${result.join('\n')}
}
`
  return [
    {
      path: 'demo/custom.ts',
      content,
    },
  ]
}
