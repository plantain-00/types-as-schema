import { TypeDeclaration, Type } from './utils'

export function generateSwaggerDoc(typeDeclarations: TypeDeclaration[]) {
  const paths: { [path: string]: { [method: string]: any } } = {}
  for (const typeDeclaration of typeDeclarations) {
    if (typeDeclaration.kind === 'function'
      && typeDeclaration.path
      && typeDeclaration.method) {
      if (!paths[typeDeclaration.path]) {
        paths[typeDeclaration.path] = {}
      }
      paths[typeDeclaration.path][typeDeclaration.method] = {
        operationId: typeDeclaration.name,
        parameters: typeDeclaration.parameters.map((parameter) => ({
          name: parameter.name,
          required: !parameter.optional,
          in: 'query',
          ...getType(parameter.type)
        })),
        responses: {
          200: {
            ...getType(typeDeclaration.type)
          }
        }
      }
    }
  }
  const result = {
    swagger: '2.0',
    paths,
    definitions: {
      Pet: {
        type: 'object',
        properties: {
          id: {
            type: 'number'
          },
          name: {
            type: 'string'
          },
          photoUrls: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          status: {
            type: 'string',
            enum: [
              'available',
              'pending',
              'sold'
            ]
          }
        },
        required: [
          'name',
          'photoUrls',
          'status'
        ],
        additionalProperties: false
      }
    }
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
