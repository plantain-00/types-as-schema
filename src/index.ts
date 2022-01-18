import minimist from 'minimist'
import ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import * as chokidar from 'chokidar'
import fse from 'fs-extra'
import { Generator } from './core'
import * as typescriptGenerator from './typescript-generator'
import * as packageJson from '../package.json'

import * as protobuf from 'protobufjs'
import Ajv from 'ajv'
import type { TypeDeclaration } from './utils'
import { ReferenceType } from './graphql-root-type-generator'

const ajv = new Ajv()

async function executeCommandLine() {
  const argv = minimist(process.argv.slice(2), { '--': true }) as unknown as Args

  const showVersion = argv.v || argv.version
  if (showVersion) {
    showToolVersion()
    return
  }

  if (argv.h || argv.help) {
    showHelp()
    return
  }

  const {
    protobufPath,
    graphqlPath,
    graphqlRootTypePath,
    reasonPath,
    ocamlPath,
    rustPath,
    jsonPath,
    mongoosePath,
    swaggerPath,
    swaggerBasePath,
    debugPath,
    filePaths,
    watchMode,
    looseMode,
    customPath,
    configPaths,
    typescriptPath,
    markdownPath,
  } = parseParameters(argv)

  function generateJsonSchemas(generator: Generator) {
    if (!jsonPath) {
      return
    }
    fse.ensureDirSync(jsonPath)
    const schemas = generator.generateJsonSchemas()
    for (const { entry, schema } of schemas) {
      if ((debugPath || ajv.validateSchema(schema)) && entry) {
        fs.writeFileSync(path.resolve(jsonPath, entry), JSON.stringify(schema, null, '  '))
      } else {
        printInConsole(`json schema verified fail for entry: ${entry}`)
        if (!watchMode) {
          process.exit(1)
        }
      }
    }
  }

  let program: ts.Program | undefined

  function run() {
    const newProgram = ts.createProgram(filePaths, { target: ts.ScriptTarget.ESNext }, undefined, program)
    program = newProgram

    const sourceFiles = filePaths.map(filePath => newProgram.getSourceFile(filePath))

    const generator = new Generator(
      sourceFiles.filter((s): s is ts.SourceFile => !!s),
      looseMode,
      !!configPaths,
      fileName => path.relative(process.cwd(), fileName),
      program.getTypeChecker(),
    )

    if (debugPath) {
      fs.writeFileSync(debugPath, JSON.stringify(generator.declarations, null, '  '))
    }

    if (protobufPath) {
      const protobufContent = `/**
 * This file is generated by 'types-as-schema'
 * It is not mean to be edited by hand
 */
` + generator.generateProtobuf()
      protobuf.parse(protobufContent)
      fs.writeFileSync(protobufPath, protobufContent)
    }

    if (graphqlPath) {
      const graphqlContent = generator.generateGraphqlSchema()
      fs.writeFileSync(graphqlPath, graphqlContent)
    }

    if (graphqlRootTypePath) {
      const graphqlRootPathContent = generator.generateGraphqlRootType((referenceTypes) => getReferenceTypeImports(referenceTypes, graphqlRootTypePath))
      fs.writeFileSync(graphqlRootTypePath, graphqlRootPathContent)
    }

    if (reasonPath) {
      const reasonContent = generator.generateReasonTypes()
      fs.writeFileSync(reasonPath, reasonContent)
    }

    if (ocamlPath) {
      const ocamlContent = generator.generateOcamlTypes()
      fs.writeFileSync(ocamlPath, ocamlContent)
    }

    if (rustPath) {
      const rustContent = generator.generateRustTypes()
      fs.writeFileSync(rustPath, rustContent)
    }

    if (mongoosePath) {
      const mongooseContent = generator.generateMongooseSchema()
      fs.writeFileSync(mongoosePath, mongooseContent)
    }

    if (swaggerPath) {
      const swaggerBase = swaggerBasePath ? JSON.parse(fs.readFileSync(swaggerBasePath).toString()) as Record<string, unknown> : undefined
      const swaggerDoc = generator.generateSwaggerDoc(swaggerBase)
      fs.writeFileSync(swaggerPath, swaggerDoc)
    }

    if (jsonPath) {
      generateJsonSchemas(generator)
    }

    if (configPaths) {
      for (const configPath of configPaths) {
      let configFilePath: string
      if (path.isAbsolute(configPath)) {
        configFilePath = configPath
      } else if (configPath.startsWith(`.${path.sep}`)
        || configPath.startsWith(`..${path.sep}`)
        || configPath.startsWith('./')
        || configPath.startsWith('../')
      ) {
        configFilePath = path.resolve(process.cwd(), configPath)
      } else {
        configFilePath = configPath
      }
      if (configFilePath.endsWith('.ts')) {
        require('ts-node/register/transpile-only')
      }
      type Action = (typeDeclarations: TypeDeclaration[], modules: typeof typescriptGenerator) => string | {
        path: string
        content: string
      }[]
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      let action: Action & { default?: Action } = require(configFilePath)
      if (action.default) {
        action = action.default
      }
      const customContent = action(generator.declarations, typescriptGenerator)
      if (typeof customContent === 'string' && customPath) {
        fs.writeFileSync(customPath, customContent)
      } else if (Array.isArray(customContent)) {
        for (const r of customContent) {
          fs.writeFileSync(r.path, r.content)
        }
      }
      }
    }

    if (typescriptPath) {
      const typescriptContent = generator.generateTypescript()
      fs.writeFileSync(typescriptPath, typescriptContent)
    }

    if (markdownPath) {
      const markdownContent = generator.generateMarkdownDoc()
      fs.writeFileSync(markdownPath, markdownContent)
    }
  }

  if (watchMode) {
    chokidar.watch(filePaths).on('all', (type: string, file: string) => {
      printInConsole(`Detecting ${type}: ${file}`)
      if (type === 'add' || type === 'change') {
        run()
      }
    })
  } else {
    run()
  }
}

