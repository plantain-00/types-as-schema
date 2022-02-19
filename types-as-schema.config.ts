import { Configuration, generateTypescriptOfFunctionParameter, generateTypescriptOfType } from "./dist/core"

const config: Configuration = {
  files: ['demo/cases.ts', 'demo/case2.ts'],
  jsonSchemaOutputDirectory: 'demo/',
  debugOutputPath: 'demo/debug.json',
  protobufOutputPath: 'demo/cases.proto',
  swagger: {
    outputPath: 'demo/cases.swagger.json',
    base: {
      "info": {
        "title": "Sample API",
        "description": "API description in Markdown.",
        "version": "1.0.0"
      },
      "host": "api.example.com",
      "basePath": "/v1",
      "schemes": [
        "https"
      ]
    },
  },
  plugins: [
    (typeDeclarations) => {
      const result = []
      for (const declaration of typeDeclarations) {
        if (declaration.kind === 'function') {
          const parameters = [
            `functionName: '${declaration.name}'`,
            ...declaration.parameters.map((m) => generateTypescriptOfFunctionParameter(m, (t) => {
              if (declaration.typeParameters && t.kind === 'reference') {
                const typeParameter = declaration.typeParameters.find((p) => p.name === t.referenceName)
                if (typeParameter?.constraint) {
                  return generateTypescriptOfType(typeParameter.constraint)
                }
              }
              return
            })),
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
    },
  ],
  typescriptOutputPath: 'demo/typescript.ts',
  markdownOutputPath: 'demo/cases.md',
}

export default config
