import { Type, Context } from './utils'
import { getAllDefinitions, getReferencedDefinitions, Definition, getJsonSchemaProperty } from './json-schema-generator'

export function generateSwaggerDoc(context: Context, swaggerBase?: {}) {
  const paths: { [path: string]: { [method: string]: unknown } } = {}
  const referenceNames: string[] = []
  for (const typeDeclaration of context.declarations) {
    if (typeDeclaration.kind === 'function'
      && typeDeclaration.path
      && typeDeclaration.method) {
      if (!paths[typeDeclaration.path]) {
        paths[typeDeclaration.path] = {}
      }
      if (typeDeclaration.type.kind === 'reference') {
        referenceNames.push(typeDeclaration.type.name)
      }
      paths[typeDeclaration.path][typeDeclaration.method] = {
        operationId: typeDeclaration.name,
        parameters: typeDeclaration.parameters.map((parameter) => {
          if (parameter.type.kind === 'reference') {
            referenceNames.push(parameter.type.name)
          }
          return {
            name: parameter.name,
            required: !parameter.optional,
            in: parameter.in,
            ...getSchema(parameter.type, context)
          }
        }),
        summary: typeDeclaration.summary,
        description: typeDeclaration.description,
        deprecated: typeDeclaration.deprecated,
        tags: typeDeclaration.tags,
        responses: {
          200: getSchema(typeDeclaration.type, context)
        }
      }
    }
  }
  const definitions = getAllDefinitions(context)
  const mergedDefinitions: {[name: string]: Definition} = {}
  for (const referenceName of referenceNames) {
    const referencedName = getReferencedDefinitions(referenceName, definitions, [])
    Object.assign(mergedDefinitions, referencedName)
  }
  let result = {
    swagger: '2.0',
    paths,
    definitions: mergedDefinitions
  }
  if (swaggerBase) {
    result = { ...swaggerBase, ...result }
  }
  return JSON.stringify(result, null, 2)
}

function getSchema(type: Type, context: Context) {
  const schema = getJsonSchemaProperty(type, context)
  if (type.kind === 'reference') {
    return {
      schema
    }
  }
  return schema
}
