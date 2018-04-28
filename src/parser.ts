import ts from 'typescript'
import {
  Member,
  Model,
  EnumModel,
  UnionMember,
  Type,
  ArrayType,
  ObjectType
} from './utils'

export class Parser {
  models: Model[] = []

  constructor (private sourceFile: ts.SourceFile) {
    ts.forEachChild(sourceFile, node => {
      if (node.kind === ts.SyntaxKind.EnumDeclaration) {
        const declaration = node as ts.EnumDeclaration
        const members = declaration.members
        if (members.length > 0) {
          const firstMember = members[0]
          if (firstMember.initializer) {
            const enumType: EnumModel = {
              kind: 'enum',
              name: declaration.name.text,
              type: firstMember.initializer.kind === ts.SyntaxKind.StringLiteral ? ts.ClassificationTypeNames.stringLiteral : 'uint32',
              members: []
            }
            for (const member of members) {
              if (member.initializer) {
                const name = member.name as ts.Identifier
                if (member.initializer.kind === ts.SyntaxKind.StringLiteral) {
                  const initializer = member.initializer as ts.StringLiteral
                  enumType.members.push({
                    name: name.text,
                    value: initializer.text
                  })
                } else if (member.initializer.kind === ts.SyntaxKind.NumericLiteral) {
                  const initializer = member.initializer as ts.NumericLiteral
                  enumType.members.push({
                    name: name.text,
                    value: +initializer.text
                  })
                }
              }
            }
            this.models.push(enumType)
          } else {
            const enumType: EnumModel = {
              kind: 'enum',
              name: declaration.name.text,
              type: 'uint32',
              members: []
            }
            let lastIndex = 0
            for (const member of members) {
              const name = member.name as ts.Identifier
              if (member.initializer && member.initializer.kind === ts.SyntaxKind.NumericLiteral) {
                const initializer = member.initializer as ts.NumericLiteral
                const value = +initializer.text
                enumType.members.push({
                  name: name.text,
                  value
                })
                lastIndex = value + 1
              } else {
                enumType.members.push({
                  name: name.text,
                  value: lastIndex
                })
                lastIndex++
              }
            }
            this.models.push(enumType)
          }
        }
      }
    })

    ts.forEachChild(sourceFile, node => {
      this.handleSourceFile(node)
    })
  }

