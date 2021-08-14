import { Context, getReferencesInType } from './utils'
import { getAllDefinitions, getReferencedDefinitions, Definition, getJsonSchemaProperty } from './json-schema-generator'

export function generateSwaggerDoc(context: Context, swaggerBase?: Record<string, unknown>) {
  const paths: { [path: string]: { [method: string]: unknown } } = {}
  const referenceNames: string[] = []
  for (const typeDeclaration of context.declarations) {
    if (typeDeclaration.kind === 'function'
      && typeDeclaration.path
      && typeDeclaration.method) {
      if (!paths[typeDeclaration.path]) {
        paths[typeDeclaration.path] = {}
      }
      referenceNames.push(...getReferencesInType(typeDeclaration.type).map((r) => r.name))
      const useFormData = typeDeclaration.parameters.some((p) => p.type.kind === 'file')
      paths[typeDeclaration.path][typeDeclaration.method] = {
        consumes: useFormData ? ['multipart/form-data'] : undefined,
        operationId: typeDeclaration.name,
        parameters: typeDeclaration.parameters.map((parameter) => {
          referenceNames.push(...getReferencesInType(parameter.type).map((r) => r.name))
          const schema = getJsonSchemaProperty(parameter.type, context)
          return {
            name: parameter.name,
            required: !parameter.optional,
            in: useFormData ? 'formData' : parameter.in,
            schema: useFormData ? undefined : schema,
            type: useFormData ? schema.type : undefined,
          }
        }),
        summary: typeDeclaration.summary,
        description: typeDeclaration.description,
        deprecated: typeDeclaration.deprecated,
        tags: typeDeclaration.tags,
        responses: {
          200: {
            schema: getJsonSchemaProperty(typeDeclaration.type, context),
          },
        },
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