function parseParameter(argv: PathArgs, name: keyof PathArgs) {
  const result = argv[name]
  if (result && typeof result !== 'string') {
    throw new Error(`expect the path of generated ${name} file`)
  }
  return result
}

function parseConfigPaths(argv: PathArgs) {
  const result = argv.config
  if (!result) {
    return undefined
  }
  if (typeof result === 'string') {
    return [result]
  }
  if (Array.isArray(result) && result.length > 0) {
    return result
  }
  throw new Error(`expect the path of generated config file`)
}

function parseParameters(argv: Args) {
  const protobufPath = parseParameter(argv, 'protobuf')
  const graphqlPath = parseParameter(argv, 'graphql')
  const graphqlRootTypePath = parseParameter(argv, 'graphql-root-type')
  const reasonPath = parseParameter(argv, 'reason')
  const ocamlPath = parseParameter(argv, 'ocaml')
  const rustPath = parseParameter(argv, 'rust')
  const jsonPath = parseParameter(argv, 'json')
  const mongoosePath = parseParameter(argv, 'mongoose')
  const swaggerPath = parseParameter(argv, 'swagger')
  const swaggerBasePath = parseParameter(argv, 'swagger-base')
  const debugPath = parseParameter(argv, 'debug')
  const customPath = parseParameter(argv, 'custom')
  const configPaths = parseConfigPaths(argv)
  const typescriptPath = parseParameter(argv, 'typescript')
  const markdownPath = parseParameter(argv, 'markdown')

  const filePaths = argv._

  if (filePaths.length === 0) {
    throw new Error('expect the path of types file')
  }

  const watchMode: boolean = argv.w || argv.watch
  const looseMode: boolean = argv.loose

  return {
    protobufPath,
    graphqlPath,
    graphqlRootTypePath,
    reasonPath,
    ocamlPath,
    rustPath,
    jsonPath,
    mongoosePath,
    swaggerPath,
    swaggerBasePath,
    debugPath,
    filePaths,
    watchMode,
    looseMode,
    customPath,
    configPaths,
    typescriptPath,
    markdownPath,
  }
}

interface Args extends PathArgs {
  v: boolean
  version: boolean
  _: string[]
  w: boolean
  watch: boolean
  loose: boolean
  h?: unknown
  help?: unknown
}

interface PathArgs {
  protobuf: string
  graphql: string
  ['graphql-root-type']: string
  reason: string
  ocaml: string
  rust: string
  json: string
  mongoose: string
  swagger: string
  ['swagger-base']: string
  debug: string
  custom: string
  config: string[] | string
  typescript: string
  markdown: string
}

function printInConsole(message: unknown) {
  console.log(message)
}

function showToolVersion() {
  printInConsole(`Version: ${packageJson.version}`)
}

function showHelp() {
  console.log(`Version ${packageJson.version}
Syntax:   types-as-schema [options] [file...]
Examples: types-as-schema demo/types.ts --protobuf demo/types.proto
Options:
 -h, --help                                         Print this message.
 -v, --version                                      Print the version
 --json                                             directory for generated json files
 --protobuf                                         generated protobuf file
 --graphql                                          generated graphql schema file
 --graphql-root-type                                generated graphql root type
 --reason                                           generated reason types file
 --ocaml                                            generated ocaml types file
 --rust                                             generated rust types file
 --mongoose                                         generated mongoose schema file
 --swagger                                          generated swagger json file
 --swagger-base                                     swagger json file that generation based on
 --typescript                                       generated typescript file
 --debug                                            generated file with debug information in it
 --watch, -w                                        watch mode
 --loose                                            do not force additionalProperties
 --config                                           generate file by the config file, can be multiple
 --markdown                                         generated markdown file
`)
}

executeCommandLine().then(() => {
  printInConsole('types-as-schema success.')
}, (error: Error) => {
  printInConsole(error)
  process.exit(1)
})

function getReferenceTypeImports(referenceTypes: ReferenceType[], graphqlRootTypePath: string) {
  const map: { [name: string]: string[] } = {}
  for (const referenceType of referenceTypes) {
    const file = referenceType.position.file
    if (!map[file]) {
      map[file] = []
    }
    const references = map[file]
    if (references?.every((n) => n !== referenceType.name)) {
      references.push(referenceType.name)
    }
  }
  const dirname = path.dirname(graphqlRootTypePath)
  const imports: string[] = []
  for (const file in map) {
    let relativePath = path.relative(dirname, file)
    if (!relativePath.startsWith('.' + path.sep) && !relativePath.startsWith('..' + path.sep)) {
      relativePath = '.' + path.sep + relativePath
    }
    relativePath = relativePath.substring(0, relativePath.length - path.extname(relativePath).length)
    imports.push(`import { ${map[file]?.join(', ')} } from '${relativePath}'`)
  }
  return imports.join('\n')
}
