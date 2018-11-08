import ts from 'typescript'
import { Parser } from './parser'
import { generateProtobuf } from './protobuf-generator'
import { generateJsonSchemas, ArrayDefinition, ObjectDefinition, UndefinedDefinition } from './json-schema-generator'
import { generateGraphqlSchema } from './graphql-schema-generator'
import { generateReasonTypes } from './reason-type-generator'
import { generateOcamlTypes } from './ocaml-type-generator'
import { generateRustTypes } from './rust-type-generator'
import { generateMongooseSchema } from './mongoose-schema-generator'
import { TypeDeclaration } from './utils'
import { generateGraphqlRootType } from './graphql-root-type-generator'

export class Generator {
  declarations: TypeDeclaration[] = []

  constructor(public sourceFiles: ts.SourceFile[]) {
    const parser = new Parser(sourceFiles)
    this.declarations = parser.parse()
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

  generateGraphqlRootType(graphqlRootTypePath: string) {
    return generateGraphqlRootType(this.declarations, graphqlRootTypePath)
  }

  generateReasonTypes() {
    return generateReasonTypes(this.declarations)
  }

  generateOcamlTypes() {
    return generateOcamlTypes(this.declarations)
  }

  generateRustTypes() {
    return generateRustTypes(this.declarations)
  }

  generateMongooseSchema() {
    return generateMongooseSchema(this.declarations)
  }
}

export { ArrayDefinition, ObjectDefinition, UndefinedDefinition }
