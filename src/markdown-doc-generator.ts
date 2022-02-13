import { generateTypescriptOfType } from './typescript-generator'
import { Type, TypeDeclaration } from './utils'

export function generateMarkdownDoc(declarations: TypeDeclaration[]) {
  const result: string[] = []
  for (const declaration of declarations) {
    result.push(`\n## \`${declaration.name}\`\n`)
    if (declaration.description) {
      result.push(declaration.description + '\n')
    }
    if (declaration.kind === 'object') {
      result.push(`Field | Required | Type | Description`)
      result.push(`--- | --- | --- | ---`)
      result.push(...declaration.members.filter((m) => m.name).map((m) => {
        const description = m.type.description ? ' ' + m.type.description : ''
        return `\`${m.name}\` | \`${m.optional ? 'false' : 'true'}\` | ${getType(m.type)} |${description}`
      }))
    } else if (declaration.kind === 'union') {
      result.push(`Union | Description`)
      result.push(`--- | ---`)
      result.push(...declaration.members.map((m) => {
        const description = m.description ? ' ' + m.description : ''
        return `${getType(m)} |${description}`
      }))
    } else if (declaration.kind === 'enum') {
      result.push(`Name | Value | Description`)
      result.push(`--- | --- | ---`)
      result.push(...declaration.members.map((m) => {
        const description = m.description ? ' ' + m.description : ''
        return `\`${m.name}\` | \`${m.value}\` |${description}`
      }))
    } else if (declaration.kind === 'reference') {
      result.push(`Reference | Description`)
      result.push(`--- | ---`)
      const description = declaration.description ? ' ' + declaration.description : ''
      result.push(`${getType(declaration)} |${description}`)
    } else if (declaration.kind === 'function') {
      result.push(`Field | Required | Type | Description`)
      result.push(`--- | --- | --- | ---`)
      result.push(...declaration.parameters.map((m) => {
        const description = m.type.description ? ' ' + m.type.description : ''
        return `\`${m.name}\` | \`${m.optional ? 'false' : 'true'}\` | ${getType(m.type)} |${description}`
      }))
      result.push(`\nReturn | Description`)
      result.push(`--- | ---`)
      result.push(`${getType(declaration.type)} |`)
    } else if ((declaration.kind === 'string' || declaration.kind === 'number') && declaration.enums) {
      result.push(`Enum | Description`)
      result.push(`--- | ---`)
      result.push(...declaration.enums.map((m) => {
        return `\`${m}\` |`
      }))
    }
  }

  return `# Data Models
${result.join('\n')}
`
}

function getType(type: Type) {
  let hasReference = false
  const result = generateTypescriptOfType(type, (t) => {
    if (t.kind === 'reference') {
      hasReference = true
      return `[\`${t.referenceName}\`](#${t.referenceName})`
    }
    return undefined
  })
  if (!hasReference) {
    return `\`${result}\``
  }
  return result
}
