import minimist from 'minimist'
import { Configuration } from './core'
import * as packageJson from '../package.json'
import { generate } from '.'

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

  const configuration = parseParameters(argv)

  await generate(configuration)
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
  const configurationPath = parseParameter(argv, 'p')
  let configuration: Configuration = {
    files: [],
  }
  if (configurationPath) {
    if (configurationPath.endsWith('.ts')) {
      require('ts-node/register/transpile-only')
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const configurationFromFile: Configuration & { default?: Configuration } = require(configurationPath)
    if (configurationFromFile.default) {
      configuration = configurationFromFile.default
    } else {
      configuration = configurationFromFile
    }
  }

  const protobufPath = parseParameter(argv, 'protobuf')
  if (protobufPath) {
    configuration.protobufOutputPath = protobufPath
  }
  const jsonPath = parseParameter(argv, 'json')
  if (jsonPath) {
    configuration.jsonSchemaOutputDirectory = jsonPath
  }
  const swaggerPath = parseParameter(argv, 'swagger')
  if (swaggerPath) {
    configuration.swagger = {
      outputPath: swaggerPath,
      base: parseParameter(argv, 'swagger-base'),
    }
  }
  const debugPath = parseParameter(argv, 'debug')
  if (debugPath) {
    configuration.debugOutputPath = debugPath
  }
  const customPath = parseParameter(argv, 'custom')
  if (customPath) {
    configuration.customPath = customPath
  }
  const configPaths = parseConfigPaths(argv)
  if (configPaths) {
    if (!configuration.plugins) {
      configuration.plugins = []
    }
    configuration.plugins.push(...configPaths)
  }
  const typescriptPath = parseParameter(argv, 'typescript')
  if (typescriptPath) {
    configuration.typescriptOutputPath = typescriptPath
  }
  const markdownPath = parseParameter(argv, 'markdown')
  if (markdownPath) {
    configuration.markdownOutputPath = markdownPath
  }
  configuration.files.push(...argv._)

  if (configuration.files.length === 0) {
    throw new Error('expect the path of types file')
  }

  const watchMode = argv.w || argv.watch
  if (watchMode === true) {
    configuration.watch = watchMode
  }
  const looseMode = argv.loose
  if (looseMode === true) {
    configuration.loose = looseMode
  }

  return configuration
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
  p: string
  protobuf: string
  json: string
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
 -p                                                 Configuration file
 --json                                             directory for generated json files
 --protobuf                                         generated protobuf file
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
