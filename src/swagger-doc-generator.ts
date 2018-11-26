import { TypeDeclaration, Type } from './utils'
import { getAllDefinitions, getReferencedDefinitions, Definition } from './json-schema-generator'

export function generateSwaggerDoc(typeDeclarations: TypeDeclaration[]) {
  const paths: { [path: string]: { [method: string]: any } } = {}
  const referenceNames: string[] = []
  for (const typeDeclaration of typeDeclarations) {
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
            in: 'query',
            ...getType(parameter.type)
          }
        }),
        responses: {
          200: {
            ...getType(typeDeclaration.type)
          }
        }
      }
    }
  }
  const definitions = getAllDefinitions(typeDeclarations)
  const mergedDefinitions: {[name: string]: Definition} = {}
  for (const referenceName of referenceNames) {
    const referencedName = getReferencedDefinitions(referenceName, definitions, [])
    Object.assign(mergedDefinitions, referencedName)
  }
  const result = {
    swagger: '2.0',
    paths,
    definitions: mergedDefinitions
  }
  return JSON.stringify(result, null, 2)
}

function getType(type: Type) {
  if (type.kind === 'reference') {
    return {
      schema: {
        $ref: `#/definitions/${type.name}`
      }
    }
  }
  return {
    type: type.kind
  }
}
