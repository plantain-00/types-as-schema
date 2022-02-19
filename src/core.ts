import ts from 'typescript'
import { Parser } from './parser'
import { generateProtobuf } from './protobuf-generator'
import { generateJsonSchemas } from './json-schema-generator'
import { TypeDeclaration } from './utils'
import { generateSwaggerDoc } from './swagger-doc-generator'
import * as typescriptGenerator from './typescript-generator'
import { generateMarkdownDoc } from './markdown-doc-generator'

export class Generator {
  declarations: TypeDeclaration[] = []

  constructor(
    public sourceFiles: ts.SourceFile[],
    private looseMode: boolean,
    disableWarning = false,
    getRelativePath: (fileName: string) => string,
    checker?: ts.TypeChecker,
  ) {
    const parser = new Parser(sourceFiles, getRelativePath, checker)
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

  generateSwaggerDoc(swaggerBase?: Record<string, unknown>) {
    return generateSwaggerDoc({
      declarations: this.declarations,
      allowFileType: true,
      looseMode: this.looseMode
    }, swaggerBase)
  }

  generateTypescript() {
    return typescriptGenerator.generateTypescript(this.declarations)
  }

  generateMarkdownDoc() {
    return generateMarkdownDoc(this.declarations)
  }
}

export * from './utils'
export * from './typescript-generator'
export * from './json-schema-generator'
export * from './swagger-doc-generator'

export interface Configuration {
  files: string[]
  jsonSchemaOutputDirectory?: string
  protobufOutputPath?: string
  swagger?: {
    outputPath: string
    base?: string | Record<string, unknown>
  }
  typescriptOutputPath?: string
  debugOutputPath?: string
  watch?: boolean
  loose?: boolean
  plugins?: (string | ConfigInterface)[]
  markdownOutputPath?: string
  /**
   * @deprecated
   */
  customPath?: string
}

export type ConfigInterface = (typeDeclarations: TypeDeclaration[], modules: typeof typescriptGenerator) => string | {
  path: string
  content: string
}[]
