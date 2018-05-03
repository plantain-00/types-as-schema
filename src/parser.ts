import ts from 'typescript'
import {
  Member,
  Model,
  EnumModel,
  Type,
  ArrayType,
  ObjectType,
  NumberType,
  StringType,
  BooleanType,
  ReferenceType
} from './utils'

export class Parser {
  models: Model[] = []

  constructor(private sourceFile: ts.SourceFile) {
    ts.forEachChild(sourceFile, node => {
      if (node.kind === ts.SyntaxKind.EnumDeclaration) {
        this.preHandleEnumDeclaration(node as ts.EnumDeclaration)
      }
    })

    ts.forEachChild(sourceFile, node => {
      this.handleSourceFile(node)
    })
  }

  private preHandleEnumDeclaration(declaration: ts.EnumDeclaration) {
    const members = declaration.members
    if (members.length > 0) {
      const firstMember = members[0]
      if (firstMember.initializer) {
        this.handleEnumDeclarationInitializer(declaration, members, firstMember.initializer)
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

  private handleEnumDeclarationInitializer(declaration: ts.EnumDeclaration, members: ts.NodeArray<ts.EnumMember>, initializer: ts.Expression) {
    const enumType: EnumModel = {
      kind: 'enum',
      name: declaration.name.text,
      type: initializer.kind === ts.SyntaxKind.StringLiteral ? ts.ClassificationTypeNames.stringLiteral : 'uint32',
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
  }

  private handleSourceFile(node: ts.Node) {
    const jsDocs = this.getJsDocs(node)
    const entry = jsDocs.find(jsDoc => jsDoc.name === 'entry')
    if (node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
      this.handleTypeAliasDeclaration(node as ts.TypeAliasDeclaration, jsDocs, entry)
    } else if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
      this.handleInterfaceDeclaration(node as ts.InterfaceDeclaration, jsDocs, entry)
    }
  }

  private handleInterfaceDeclaration(declaration: ts.InterfaceDeclaration, jsDocs: JsDoc[], entry: JsDoc | undefined) {
    // if the node is pre-handled, then it should be in `models` already, so don't continue
    if (this.models.some(m => m.name === declaration.name.text)) {
      return
    }

    let { members, minProperties, maxProperties, additionalProperties } = this.getObjectMembers(declaration.members)

    let additionalPropertiesFromHeritageClauses: Type | undefined | boolean
    ({ minProperties, maxProperties, additionalProperties: additionalPropertiesFromHeritageClauses } = this.handleHeritageClauses(declaration, members, minProperties, maxProperties))
    if (additionalPropertiesFromHeritageClauses) {
      additionalProperties = additionalPropertiesFromHeritageClauses
    }

    const model: Model = {
      kind: 'object',
      name: declaration.name.text,
      members,
      minProperties,
      maxProperties: additionalProperties === undefined ? maxProperties : undefined,
      additionalProperties,
      entry: entry ? entry.comment : undefined
    }

    for (const jsDoc of jsDocs) {
      this.setJsonSchemaObject(jsDoc, model)
    }

    this.models.push(model)
  }

  private handleHeritageClauses(declaration: ts.InterfaceDeclaration, members: Member[], minProperties: number, maxProperties: number) {
    let additionalProperties: Type | undefined | boolean
    if (declaration.heritageClauses) {
      for (const clause of declaration.heritageClauses) {
        if (clause.kind === ts.SyntaxKind.HeritageClause) {
          for (const type of clause.types) {
            if (type.kind === ts.SyntaxKind.ExpressionWithTypeArguments) {
              ({ minProperties, maxProperties, additionalProperties } = this.handleExpressionWithTypeArguments(type.expression as ts.Identifier, members, minProperties, maxProperties))
            }
          }
        }
      }
    }
    return { minProperties, maxProperties, additionalProperties }
  }

  private handleExpressionWithTypeArguments(declaration: ts.Identifier, members: Member[], minProperties: number, maxProperties: number) {
    const interfaceName = declaration.text
    this.preHandleType(interfaceName)
    let additionalProperties: Type | undefined | boolean
    const clauseModel = this.models.find(m => m.kind === 'object' && m.name === interfaceName)
    if (clauseModel && clauseModel.kind === 'object') {
      additionalProperties = clauseModel.additionalProperties
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
    return { minProperties, maxProperties, additionalProperties }
  }

  private handleTypeAliasDeclaration(declaration: ts.TypeAliasDeclaration, jsDocs: JsDoc[], entry: JsDoc | undefined) {
    if (declaration.type.kind === ts.SyntaxKind.ArrayType) {
      this.handleArrayTypeInTypeAliasDeclaration(declaration.type as ts.ArrayTypeNode, declaration.name, jsDocs, entry)
    } else if (declaration.type.kind === ts.SyntaxKind.TypeLiteral
      || declaration.type.kind === ts.SyntaxKind.UnionType
      || declaration.type.kind === ts.SyntaxKind.IntersectionType) {
      this.handleTypeLiteralOrUnionTypeOrIntersectionType(declaration.type as ts.TypeLiteralNode | ts.UnionOrIntersectionTypeNode, declaration.name, jsDocs, entry)
    } else if (declaration.type.kind === ts.SyntaxKind.TypeReference) {
      const typeReference = declaration.type as ts.TypeReferenceNode
      const model: Model = {
        kind: 'reference',
        newName: declaration.name.text,
        name: (typeReference.typeName as ts.Identifier).text
      }
      this.models.push(model)
    }
  }

  private handleTypeLiteralOrUnionTypeOrIntersectionType(
    declarationType: ts.TypeLiteralNode | ts.UnionOrIntersectionTypeNode,
    declarationName: ts.Identifier,
    jsDocs: JsDoc[],
    entry: JsDoc | undefined) {
    if (declarationType.kind === ts.SyntaxKind.UnionType) {
      const unionType = declarationType
      if (unionType.types.every(u => u.kind === ts.SyntaxKind.LiteralType)) {
        this.handleUnionTypeOfLiteralType(unionType, declarationName)
        return
      } else if (unionType.types.every(u => u.kind === ts.SyntaxKind.TypeReference)) {
        const model: Model = {
          kind: 'union',
          name: declarationName.text,
          members: unionType.types.map(u => this.getType(u)),
          entry: entry ? entry.comment : undefined
        }
        this.models.push(model)
        return
      }
    }
    const { members, minProperties, maxProperties, additionalProperties } = this.getMembersInfo(declarationType)
    const model: Model = {
      kind: 'object',
      name: declarationName.text,
      members,
      minProperties,
      maxProperties: additionalProperties === undefined ? maxProperties : undefined,
      additionalProperties,
      entry: entry ? entry.comment : undefined
    }
    for (const jsDoc of jsDocs) {
      this.setJsonSchemaObject(jsDoc, model)
    }
    this.models.push(model)
  }

  private handleUnionTypeOfLiteralType(unionType: ts.UnionTypeNode, declarationName: ts.Identifier) {
    let enumType: 'string' | 'number' | undefined
    const enums: any[] = []
    for (const childType of unionType.types) {
      const literalType = childType as ts.LiteralTypeNode
      if (literalType.literal.kind === ts.SyntaxKind.StringLiteral) {
        enumType = 'string'
        enums.push(literalType.literal.text)
      } else if (literalType.literal.kind === ts.SyntaxKind.NumericLiteral) {
        enumType = 'number'
        enums.push(+literalType.literal.text)
      }
    }
    if (enumType) {
      if (enumType === 'string') {
        const model: Model = {
          kind: enumType,
          name: declarationName.text,
          enums
        }
        this.models.push(model)
      } else {
        const model: Model = {
          kind: enumType,
          type: enumType,
          name: declarationName.text,
          enums
        }
        this.models.push(model)
      }
    }
  }

  private handleArrayTypeInTypeAliasDeclaration(arrayType: ts.ArrayTypeNode, declarationName: ts.Identifier, jsDocs: JsDoc[], entry: JsDoc | undefined) {
    const type = this.getType(arrayType.elementType)
    const model: Model = {
      kind: 'array',
      name: declarationName.text,
      type,
      entry: entry ? entry.comment : undefined
    }
    for (const jsDoc of jsDocs) {
      this.setJsonSchemaArray(jsDoc, model)
    }
    this.models.push(model)
  }

  private getJsDocs(node: ts.Node) {
    const jsDocs: ts.JSDoc[] | undefined = (node as any).jsDoc
    const result: JsDoc[] = []
    if (jsDocs && jsDocs.length > 0) {
      for (const jsDoc of jsDocs) {
        if (jsDoc.tags) {
          for (const tag of jsDoc.tags) {
            result.push(this.getJsDocFromTag(tag))
          }
        }
      }
    }
    return result
  }

  private getJsDocFromTag(tag: ts.JSDocTag) {
    let type: Type | undefined
    let paramName: string | undefined
    let optional: boolean | undefined
    if (tag.tagName.text === 'param') {
      const typeExpression: ts.JSDocTypeExpression = (tag as any).typeExpression
      type = this.getType(typeExpression.type)
      paramName = ((tag as any).name as ts.Identifier).text
      optional = (tag as any).isBracketed
    }
    return {
      name: tag.tagName.text,
      type,
      paramName,
      comment: tag.comment,
      optional
    }
  }

  private getType(type: ts.TypeNode): Type {
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
      return this.getTypeOfTypeLiteral(type as ts.TypeLiteralNode)
    } else if (type.kind === ts.SyntaxKind.ArrayType) {
      const array = type as ts.ArrayTypeNode
      const elementType = this.getType(array.elementType)
      return {
        kind: 'array',
        type: elementType
      }
    } else if (type.kind === ts.SyntaxKind.TypeReference) {
      return this.getTypeOfTypeReference(type as ts.TypeReferenceNode)
    } else if (type.kind === ts.SyntaxKind.UnionType) {
      return this.getTypeOfUnionType(type as ts.UnionTypeNode)
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
      return this.getTypeOfLiteralType(type as ts.LiteralTypeNode)
    } else if (type.kind === ts.SyntaxKind.NullKeyword) {
      return {
        kind: 'null'
      }
    }
    return {
      kind: undefined
    }
  }

  private getTypeOfLiteralType(literalType: ts.LiteralTypeNode): Type {
    let enumType: 'string' | 'number' | undefined
    const enums: any[] = []
    if (literalType.literal.kind === ts.SyntaxKind.StringLiteral) {
      enumType = 'string'
      enums.push(literalType.literal.text)
    } else if (literalType.literal.kind === ts.SyntaxKind.NumericLiteral) {
      enumType = 'number'
      enums.push(+literalType.literal.text)
    }
    if (enumType) {
      return {
        kind: 'enum',
        type: enumType,
        name: enumType,
        enums
      }
    }
    return {
      kind: undefined
    }
  }

  private getTypeOfUnionType(unionType: ts.UnionTypeNode): Type {
    if (unionType.types.every(u => u.kind === ts.SyntaxKind.LiteralType)) {
      let enumType: 'string' | 'number' | undefined
      const enums: any[] = []
      for (const childType of unionType.types) {
        const literalType = childType as ts.LiteralTypeNode
        if (literalType.literal.kind === ts.SyntaxKind.StringLiteral) {
          enumType = 'string'
          enums.push(literalType.literal.text)
        } else if (literalType.literal.kind === ts.SyntaxKind.NumericLiteral) {
          enumType = 'number'
          enums.push(+literalType.literal.text)
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
    } else {
      return {
        kind: 'union',
        members: unionType.types.map(u => this.getType(u))
      }
    }
    return {
      kind: undefined
    }
  }

  private getTypeOfArrayTypeReference(reference: ts.TypeReferenceNode): Type {
    if (reference.typeArguments && reference.typeArguments.length === 1) {
      const typeArgument = reference.typeArguments[0]
      return {
        kind: 'array',
        type: this.getType(typeArgument)
      }
    } else {
      return {
        kind: 'array',
        type: {
          kind: undefined
        }
      }
    }
  }

  private getTypeOfTypeReference(reference: ts.TypeReferenceNode): Type {
    if (reference.typeName.kind === ts.SyntaxKind.Identifier) {
      if (numberTypes.includes(reference.typeName.text)) {
        return {
          kind: 'number',
          type: reference.typeName.text
        }
      } else {
        if (reference.typeName.text === 'Array') {
          return this.getTypeOfArrayTypeReference(reference)
        }
        return {
          kind: 'reference',
          name: reference.typeName.text
        }
      }
    } else if (reference.typeName.kind === ts.SyntaxKind.QualifiedName) {
      const enumName = (reference.typeName.left as ts.Identifier).text
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
    return {
      kind: undefined
    }
  }

  private getTypeOfTypeLiteral(literal: ts.TypeLiteralNode): Type {
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
      const { members, minProperties, maxProperties, additionalProperties } = this.getMembersInfo(literal)
      return {
        kind: 'object',
        members,
        minProperties,
        maxProperties: additionalProperties === undefined ? maxProperties : undefined,
        additionalProperties
      }
    }
    return {
      kind: undefined
    }
  }

  private getMembersInfo(node: ts.TypeNode): MembersInfo {
    if (node.kind === ts.SyntaxKind.TypeLiteral) {
      const typeLiteral = node as ts.TypeLiteralNode
      return this.getObjectMembers(typeLiteral.members)
    } else if (node.kind === ts.SyntaxKind.UnionType) {
      return this.getMembersInfoOfUnionType(node as ts.UnionTypeNode)
    } else if (node.kind === ts.SyntaxKind.IntersectionType) {
      return this.getMembersInfoOfIntersectionType(node as ts.IntersectionTypeNode)
    } else if (node.kind === ts.SyntaxKind.ParenthesizedType) {
      return this.getMembersInfoOfParenthesizedType(node as ts.ParenthesizedTypeNode)
    } else if (node.kind === ts.SyntaxKind.TypeReference) {
      return this.getMembersInfoOfTypeReference(node as ts.TypeReferenceNode)
    }
    return { members: [], minProperties: 0, maxProperties: 0 }
  }

  private getMembersInfoOfUnionType(unionType: ts.UnionTypeNode): MembersInfo {
    const members: Member[] = []
    let minProperties = Infinity
    let maxProperties = 0
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
        this.setOptionalAndEnumOfUnionType(members, childMembers)
        for (const member of childMembers) {
          if (members.every(m => m.name !== member.name)) {
            const childMember: Member = JSON.parse(JSON.stringify(member))
            childMember.optional = true
            members.push(childMember)
          }
        }
      }
    }
    return { members, minProperties, maxProperties }
  }

  private setOptionalAndEnumOfUnionType(members: Member[], childMembers: Member[]) {
    for (const member of members) {
      const childMember = childMembers.find(m => m.name === member.name)
      if (!childMember) {
        member.optional = true
      } else {
        this.setEnumOfUnionType(member, childMember)
      }
    }
  }

  private setEnumOfUnionType(member: Member, childMember: Member) {
    if (childMember.type.kind === 'enum' && member.type.kind === 'enum') {
      for (const typeEnum of childMember.type.enums) {
        if (member.type.enums.every(e => e !== typeEnum)) {
          member.type.enums.push(typeEnum)
        }
      }
    }
  }

  private getMembersInfoOfIntersectionType(intersectionType: ts.IntersectionTypeNode): MembersInfo {
    const members: Member[] = []
    let minProperties = 0
    let maxProperties = 0
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
    return { members, minProperties, maxProperties }
  }

  private getMembersInfoOfParenthesizedType(parenthesizedType: ts.ParenthesizedTypeNode): MembersInfo {
    const members: Member[] = []
    const childMembersInfo = this.getMembersInfo(parenthesizedType.type)
    const minProperties = childMembersInfo.minProperties
    const maxProperties = childMembersInfo.maxProperties
    const childMembers: Member[] = JSON.parse(JSON.stringify(childMembersInfo.members))
    for (const member of childMembers) {
      members.push(member)
    }
    return { members, minProperties, maxProperties }
  }

  private getMembersInfoOfTypeReference(node: ts.TypeReferenceNode): MembersInfo {
    const members: Member[] = []
    let minProperties = 0
    let maxProperties = 0
    const referenceName = (node.typeName as ts.Identifier).text
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
    return { members, minProperties, maxProperties }
  }

  private preHandleType(typeName: string) {
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

  private getObjectMembers(elements: ts.NodeArray<ts.TypeElement>): MembersInfo {
    const members: Member[] = []
    let minProperties = 0
    let maxProperties = 0
    let additionalProperties: Type | undefined | boolean
    for (const element of elements) {
      if (element.kind === ts.SyntaxKind.PropertySignature) {
        const property = element as ts.PropertySignature
        const member = this.getObjectMemberOfPropertySignature(property)
        members.push(member)
        if (!property.questionToken) {
          minProperties++
        }
        maxProperties++
      } else if (element.kind === ts.SyntaxKind.IndexSignature) {
        const indexSignature = element as ts.IndexSignatureDeclaration
        if (indexSignature.type) {
          additionalProperties = this.getType(indexSignature.type)
        }
      }
    }
    return { members, minProperties, maxProperties, additionalProperties }
  }

  private getObjectMemberOfPropertySignature(property: ts.PropertySignature) {
    const name = property.name as ts.Identifier
    const member: Member = {
      name: name.text,
      type: {
        kind: undefined
      }
    }

    if (property.questionToken) {
      member.optional = true
    }

    if (property.type) {
      member.type = this.getType(property.type)
    }

    const propertyJsDocs = this.getJsDocs(property)
    for (const propertyJsDoc of propertyJsDocs) {
      if (propertyJsDoc.name === 'tag') {
        this.setJsonSchemaTag(propertyJsDoc, member)
      } else if (propertyJsDoc.name === 'mapValueType') {
        this.setJsonSchemaMapValue(propertyJsDoc, member.type)
      } else if (propertyJsDoc.name === 'type') {
        this.overrideType(member.type, propertyJsDoc)
      } else if (propertyJsDoc.name === 'param') {
        this.setJsonSchemaParam(propertyJsDoc, member)
      } else if (member.type.kind === 'array') {
        this.setJsonSchemaArray(propertyJsDoc, member.type)
      } else if (member.type.kind === 'number') {
        this.setJsonSchemaNumber(propertyJsDoc, member.type)
      } else if (member.type.kind === 'string') {
        this.setJsonSchemaString(propertyJsDoc, member.type)
      } else if (member.type.kind === 'boolean') {
        this.setJsonSchemaBoolean(propertyJsDoc, member.type)
      } else if (member.type.kind === 'object') {
        this.setJsonSchemaObject(propertyJsDoc, member.type)
      } else if (member.type.kind === 'reference') {
        this.setJsonSchemaReference(propertyJsDoc, member.type)
      }
    }

    return member
  }

  private setJsonSchemaReference(propertyJsDoc: JsDoc, type: ReferenceType) {
    if (propertyJsDoc.comment) {
      type.default = JSON.parse(this.getJsDocComment(propertyJsDoc.comment))
    }
  }

  private setJsonSchemaTag(propertyJsDoc: JsDoc, member: Member) {
    if (propertyJsDoc.comment) {
      member.tag = +propertyJsDoc.comment
    }
  }

  private setJsonSchemaMapValue(propertyJsDoc: JsDoc, type: Type) {
    if (propertyJsDoc.comment && type.kind === 'map') {
      if (type.value.kind === 'number') {
        type.value.type = propertyJsDoc.comment
      }
    }
  }

  private setJsonSchemaParam(propertyJsDoc: JsDoc, member: Member) {
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
  }

  private setJsonSchemaBoolean(propertyJsDoc: JsDoc, type: BooleanType) {
    if (propertyJsDoc.comment) {
      if (propertyJsDoc.name === 'default') {
        type.default = this.getJsDocComment(propertyJsDoc.comment).toLowerCase() === 'true'
      } else if (propertyJsDoc.name === 'title') {
        type.title = propertyJsDoc.comment
      } else if (propertyJsDoc.name === 'description') {
        type.description = propertyJsDoc.comment
      }
    }
  }

  private getJsDocComment(comment: string) {
    if (comment.length >= 2) {
      if ((comment.startsWith(`'`) && comment.endsWith(`'`))
        || (comment.startsWith(`"`) && comment.endsWith(`"`))
        || (comment.startsWith('`') && comment.endsWith('`'))) {
        return comment.substring(1, comment.length - 1)
      }
    }
    return comment
  }

  private setJsonSchemaString(propertyJsDoc: JsDoc, type: StringType) {
    if (propertyJsDoc.comment) {
      if (propertyJsDoc.name === 'minLength') {
        type.minLength = +propertyJsDoc.comment
      } else if (propertyJsDoc.name === 'maxLength') {
        type.maxLength = +propertyJsDoc.comment
      } else if (propertyJsDoc.name === 'pattern') {
        type.pattern = propertyJsDoc.comment
      } else if (propertyJsDoc.name === 'default') {
        type.default = this.getJsDocComment(propertyJsDoc.comment)
      } else if (propertyJsDoc.name === 'title') {
        type.title = propertyJsDoc.comment
      } else if (propertyJsDoc.name === 'description') {
        type.description = propertyJsDoc.comment
      }
    }
  }

  private setJsonSchemaNumber(propertyJsDoc: JsDoc, type: NumberType) {
    if (propertyJsDoc.comment) {
      if (propertyJsDoc.name === 'multipleOf') {
        type.multipleOf = +propertyJsDoc.comment
      } else if (propertyJsDoc.name === 'maximum') {
        type.maximum = +propertyJsDoc.comment
      } else if (propertyJsDoc.name === 'minimum') {
        type.minimum = +propertyJsDoc.comment
      } else if (propertyJsDoc.name === 'exclusiveMaximum') {
        type.exclusiveMaximum = +propertyJsDoc.comment
      } else if (propertyJsDoc.name === 'exclusiveMinimum') {
        type.exclusiveMinimum = +propertyJsDoc.comment
      } else if (propertyJsDoc.name === 'default') {
        type.default = +this.getJsDocComment(propertyJsDoc.comment)
      } else if (propertyJsDoc.name === 'title') {
        type.title = propertyJsDoc.comment
      } else if (propertyJsDoc.name === 'description') {
        type.description = propertyJsDoc.comment
      }
    }
  }

  private overrideType(type: Type, jsDoc: JsDoc | undefined) {
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

  private setJsonSchemaArray(jsDoc: JsDoc, type: ArrayType) {
    if (jsDoc.comment) {
      if (jsDoc.name === 'minItems') {
        type.minItems = +jsDoc.comment
      } else if (jsDoc.name === 'maxItems') {
        type.maxItems = +jsDoc.comment
      } else if (jsDoc.name === 'itemType') {
        this.overrideType(type, jsDoc)
      } else if (type.type.kind === 'number') {
        this.setJsonSchemaNumberArray(jsDoc, type.type)
      } else if (type.type.kind === 'string') {
        this.setJsonSchemaStringArray(jsDoc, type.type)
      } else if (type.type.kind === 'boolean') {
        if (jsDoc.name === 'itemDefault') {
          type.type.default = this.getJsDocComment(jsDoc.comment).toLowerCase() === 'true'
        }
      } else if (jsDoc.name === 'default') {
        type.default = JSON.parse(this.getJsDocComment(jsDoc.comment))
      }
    } else if (jsDoc.name === 'uniqueItems') {
      type.uniqueItems = true
    } else if (jsDoc.name === 'title') {
      type.title = jsDoc.comment
    } else if (jsDoc.name === 'description') {
      type.description = jsDoc.comment
    }
  }

  private setJsonSchemaNumberArray(jsDoc: JsDoc, type: NumberType) {
    if (jsDoc.comment) {
      if (jsDoc.name === 'itemMultipleOf') {
        type.multipleOf = +jsDoc.comment
      } else if (jsDoc.name === 'itemMinimum') {
        type.minimum = +jsDoc.comment
      } else if (jsDoc.name === 'itemMaximum') {
        type.maximum = +jsDoc.comment
      } else if (jsDoc.name === 'itemExclusiveMinimum') {
        type.exclusiveMinimum = +jsDoc.comment
      } else if (jsDoc.name === 'itemExclusiveMaximum') {
        type.exclusiveMaximum = +jsDoc.comment
      } else if (jsDoc.name === 'itemDefault') {
        type.default = +this.getJsDocComment(jsDoc.comment)
      }
    }
  }

  private setJsonSchemaStringArray(jsDoc: JsDoc, type: StringType) {
    if (jsDoc.comment) {
      if (jsDoc.name === 'itemMinLength') {
        type.minLength = +jsDoc.comment
      } else if (jsDoc.name === 'itemMaxLength') {
        type.maxLength = +jsDoc.comment
      } else if (jsDoc.name === 'itemPattern') {
        type.pattern = jsDoc.comment
      } else if (jsDoc.name === 'itemDefault') {
        type.default = this.getJsDocComment(jsDoc.comment)
      }
    }
  }

  private setJsonSchemaObject(jsDoc: JsDoc, type: ObjectType) {
    if (jsDoc.comment) {
      if (jsDoc.name === 'minProperties') {
        type.minProperties = +jsDoc.comment
      } else if (jsDoc.name === 'maxProperties') {
        type.maxProperties = +jsDoc.comment
      } else if (jsDoc.name === 'default') {
        type.default = JSON.parse(this.getJsDocComment(jsDoc.comment))
      } else if (jsDoc.name === 'title') {
        type.title = jsDoc.comment
      } else if (jsDoc.name === 'description') {
        type.description = jsDoc.comment
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
  additionalProperties?: Type | boolean;
}
