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
  const argv = minimist(process.argv.slice(2), { '--': true })

  const showVersion = argv.v || argv.version
  if (showVersion) {
    showToolVersion()
    return
  }

  const {
    protobufPath,
    graphqlPath,
    reasonPath,
    ocamlPath,
    rustPath,
    jsonPath,
    debugPath,
    filePaths,
    watchMode
  } = parseParameters(argv)

  function generateJsonSchemas(generator: Generator) {
    fse.ensureDirSync(jsonPath)
    const schemas = generator.generateJsonSchemas()
    for (const { entry, schema } of schemas) {
      if (debugPath || ajv.validateSchema(schema)) {
        fs.writeFileSync(path.resolve(jsonPath, entry), JSON.stringify(schema, null, '  '))
      } else {
        printInConsole(`json schema verified fail for entry: ${entry}`)
        if (!watchMode) {
          process.exit(1)
        }
      }
    }
  }

  function run() {
    const program = ts.createProgram(filePaths, { target: ts.ScriptTarget.ESNext })

    const sourceFiles = filePaths.map(filePath => program.getSourceFile(filePath)!)

    const generator = new Generator(sourceFiles)

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

function parseParameter(argv: minimist.ParsedArgs, name: string) {
  const result = argv[name]
  if (result && typeof result !== 'string') {
    throw new Error(`expect the path of generated ${name} file`)
  }
  return result
}

function parseParameters(argv: minimist.ParsedArgs) {
  const protobufPath = parseParameter(argv, 'protobuf')
  const graphqlPath = parseParameter(argv, 'graphql')
  const reasonPath = parseParameter(argv, 'reason')
  const ocamlPath = parseParameter(argv, 'ocaml')
  const rustPath = parseParameter(argv, 'rust')
  const jsonPath = parseParameter(argv, 'json')
  const debugPath = parseParameter(argv, 'debug')

  const filePaths = argv._

  if (filePaths.length === 0) {
    throw new Error('expect the path of types file')
  }

  const watchMode: boolean = argv.w || argv.watch

  return {
    protobufPath,
    graphqlPath,
    reasonPath,
    ocamlPath,
    rustPath,
    jsonPath,
    debugPath,
    filePaths,
    watchMode
  }
}

function printInConsole(message: any) {
  console.log(message)
}

function showToolVersion() {
  printInConsole(`Version: ${packageJson.version}`)
}

executeCommandLine().then(() => {
  printInConsole('types-as-schema success.')
}, error => {
  printInConsole(error)
  process.exit(1)
})
