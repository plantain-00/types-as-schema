import ts from 'typescript'
import { createApp, defineComponent } from 'vue'

import { Generator } from '../dist/core'
import { demoCasesTs, indexTemplateHtml } from './variables'
import { TypeDeclaration } from '../dist/utils'
import { generateTypescriptOfFunctionParameter } from '../dist/typescript-generator'

const localStorageKey = 'types-as-schema:source'

const App = defineComponent({
  data() {
    return {
      protobuf: '',
      options: ['protobuf'],
      selectedOption: 'protobuf',
      graphqlSchema: '',
      reasonTypes: '',
      ocamlTypes: '',
      rustTypes: '',
      mongooseSchema: '',
      graphqlRootType: '',
      swaggerDoc: '',
      custom: '',
      typescript: '',
      markdown: '',
      debug: '',
      innerSource: localStorage.getItem(localStorageKey) || demoCasesTs,
      jsonSchemas: [] as { entry: string, content: string }[],
    }
  },
  computed: {
    source: {
      get(): string {
        return this.innerSource
      },
      set(value: string) {
        this.innerSource = value
        localStorage.setItem(localStorageKey, value)
      },
    },
    jsonSchema(): string {
      if (this.selectedOption) {
        const schema = this.jsonSchemas.find(
          (s) => s.entry === this.selectedOption
        )
        if (schema) {
          return schema.content
        }
      }
      return ''
    },
  },
  methods: {
    generate() {
      if (this.source) {
        const sourceFile = ts.createSourceFile(
          '',
          this.source,
          ts.ScriptTarget.ESNext,
          false,
          ts.ScriptKind.TS
        )

        const generator = new Generator([sourceFile], false)

        this.protobuf = generator.generateProtobuf()
        this.options = ['protobuf']

        this.jsonSchemas = generator.generateJsonSchemas().map((s) => ({
          entry: s.entry,
          content: JSON.stringify(s.schema, null, '  '),
        }))
        for (const schema of this.jsonSchemas) {
          this.options.push(schema.entry)
        }

        this.graphqlSchema = generator.generateGraphqlSchema()
        this.options.push('graphql schema')

        this.reasonTypes = generator.generateReasonTypes()
        this.options.push('reason types')

        this.ocamlTypes = generator.generateOcamlTypes()
        this.options.push('ocaml types')

        this.rustTypes = generator.generateRustTypes()
        this.options.push('rust types')

        this.mongooseSchema = generator.generateMongooseSchema()
        this.options.push('mongoose schema')

        this.graphqlRootType = generator.generateGraphqlRootType('.')
        this.options.push('graphql root type')

        this.swaggerDoc = generator.generateSwaggerDoc()
        this.options.push('swagger doc')

        this.custom = customHandler(generator.declarations)
        this.options.push('custom')

        this.typescript = generator.generateTypescript()
        this.options.push('typescript')

        this.markdown = generator.generateMarkdownDoc()
        this.options.push('markdown')

        this.debug = JSON.stringify(generator.declarations, null, 2)
        this.options.push('debug')
      }
    },
  },
  render: indexTemplateHtml,
})

export default App

const customHandler = (typeDeclarations: TypeDeclaration[]) => {
  const result: string[] = []
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function') {
      const parameters = [
        `functionName: '${declaration.name}'`,
        ...declaration.parameters.map((m) =>
          generateTypescriptOfFunctionParameter(m)
        ),
      ]
      result.push(`  (${parameters.join(', ')}): string`)
    }
  }
  return `type TestType = {
${result.join('\n')}
}
`
}

createApp(App).mount('#container')
