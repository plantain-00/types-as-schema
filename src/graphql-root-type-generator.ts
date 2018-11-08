import * as path from 'path'

import { TypeDeclaration, Type, MemberParameter, ReferenceType } from './utils'

export function generateGraphqlRootType(declarations: TypeDeclaration[], graphqlRootTypePath: string) {
  const members: string[] = []
  const referenceTypes: ReferenceType[] = []
  for (const typeDeclaration of declarations) {
    if (typeDeclaration.kind === 'object'
      && (typeDeclaration.name === 'Query' || typeDeclaration.name === 'Mutation')) {
      for (const member of typeDeclaration.members) {
        const memberType = getMemberType(member.type, referenceTypes)
        const parameters = getMemberParameters(referenceTypes, member.parameters)
        members.push(`  ${member.name}(${parameters}): ${memberType} | Promise<${memberType}>`)
      }
    }
  }
  const referenceTypeImports = getReferenceTypeImports(referenceTypes, graphqlRootTypePath)
  return referenceTypeImports + `export interface Root {
${members.join('\n')}
}
`
}

function getReferenceTypeImports(referenceTypes: ReferenceType[], graphqlRootTypePath: string) {
  const map: { [name: string]: string[] } = {}
  for (const referenceType of referenceTypes) {
    if (!map[referenceType.position.file]) {
      map[referenceType.position.file] = []
    }
    map[referenceType.position.file].push(referenceType.name)
  }
  const dirname = path.dirname(graphqlRootTypePath)
  const imports: string[] = []
  for (const file in map) {
    let relativePath = path.relative(dirname, file)
    if (!relativePath.startsWith('.' + path.sep) && !relativePath.startsWith('..' + path.sep)) {
      relativePath = '.' + path.sep + relativePath
    }
    relativePath = relativePath.substring(0, relativePath.length - path.extname(relativePath).length)
    imports.push(`import { ${map[file].join(', ')} } from '${relativePath}'`)
  }
  return imports.join('\n') + '\n\n'
}

function getMemberParameters(referenceTypes: ReferenceType[], parameters?: MemberParameter[]) {
  if (parameters && parameters.length > 0) {
    const parameterString = parameters.map((parameter) => `${parameter.name}${parameter.optional ? '?' : ''}: ${getMemberType(parameter.type, referenceTypes)}`).join(', ')
    return `input: { ${parameterString} }`
  }
  return ''
}

function getMemberType(memberType: Type, referenceTypes: ReferenceType[]): string {
  if (memberType.kind === 'array') {
    return `Array<${getMemberType(memberType.type, referenceTypes)}>`
  }
  if (memberType.kind === 'enum') {
    return memberType.name
  }
  if (memberType.kind === 'reference') {
    if (referenceTypes.every((r) => r.name !== memberType.name)) {
      referenceTypes.push(memberType)
    }
    return memberType.name
  }
  if (memberType.kind === 'map') {
    const mapKeyType = getMemberType(memberType.key, referenceTypes)
    const mapValueType = getMemberType(memberType.value, referenceTypes)
    return `{ [name: ${mapKeyType}]: ${mapValueType} }`
  }
  if (memberType.kind === 'union') {
    return memberType.members.map((member) => getMemberType(member, referenceTypes)).join(' | ')
  }
  if (memberType.kind === undefined) {
    return 'any'
  }
  return memberType.kind
}
