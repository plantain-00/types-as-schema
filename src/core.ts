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
import { generateSwaggerDoc } from './swagger-doc-generator'
import { generateTypescript } from './typescript-generator'

export class Generator {
  declarations: TypeDeclaration[] = []

  constructor(public sourceFiles: ts.SourceFile[], private looseMode: boolean, disableWarning = false) {
    const parser = new Parser(sourceFiles)
    parser.disableWarning = disableWarning
    this.declarations = parser.parse()
  }

  generateProtobuf() {
    return generateProtobuf(this.declarations)
  }

  generateJsonSchemas() {
    return generateJsonSchemas({
      declarations: this.declarations,
      looseMode: this.looseMode
    })
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

  generateSwaggerDoc(swaggerBase?: {}) {
    return generateSwaggerDoc({
      declarations: this.declarations,
      looseMode: this.looseMode
    }, swaggerBase)
  }

  generateTypescript() {
    return generateTypescript(this.declarations)
  }
}

export { ArrayDefinition, ObjectDefinition, UndefinedDefinition }
