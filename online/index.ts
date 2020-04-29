import ts from 'typescript'
import Vue from 'vue'
import Component from 'vue-class-component'

import { Generator } from '../dist/core'
import { indexTemplateHtml, indexTemplateHtmlStatic, demoCasesTs } from './variables'
import { TypeDeclaration, Type } from '../dist/utils'

const localStorageKey = 'types-as-schema:source'

@Component({
  render: indexTemplateHtml,
  staticRenderFns: indexTemplateHtmlStatic
})
export class App extends Vue {
  protobuf = ''
  options: string[] = ['protobuf']
  selectedOption = 'protobuf'
  graphqlSchema = ''
  reasonTypes = ''
  ocamlTypes = ''
  rustTypes = ''
  mongooseSchema = ''
  graphqlRootType = ''
  swaggerDoc = ''
  custom = ''
  private innerSource = localStorage.getItem(localStorageKey) || demoCasesTs
  private jsonSchemas: { entry: string; content: string }[] = []

  set source(value: string) {
    this.innerSource = value
    localStorage.setItem(localStorageKey, value)
  }
  get source() {
    return this.innerSource
  }
  get jsonSchema() {
    if (this.selectedOption) {
      const schema = this.jsonSchemas.find(s => s.entry === this.selectedOption)
      if (schema) {
        return schema.content
      }
    }
    return ''
  }

  generate() {
    if (this.source) {
      const sourceFile = ts.createSourceFile('', this.source, ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS)

      const generator = new Generator([sourceFile], false)

      this.protobuf = generator.generateProtobuf()
      this.options = ['protobuf']

      this.jsonSchemas = generator.generateJsonSchemas().map(s => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        entry: s.entry!,
        content: JSON.stringify(s.schema, null, '  ')
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
    }
  }
}

const customHandler = (typeDeclarations: TypeDeclaration[]) => {
  const result: string[] = []
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function') {
      const parameters: string[] = []
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

function getType(type: Type): string {
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


new App({ el: '#container' })
