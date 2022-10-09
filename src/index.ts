import ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import * as chokidar from 'chokidar'
import fse from 'fs-extra'
import fg from 'fast-glob'
import { ConfigInterface, Configuration, Generator } from './core'
import * as typescriptGenerator from './typescript-generator'

export * from './core'

export async function generate(configuration: Configuration) {
  function generateJsonSchemas(generator: Generator) {
    if (!configuration.jsonSchemaOutputDirectory) {
      return
    }
    fse.ensureDirSync(configuration.jsonSchemaOutputDirectory)
    const schemas = generator.generateJsonSchemas()
    for (const { entry, schema } of schemas) {
      if (entry) {
        fs.writeFileSync(path.resolve(configuration.jsonSchemaOutputDirectory, entry), JSON.stringify(schema, null, '  '))
      } else {
        console.log(`json schema verified fail for entry: ${entry}`)
        if (!configuration.watch) {
          process.exit(1)
        }
      }
    }
  }

  let program: ts.Program | undefined

  async function run() {
    const files = await fg(configuration.files);
    const newProgram = ts.createProgram(files, { target: ts.ScriptTarget.ESNext }, undefined, program)
    program = newProgram

    const sourceFiles = files.map(filePath => newProgram.getSourceFile(filePath))

    const generator = new Generator(
      sourceFiles.filter((s): s is ts.SourceFile => !!s),
      configuration.loose ?? false,
      !!configuration.plugins,
      fileName => path.relative(process.cwd(), fileName),
      program.getTypeChecker(),
    )

    if (configuration.debugOutputPath) {
      fs.writeFileSync(configuration.debugOutputPath, JSON.stringify(generator.declarations, null, '  '))
    }

    if (configuration.protobufOutputPath) {
      const protobufContent = `/**
 * This file is generated by 'types-as-schema'
 * It is not mean to be edited by hand
 */
` + generator.generateProtobuf()
      fs.writeFileSync(configuration.protobufOutputPath, protobufContent)
    }

    if (configuration.swagger) {
      let swaggerBase: Record<string, unknown> | undefined
      if (typeof configuration.swagger.base === 'string') {
        swaggerBase = JSON.parse(fs.readFileSync(configuration.swagger.base).toString()) as Record<string, unknown>
      } else if (configuration.swagger.base) {
        swaggerBase = configuration.swagger.base
      }
      const swaggerDoc = generator.generateSwaggerDoc(swaggerBase)
      fs.writeFileSync(configuration.swagger.outputPath, swaggerDoc)
    }

    if (configuration.jsonSchemaOutputDirectory) {
      generateJsonSchemas(generator)
    }

    if (configuration.plugins) {
      for (const plugin of configuration.plugins) {
        let action: ConfigInterface
        if (typeof plugin === 'string') {
          let configFilePath: string
          if (path.isAbsolute(plugin)) {
            configFilePath = plugin
          } else if (plugin.startsWith(`.${path.sep}`)
            || plugin.startsWith(`..${path.sep}`)
            || plugin.startsWith('./')
            || plugin.startsWith('../')
          ) {
            configFilePath = path.resolve(process.cwd(), plugin)
          } else {
            configFilePath = plugin
          }
          if (configFilePath.endsWith('.ts')) {
            require('ts-node/register/transpile-only')
          }
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const actionFromFile: ConfigInterface & { default?: ConfigInterface } = require(configFilePath)
          if (actionFromFile.default) {
            action = actionFromFile.default
          } else {
            action = actionFromFile
          }
        } else {
          action = plugin
        }

        const customContent = action(generator.declarations, typescriptGenerator, generator.sourceFiles)
        if (typeof customContent === 'string' && configuration.customPath) {
          fs.writeFileSync(configuration.customPath, customContent)
        } else if (Array.isArray(customContent)) {
          for (const r of customContent) {
            fs.writeFileSync(r.path, r.content)
          }
        }
      }
    }

    if (configuration.typescriptOutputPath) {
      const typescriptContent = generator.generateTypescript()
      fs.writeFileSync(configuration.typescriptOutputPath, typescriptContent)
    }

    if (configuration.markdownOutputPath) {
      const markdownContent = generator.generateMarkdownDoc()
      fs.writeFileSync(configuration.markdownOutputPath, markdownContent)
    }
  }

  if (configuration.watch) {
    let ready = false
    chokidar.watch(configuration.files).on('ready', () => {
      ready = true
      run()
    }).on('all', (type: string, file: string) => {
      console.log(`Detecting ${type}: ${file}`)
      if (ready) {
        run()
      }
    })
  } else {
    await run()
  }
}
