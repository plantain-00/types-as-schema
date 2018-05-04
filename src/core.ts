import ts from 'typescript'
import { Parser } from './parser'
import { generateProtobuf } from './protobuf-generator'
import { generateJsonSchemas, ArrayDefinition, ObjectDefinition, UndefinedDefinition } from './json-schema-generator'
import { generateGraphqlSchema } from './graphql-schema-generator'
import { generateReasonTypes } from './reason-type-generator'
import { generateOcamlTypes } from './ocaml-type-generator'
import { TypeDeclaration } from './utils'

export class Generator {
  declarations: TypeDeclaration[] = []

  constructor(public sourceFile: ts.SourceFile) {
    const parser = new Parser(sourceFile)
    this.declarations = parser.declarations
  }

  generateProtobuf() {
    return generateProtobuf(this.declarations)
  }

  generateJsonSchemas() {
    return generateJsonSchemas(this.declarations)
  }

  generateGraphqlSchema() {
    return generateGraphqlSchema(this.declarations)
  }

  generateReasonTypes() {
    return generateReasonTypes(this.declarations)
  }

  generateOcamlTypes() {
    return generateOcamlTypes(this.declarations)
  }
}

export { ArrayDefinition, ObjectDefinition, UndefinedDefinition }