  private handleSourceFile (node: ts.Node) {
    const jsDocs = this.getJsDocs(node)
    const entry = jsDocs.find(jsDoc => jsDoc.name === 'entry')
    if (node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
      const declaration = node as ts.TypeAliasDeclaration
      if (declaration.type.kind === ts.SyntaxKind.ArrayType) {
        const arrayType = declaration.type as ts.ArrayTypeNode
        const type = this.getType(arrayType.elementType)
        const model: Model = {
          kind: 'array',
          name: declaration.name.text,
          type,
          entry: entry ? entry.comment : undefined
        }
        for (const jsDoc of jsDocs) {
          this.setJsonSchemaArray(jsDoc, model)
        }
        this.models.push(model)
      } else if (declaration.type.kind === ts.SyntaxKind.TypeLiteral
          || declaration.type.kind === ts.SyntaxKind.UnionType
          || declaration.type.kind === ts.SyntaxKind.IntersectionType) {
        if (declaration.type.kind === ts.SyntaxKind.UnionType) {
          const unionType = declaration.type as ts.UnionTypeNode
          if (unionType.types.every(u => u.kind === ts.SyntaxKind.TypeReference)) {
            const members: UnionMember[] = []
            for (const type of unionType.types) {
              const typeName = (type as ts.TypeReferenceNode).typeName
              if (typeName.kind === ts.SyntaxKind.Identifier) {
                members.push({
                  name: (typeName as ts.Identifier).text
                })
              }
            }
            const model: Model = {
              kind: 'union',
              name: declaration.name.text,
              members,
              entry: entry ? entry.comment : undefined
            }
            this.models.push(model)
            return
          }
        }
        const { members, minProperties, maxProperties } = this.getMembersInfo(declaration.type)
        const model: Model = {
          kind: 'object',
          name: declaration.name.text,
          members,
          minProperties,
          maxProperties,
          entry: entry ? entry.comment : undefined
        }
        for (const jsDoc of jsDocs) {
          this.setJsonSchemaObject(jsDoc, model)
        }
        this.models.push(model)
      }
    } else if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
      const declaration = node as ts.InterfaceDeclaration

      // if the node is pre-handled, then it should be in `models` already, so don't continue
      if (this.models.some(m => m.name === declaration.name.text)) {
        return
      }

      const { members, minProperties: selfMinProperties, maxProperties: selfMaxProperties } = this.getObjectMembers(declaration.members)
      let minProperties = selfMinProperties
      let maxProperties = selfMaxProperties

      if (declaration.heritageClauses) {
        for (const clause of declaration.heritageClauses) {
          if (clause.kind === ts.SyntaxKind.HeritageClause) {
            for (const type of clause.types) {
              if (type.kind === ts.SyntaxKind.ExpressionWithTypeArguments) {
                const interfaceName = (type.expression as ts.Identifier).text
                this.preHandleType(interfaceName)
                const clauseModel = this.models.find(m => m.kind === 'object' && m.name === interfaceName)
                if (clauseModel && clauseModel.kind === 'object') {
                  for (const member of clauseModel.members) {
                    if (members.every(m => m.name !== member.name)) {
                      members.push(member)
                      maxProperties++
                      if (!member.optional) {
                        minProperties++
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      const model: Model = {
        kind: 'object',
        name: declaration.name.text,
        members,
        minProperties,
        maxProperties,
        entry: entry ? entry.comment : undefined
      }

      for (const jsDoc of jsDocs) {
        this.setJsonSchemaObject(jsDoc, model)
      }

      this.models.push(model)
    }
  }

  private getJsDocs (node: ts.Node) {
    const jsDocs: ts.JSDoc[] | undefined = (node as any).jsDoc
    const result: JsDoc[] = []
    if (jsDocs && jsDocs.length > 0) {
      for (const jsDoc of jsDocs) {
        if (jsDoc.tags) {
          for (const tag of jsDoc.tags) {
            let type: Type | undefined
            let paramName: string | undefined
            let optional: boolean | undefined
            if (tag.tagName.text === 'param') {
              const typeExpression: ts.JSDocTypeExpression = (tag as any).typeExpression
              type = this.getType(typeExpression.type)
              paramName = ((tag as any).name as ts.Identifier).text
              optional = (tag as any).isBracketed
            }
            result.push({
              name: tag.tagName.text,
              type,
              paramName,
              comment: tag.comment,
              optional
            })
          }
        }
      }
    }
    return result
  }

  private getType (type: ts.TypeNode): Type {
    if (type.kind === ts.SyntaxKind.StringKeyword) {
      return {
        kind: 'string'
      }
    } else if (type.kind === ts.SyntaxKind.NumberKeyword) {
      return {
        kind: 'number',
        type: 'number'
      }
    } else if (type.kind === ts.SyntaxKind.BooleanKeyword) {
      return {
        kind: 'boolean'
      }
    } else if (type.kind === ts.SyntaxKind.TypeLiteral) {
      const literal = type as ts.TypeLiteralNode
      if (literal.members.length === 1 && literal.members[0].kind === ts.SyntaxKind.IndexSignature) {
        const indexSignature = literal.members[0] as ts.IndexSignatureDeclaration
        if (indexSignature.parameters.length === 1) {
          const parameterType = indexSignature.parameters[0].type
          if (parameterType && indexSignature.type) {
            return {
              kind: 'map',
              key: this.getType(parameterType),
              value: this.getType(indexSignature.type)
            }
          }
        }
      } else {
        const { members, minProperties, maxProperties } = this.getMembersInfo(literal)
        return {
          kind: 'object',
          members,
          minProperties,
          maxProperties
        }
      }
    } else if (type.kind === ts.SyntaxKind.ArrayType) {
      const array = type as ts.ArrayTypeNode
      const elementType = this.getType(array.elementType)
      return {
        kind: 'array',
        type: elementType
      }
    } else if (type.kind === ts.SyntaxKind.TypeReference) {
      const reference = type as ts.TypeReferenceNode
      if (reference.typeName.kind === ts.SyntaxKind.Identifier) {
        const typeName = reference.typeName as ts.Identifier
        if (numberTypes.includes(typeName.text)) {
          return {
            kind: 'number',
            type: typeName.text
          }
        } else {
          return {
            kind: 'reference',
            name: typeName.text
          }
        }
      } else if (reference.typeName.kind === ts.SyntaxKind.QualifiedName) {
        const qualified = reference.typeName as ts.QualifiedName
        const enumName = (qualified.left as ts.Identifier).text
        const enumModel = this.models.find(m => m.kind === 'enum' && m.name === enumName) as EnumModel | undefined
        if (enumModel) {
          return {
            kind: 'enum',
            name: enumModel.name,
            type: enumModel.type,
            enums: enumModel.members.map(m => m.value)
          }
        }
      }
    } else if (type.kind === ts.SyntaxKind.UnionType) {
      const unionType = type as ts.UnionTypeNode
      let enumType: 'string' | 'number' | undefined
      const enums: any[] = []
      for (const childType of unionType.types) {
        if (childType.kind === ts.SyntaxKind.LiteralType) {
          const literalType = childType as ts.LiteralTypeNode
          if (literalType.literal.kind === ts.SyntaxKind.StringLiteral) {
            enumType = 'string'
            enums.push((literalType.literal as ts.LiteralExpression).text)
          } else if (literalType.literal.kind === ts.SyntaxKind.NumericLiteral) {
            enumType = 'number'
            enums.push(+(literalType.literal as ts.LiteralExpression).text)
          }
        }
      }
      if (enumType) {
        return {
          kind: 'enum',
          type: enumType,
          name: enumType,
          enums
        }
      }
    } else if (type.kind === ts.SyntaxKind.TupleType) {
      const tupleType = type as ts.TupleTypeNode
      let arrayType: Type | undefined
      for (const elementType of tupleType.elementTypes) {
        arrayType = this.getType(elementType)
      }
      if (arrayType) {
        return {
          kind: 'array',
          type: arrayType,
          minItems: tupleType.elementTypes.length,
          maxItems: tupleType.elementTypes.length
        }
      }
    } else if (type.kind === ts.SyntaxKind.LiteralType) {
      const literalType = type as ts.LiteralTypeNode
      let enumType: 'string' | 'number' | undefined
      const enums: any[] = []
      if (literalType.literal.kind === ts.SyntaxKind.StringLiteral) {
        enumType = 'string'
        enums.push((literalType.literal as ts.LiteralExpression).text)
      } else if (literalType.literal.kind === ts.SyntaxKind.NumericLiteral) {
        enumType = 'number'
        enums.push(+(literalType.literal as ts.LiteralExpression).text)
      }
      if (enumType) {
        return {
          kind: 'enum',
          type: enumType,
          name: enumType,
          enums
        }
      }
    }
    return {
      kind: undefined
    }
  }

  private getMembersInfo (node: ts.TypeNode): MembersInfo {
    const members: Member[] = []
    let minProperties = 0
    let maxProperties = 0
    if (node.kind === ts.SyntaxKind.TypeLiteral) {
      const typeLiteral = node as ts.TypeLiteralNode
      return this.getObjectMembers(typeLiteral.members)
    } else if (node.kind === ts.SyntaxKind.UnionType) {
      const unionType = node as ts.UnionTypeNode
      minProperties = Infinity
      for (const type of unionType.types) {
        const childMembersInfo = this.getMembersInfo(type)
        if (minProperties > childMembersInfo.minProperties) {
          minProperties = childMembersInfo.minProperties
        }
        if (maxProperties < childMembersInfo.maxProperties) {
          maxProperties = childMembersInfo.maxProperties
        }
        if (members.length === 0) {
          const childMembers: Member[] = JSON.parse(JSON.stringify(childMembersInfo.members))
          members.push(...childMembers)
        } else {
          const childMembers = childMembersInfo.members
          for (const member of members) {
            const childMember = childMembers.find(m => m.name === member.name)
            if (!childMember) {
              member.optional = true
            } else {
              if (childMember.type.kind === 'enum' && member.type.kind === 'enum') {
                for (const typeEnum of childMember.type.enums) {
                  if (member.type.enums.every(e => e !== typeEnum)) {
                    member.type.enums.push(typeEnum)
                  }
                }
              }
            }
          }
          for (const member of childMembers) {
            if (members.every(m => m.name !== member.name)) {
              const childMember: Member = JSON.parse(JSON.stringify(member))
              childMember.optional = true
              members.push(childMember)
            }
          }
        }
      }
    } else if (node.kind === ts.SyntaxKind.IntersectionType) {
      const intersectionType = node as ts.IntersectionTypeNode
      for (const type of intersectionType.types) {
        const childMembersInfo = this.getMembersInfo(type)
        minProperties += childMembersInfo.minProperties
        maxProperties += childMembersInfo.maxProperties
        const childMembers = childMembersInfo.members
        for (const member of childMembers) {
          if (members.every(m => m.name !== member.name)) {
            members.push(JSON.parse(JSON.stringify(member)))
          }
        }
      }
    } else if (node.kind === ts.SyntaxKind.ParenthesizedType) {
      const parenthesizedType = node as ts.ParenthesizedTypeNode
      const childMembersInfo = this.getMembersInfo(parenthesizedType.type)
      minProperties = childMembersInfo.minProperties
      maxProperties = childMembersInfo.maxProperties
      const childMembers: Member[] = JSON.parse(JSON.stringify(childMembersInfo.members))
      for (const member of childMembers) {
        members.push(member)
      }
    } else if (node.kind === ts.SyntaxKind.TypeReference) {
      const referenceName = ((node as ts.TypeReferenceNode).typeName as ts.Identifier).text
      this.preHandleType(referenceName)
      const model = this.models.find(m => m.kind === 'object' && m.name === referenceName)
      if (model && model.kind === 'object') {
        for (const member of model.members) {
          if (members.every(m => m.name !== member.name)) {
            members.push(JSON.parse(JSON.stringify(member)))
            maxProperties++
            if (!member.optional) {
              minProperties++
            }
          }
        }
      }
    }
    return { members, minProperties, maxProperties }
  }

  private preHandleType (typeName: string) {
    // if the node is pre-handled, then it should be in `models` already, so don't continue
    if (this.models.some(m => m.name === typeName)) {
      return
    }

    let findIt = false
    ts.forEachChild(this.sourceFile, node => {
      if (findIt) {
        return
      }
      if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
        const declaration = node as ts.InterfaceDeclaration
        if (declaration.name.text === typeName) {
          findIt = true
          this.handleSourceFile(node)
        }
      } else if (node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
        const declaration = node as ts.TypeAliasDeclaration
        if (declaration.name.text === typeName) {
          findIt = true
          this.handleSourceFile(node)
        }
      }
    })
  }

  private getObjectMembers (elements: ts.NodeArray<ts.TypeElement>): MembersInfo {
    const members: Member[] = []
    let minProperties = 0
    let maxProperties = 0
    for (const element of elements) {
      if (element.kind === ts.SyntaxKind.PropertySignature) {
        const property = element as ts.PropertySignature
        const name = property.name as ts.Identifier
        const member: Member = {
          name: name.text,
          type: {
            kind: undefined
          }
        }
        members.push(member)

        if (property.questionToken) {
          member.optional = true
        } else {
          minProperties++
        }
        maxProperties++

        if (property.type) {
          member.type = this.getType(property.type)
        }

        const propertyJsDocs = this.getJsDocs(property)
        for (const propertyJsDoc of propertyJsDocs) {
          if (propertyJsDoc.name === 'tag') {
            if (propertyJsDoc.comment) {
              member.tag = +propertyJsDoc.comment
            }
          } else if (propertyJsDoc.name === 'mapValueType') {
            if (propertyJsDoc.comment && member.type.kind === 'map') {
              if (member.type.value.kind === 'number') {
                member.type.value.type = propertyJsDoc.comment
              }
            }
          } else if (propertyJsDoc.name === 'type') {
            this.overrideType(member.type, propertyJsDoc)
          } else if (propertyJsDoc.name === 'param') {
            if (propertyJsDoc.paramName && propertyJsDoc.type) {
              if (!member.parameters) {
                member.parameters = []
              }
              member.parameters.push({
                name: propertyJsDoc.paramName,
                type: propertyJsDoc.type,
                optional: propertyJsDoc.optional
              })
            }
            this.overrideType(member.type, propertyJsDoc)
          } else if (member.type.kind === 'array') {
            this.setJsonSchemaArray(propertyJsDoc, member.type)
          } else if (member.type.kind === 'number') {
            if (propertyJsDoc.comment) {
              if (propertyJsDoc.name === 'multipleOf') {
                member.type.multipleOf = +propertyJsDoc.comment
              } else if (propertyJsDoc.name === 'maximum') {
                member.type.maximum = +propertyJsDoc.comment
              } else if (propertyJsDoc.name === 'minimum') {
                member.type.minimum = +propertyJsDoc.comment
              } else if (propertyJsDoc.name === 'exclusiveMaximum') {
                member.type.exclusiveMaximum = +propertyJsDoc.comment
              } else if (propertyJsDoc.name === 'exclusiveMinimum') {
                member.type.exclusiveMinimum = +propertyJsDoc.comment
              } else if (propertyJsDoc.name === 'default') {
                member.type.default = +propertyJsDoc.comment
              }
            }
          } else if (member.type.kind === 'string') {
            if (propertyJsDoc.comment) {
              if (propertyJsDoc.name === 'minLength') {
                member.type.minLength = +propertyJsDoc.comment
              } else if (propertyJsDoc.name === 'maxLength') {
                member.type.maxLength = +propertyJsDoc.comment
              } else if (propertyJsDoc.name === 'pattern') {
                member.type.pattern = propertyJsDoc.comment
              } else if (propertyJsDoc.name === 'default') {
                member.type.default = propertyJsDoc.comment
              }
            }
          } else if (member.type.kind === 'boolean') {
            if (propertyJsDoc.comment) {
              if (propertyJsDoc.name === 'default') {
                member.type.default = propertyJsDoc.comment.toLowerCase() === 'true'
              }
            }
          } else if (member.type.kind === 'object') {
            this.setJsonSchemaObject(propertyJsDoc, member.type)
          }
        }
      }
    }
    return { members, minProperties, maxProperties }
  }

  private overrideType (type: Type, jsDoc: JsDoc | undefined) {
    if (jsDoc && jsDoc.comment) {
      if (type.kind === 'number') {
        type.type = jsDoc.comment
      } else if (type.kind === 'array') {
        if (type.type.kind === 'number') {
          type.type = {
            kind: type.type.kind,
            type: jsDoc.comment
          }
        }
      }
    }
  }

  private setJsonSchemaArray (jsDoc: JsDoc, type: ArrayType) {
    if (jsDoc.comment) {
      if (jsDoc.name === 'minItems') {
        type.minItems = +jsDoc.comment
      } else if (jsDoc.name === 'maxItems') {
        type.maxItems = +jsDoc.comment
      } else if (jsDoc.name === 'itemType') {
        this.overrideType(type, jsDoc)
      } else if (type.type.kind === 'number') {
        if (jsDoc.name === 'itemMultipleOf') {
          type.type.multipleOf = +jsDoc.comment
        } else if (jsDoc.name === 'itemMinimum') {
          type.type.minimum = +jsDoc.comment
        } else if (jsDoc.name === 'itemMaximum') {
          type.type.maximum = +jsDoc.comment
        } else if (jsDoc.name === 'itemExclusiveMinimum') {
          type.type.exclusiveMinimum = +jsDoc.comment
        } else if (jsDoc.name === 'itemExclusiveMaximum') {
          type.type.exclusiveMaximum = +jsDoc.comment
        } else if (jsDoc.name === 'itemDefault') {
          type.type.default = +jsDoc.comment
        }
      } else if (type.type.kind === 'string') {
        if (jsDoc.name === 'itemMinLength') {
          type.type.minLength = +jsDoc.comment
        } else if (jsDoc.name === 'itemMaxLength') {
          type.type.maxLength = +jsDoc.comment
        } else if (jsDoc.name === 'itemPattern') {
          type.type.pattern = jsDoc.comment
        } else if (jsDoc.name === 'itemDefault') {
          type.type.default = jsDoc.comment
        }
      } else if (type.type.kind === 'boolean') {
        if (jsDoc.name === 'itemDefault') {
          type.type.default = jsDoc.comment.toLowerCase() === 'true'
        }
      }
    } else if (jsDoc.name === 'uniqueItems') {
      type.uniqueItems = true
    }
  }

  private setJsonSchemaObject (jsDoc: JsDoc, type: ObjectType) {
    if (jsDoc.comment) {
      if (jsDoc.name === 'minProperties') {
        type.minProperties = +jsDoc.comment
      } else if (jsDoc.name === 'maxProperties') {
        type.maxProperties = +jsDoc.comment
      }
    } else {
      if (jsDoc.name === 'additionalProperties') {
        type.additionalProperties = true
      }
    }
  }
}

const numberTypes = ['double', 'float', 'uint32', 'fixed32', 'integer', 'int32', 'sint32', 'sfixed32', 'uint64', 'fixed64', 'int64', 'sint64', 'sfixed64']

type JsDoc = {
  name: string;
  type?: Type;
  paramName?: string;
  comment: string | undefined;
  optional?: boolean;
}

type MembersInfo = {
  members: Member[];
  minProperties: number;
  maxProperties: number;
}
