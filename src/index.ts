import minimist from 'minimist'
import ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import * as chokidar from 'chokidar'
import fse from 'fs-extra'
import { Generator } from './core'
import * as packageJson from '../package.json'

import * as protobuf from 'protobufjs'
import Ajv from 'ajv'

const ajv = new Ajv()

async function executeCommandLine() {
  const argv = minimist(process.argv.slice(2), { '--': true }) as unknown as Args

  const showVersion = argv.v || argv.version
  if (showVersion) {
    showToolVersion()
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
    looseMode
  } = parseParameters(argv)

  function generateJsonSchemas(generator: Generator) {
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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sourceFiles = filePaths.map(filePath => newProgram.getSourceFile(filePath)!)

    const generator = new Generator(sourceFiles, looseMode)

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
      const graphqlRootPathContent = generator.generateGraphqlRootType(graphqlRootTypePath)
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
      const swaggerBase = swaggerBasePath ? JSON.parse(fs.readFileSync(swaggerBasePath).toString()) as {} : undefined
      const swaggerDoc = generator.generateSwaggerDoc(swaggerBase)
      fs.writeFileSync(swaggerPath, swaggerDoc)
    }

    if (jsonPath) {
      generateJsonSchemas(generator)
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
    looseMode
  }
}

interface Args extends PathArgs {
  v: boolean
  version: boolean
  _: string[]
  w: boolean
  watch: boolean
  loose: boolean
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
}

function printInConsole(message: unknown) {
  console.log(message)
}

function showToolVersion() {
  printInConsole(`Version: ${packageJson.version}`)
}

executeCommandLine().then(() => {
  printInConsole('types-as-schema success.')
}, (error: Error) => {
  printInConsole(error)
  process.exit(1)
})
