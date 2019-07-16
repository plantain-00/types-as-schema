import ts from 'typescript'
import Vue from 'vue'
import Component from 'vue-class-component'

import { Generator } from '../dist/core'
import { indexTemplateHtml, indexTemplateHtmlStatic, demoCasesTs } from './variables'

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
    }
  }
}

new App({ el: '#container' })
