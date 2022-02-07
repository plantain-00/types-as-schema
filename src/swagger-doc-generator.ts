import { Context, FunctionDeclaration, FunctionParameter, getReferencesInType, TypeDeclaration } from './utils'
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
      const declarationParameters = getDeclarationParameters(typeDeclaration, context.declarations)
      const useFormData = declarationParameters.some((p) => p.type.kind === 'file')
      paths[typeDeclaration.path]![typeDeclaration.method] = {
        consumes: useFormData ? ['multipart/form-data'] : undefined,
        operationId: typeDeclaration.name,
        parameters: declarationParameters.map((parameter) => {
          referenceNames.push(...getReferencesInType(parameter.type).map((r) => r.name))
          const schema = getJsonSchemaProperty(parameter.type, context)
          return {
            name: parameter.name,
            required: !parameter.optional,
            in: useFormData ? 'formData' : parameter.in,
            schema: useFormData ? undefined : schema,
            type: useFormData ? schema.type : undefined,
            description: useFormData ? undefined : parameter.type.description,
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

const allTypes = ['path', 'query', 'body', 'cookie']

/**
 * @public
 */
export function getDeclarationParameters(
  declaration: Pick<FunctionDeclaration, 'parameters'>,
  typeDeclarations: TypeDeclaration[],
) {
  const result: FunctionParameter[] = []
  for (const parameter of declaration.parameters) {
    if (!parameter.in && allTypes.includes(parameter.name)) {
      const parameterType = parameter.type
      if (parameterType.kind === 'reference') {
        const typeDeclaration = typeDeclarations.find((d) => d.name === parameterType.name)
        if (typeDeclaration && typeDeclaration.kind === 'object') {
          result.push(...typeDeclaration.members.map((m) => ({
            ...m,
            in: parameter.name,
          })))
        }
      } else if (parameterType.kind === 'union') {
        for (const member of parameterType.members) {
          if (member.kind === 'reference') {
            const typeDeclaration = typeDeclarations.find((d) => d.name === member.name)
            if (typeDeclaration && typeDeclaration.kind === 'object') {
              result.push(...typeDeclaration.members.map((m) => ({
                ...m,
                in: parameter.name,
              })))
            }
          } else if (member.kind === 'object') {
            result.push(...member.members.map((m) => ({
              ...m,
              in: parameter.name,
            })))
          }
        }
      } else if (parameterType.kind === 'object') {
        result.push(...parameterType.members.map((m) => ({
          ...m,
          in: parameter.name,
        })))
      }
    } else {
      result.push(parameter)
    }
  }
  return result
}
