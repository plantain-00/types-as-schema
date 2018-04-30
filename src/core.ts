import ts from 'typescript'
import { Parser } from './parser'
import { generateProtobuf } from './protobuf-generator'
import { generateJsonSchemas, ArrayDefinition, ObjectDefinition, UndefinedDefinition } from './json-schema-generator'
import { generateGraphqlSchema } from './graphql-schema-generator'
import { generateReasonTypes } from './reason-type-generator'
import { generateOcamlTypes } from './ocaml-type-generator'
import { Model } from './utils'

export class Generator {
  models: Model[] = []

  constructor(public sourceFile: ts.SourceFile) {
    const parser = new Parser(sourceFile)
    this.models = parser.models
  }

  generateProtobuf() {
    return generateProtobuf(this.models)
  }

  generateJsonSchemas() {
    return generateJsonSchemas(this.models)
  }

  generateGraphqlSchema() {
    return generateGraphqlSchema(this.models)
  }

  generateReasonTypes() {
    return generateReasonTypes(this.models)
  }

  generateOcamlTypes() {
    return generateOcamlTypes(this.models)
  }
}

export { ArrayDefinition, ObjectDefinition, UndefinedDefinition }
