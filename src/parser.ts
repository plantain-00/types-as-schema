import ts from 'typescript'
import {
  Member,
  TypeDeclaration,
  EnumDeclaration,
  Type,
  ArrayType,
  ObjectType,
  NumberType,
  StringType,
  BooleanType,
  ReferenceType,
  NumberDeclaration,
  StringDeclaration,
  ReferenceDeclaration,
  UnionDeclaration,
  ObjectDeclaration,
  ArrayDeclaration,
  Expression,
  warn,
  getPosition,
  FunctionDeclaration,
  FunctionParameter
} from './utils'

export class Parser {
  private declarations: TypeDeclaration[] = []

  constructor(private sourceFiles: ts.SourceFile[]) { }

  parse() {
    for (const sourceFile of this.sourceFiles) {
      ts.forEachChild(sourceFile, node => {
        if (node.kind === ts.SyntaxKind.EnumDeclaration) {
          this.preHandleEnumDeclaration(node as ts.EnumDeclaration, sourceFile)
        }
      })
    }

    for (const sourceFile of this.sourceFiles) {
      ts.forEachChild(sourceFile, node => {
        this.handleSourceFile(node, sourceFile)
      })
    }

    return this.declarations
  }

  private preHandleEnumDeclaration(declaration: ts.EnumDeclaration, sourceFile: ts.SourceFile) {
    const members = declaration.members
    if (members.length > 0) {
      const firstMember = members[0]
      if (firstMember.initializer) {
        this.handleEnumDeclarationInitializer(declaration, members, firstMember.initializer, sourceFile)
      } else {
        const enumType: EnumDeclaration = {
          kind: 'enum',
          name: declaration.name.text,
          type: 'uint32',
          members: [],
          position: getPosition(declaration, sourceFile)
        }
        let lastIndex = 0
        for (const member of members) {
          if (member.initializer) {
            const { name, value } = this.getExpression(member.initializer, member.name as ts.Identifier, sourceFile)
            enumType.members.push({
              name,
              value
            })
            lastIndex = value + 1
          } else {
            enumType.members.push({
              name: (member.name as ts.Identifier).text,
              value: lastIndex
            })
            lastIndex++
          }
        }
        this.declarations.push(enumType)
      }
    }
  }

  private handleEnumDeclarationInitializer(
    declaration: ts.EnumDeclaration,
    members: ts.NodeArray<ts.EnumMember>,
    initializer: ts.Expression,
    sourceFile: ts.SourceFile
  ) {
    const enumType: EnumDeclaration = {
      kind: 'enum',
      name: declaration.name.text,
      type: initializer.kind === ts.SyntaxKind.StringLiteral ? ts.ClassificationTypeNames.stringLiteral : 'uint32',
      members: [],
      position: getPosition(declaration, sourceFile)
    }
    for (const member of members) {
      if (member.initializer) {
        const { name, value } = this.getExpression(member.initializer, member.name as ts.Identifier, sourceFile)
        enumType.members.push({
          name,
          value
        })
      }
    }
    this.declarations.push(enumType)
  }

  private handleSourceFile(node: ts.Node, sourceFile: ts.SourceFile) {
    const jsDocs = this.getJsDocs(node, sourceFile)
    const entry = jsDocs.find(jsDoc => jsDoc.name === 'entry')
    if (node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
      this.handleTypeAliasDeclaration(node as ts.TypeAliasDeclaration, jsDocs, entry, sourceFile)
    } else if (node.kind === ts.SyntaxKind.InterfaceDeclaration || node.kind === ts.SyntaxKind.ClassDeclaration) {
      this.handleInterfaceOrClassDeclaration(node as ts.InterfaceDeclaration, jsDocs, entry, sourceFile)
    } else if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
      this.handleFunctionDeclaration(node as ts.FunctionDeclaration, jsDocs, sourceFile)
    }
  }

  private handleFunctionDeclaration(
    declaration: ts.FunctionDeclaration,
    jsDocs: JsDoc[],
    sourceFile: ts.SourceFile
  ) {
    const type = declaration.type
      ? this.getType(declaration.type, sourceFile)
      : {
        kind: undefined,
        position: getPosition(declaration, sourceFile)
      }
    const functionDeclaration: FunctionDeclaration = {
      kind: 'function',
      name: declaration.name ? declaration.name.text : '',
      type,
      optional: !!declaration.questionToken,
      parameters: declaration.parameters.map((parameter) => this.handleFunctionParameter(parameter, sourceFile))
    }
    for (const jsDoc of jsDocs) {
      if (jsDoc.comment) {
        if (jsDoc.name === 'method') {
          functionDeclaration.method = jsDoc.comment
        } else if (jsDoc.name === 'path') {
          functionDeclaration.path = jsDoc.comment
        } else if (jsDoc.name === 'description') {
          functionDeclaration.description = jsDoc.comment
        } else if (jsDoc.name === 'summary') {
          functionDeclaration.summary = jsDoc.comment
        }
      }
    }
    this.declarations.push(functionDeclaration)
  }

  private handleFunctionParameter(parameter: ts.ParameterDeclaration, sourceFile: ts.SourceFile) {
    const parameterDoc = this.getParameter(parameter, sourceFile)
    const jsDocs = this.getJsDocs(parameter, sourceFile)
    for (const jsDoc of jsDocs) {
      if (jsDoc.comment && jsDoc.name === 'in') {
        parameterDoc.in = jsDoc.comment
      }
    }
    this.setJsDoc(jsDocs, parameterDoc.type, sourceFile)
    return parameterDoc
  }

  private handleInterfaceOrClassDeclaration(
    declaration: ts.InterfaceDeclaration | ts.ClassDeclaration,
    jsDocs: JsDoc[],
    entry: JsDoc | undefined,
    sourceFile: ts.SourceFile
  ) {
    // if the node is pre-handled, then it should be in `declarations` already, so don't continue
    if (this.declarations.some(m => m.kind === 'enum' && m.name === declaration.name!.text)) {
      return
    }

    let { members, minProperties, maxProperties, additionalProperties } = this.getObjectMembers(declaration.members, sourceFile)

    let additionalPropertiesFromHeritageClauses: Type | undefined | boolean
    ({
      minProperties,
      maxProperties,
      additionalProperties: additionalPropertiesFromHeritageClauses
    } = this.handleHeritageClauses(
      declaration,
      members,
      minProperties,
      maxProperties
    ))
    if (additionalPropertiesFromHeritageClauses) {
      additionalProperties = additionalPropertiesFromHeritageClauses
    }

    const objectDeclaration: ObjectDeclaration = {
      kind: 'object',
      name: declaration.name!.text,
      members,
      minProperties,
      maxProperties: additionalProperties === undefined ? maxProperties : undefined,
      additionalProperties,
      entry: entry ? entry.comment : undefined,
      position: getPosition(declaration, sourceFile)
    }

    for (const jsDoc of jsDocs) {
      this.setJsDocObject(jsDoc, objectDeclaration)
    }

    this.declarations.push(objectDeclaration)
  }

  private handleHeritageClauses(
    declaration: ts.InterfaceDeclaration | ts.ClassDeclaration,
    members: Member[],
    minProperties: number,
    maxProperties: number
  ) {
    let additionalProperties: Type | undefined | boolean
    if (declaration.heritageClauses) {
      for (const clause of declaration.heritageClauses) {
        if (clause.kind === ts.SyntaxKind.HeritageClause) {
          for (const type of clause.types) {
            if (type.kind === ts.SyntaxKind.ExpressionWithTypeArguments) {
              ({ minProperties, maxProperties, additionalProperties } = this.handleExpressionWithTypeArguments(
                type.expression as ts.Identifier,
                members,
                minProperties,
                maxProperties
              ))
            }
          }
        }
      }
    }
    return { minProperties, maxProperties, additionalProperties }
  }

  private handleExpressionWithTypeArguments(
    declaration: ts.Identifier,
    members: Member[],
    minProperties: number,
    maxProperties: number
  ) {
    const interfaceName = declaration.text
    this.preHandleType(interfaceName)
    let additionalProperties: Type | undefined | boolean
    const clauseDeclaration = this.declarations.find(m => m.kind === 'object' && m.name === interfaceName)
    if (clauseDeclaration && clauseDeclaration.kind === 'object') {
      additionalProperties = clauseDeclaration.additionalProperties
      for (const member of clauseDeclaration.members) {
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

  private handleTypeAliasDeclaration(
    declaration: ts.TypeAliasDeclaration,
    jsDocs: JsDoc[],
    entry: JsDoc | undefined,
    sourceFile: ts.SourceFile
  ) {
    if (declaration.type.kind === ts.SyntaxKind.ArrayType) {
      this.handleArrayTypeInTypeAliasDeclaration(
        declaration.type as ts.ArrayTypeNode,
        declaration.name,
        jsDocs,
        entry,
        sourceFile
      )
    } else if (declaration.type.kind === ts.SyntaxKind.TypeLiteral
      || declaration.type.kind === ts.SyntaxKind.UnionType
      || declaration.type.kind === ts.SyntaxKind.IntersectionType) {
      this.handleTypeLiteralOrUnionTypeOrIntersectionType(
        declaration.type as ts.TypeLiteralNode | ts.UnionOrIntersectionTypeNode,
        declaration.name,
        jsDocs,
        entry,
        sourceFile
      )
    } else if (declaration.type.kind === ts.SyntaxKind.TypeReference) {
      const typeReference = declaration.type as ts.TypeReferenceNode
      const referenceDeclaration: ReferenceDeclaration = {
        kind: 'reference',
        newName: declaration.name.text,
        name: (typeReference.typeName as ts.Identifier).text,
        position: getPosition(declaration, sourceFile)
      }
      this.declarations.push(referenceDeclaration)
    }
  }

  private handleTypeLiteralOrUnionTypeOrIntersectionType(
    declarationType: ts.TypeLiteralNode | ts.UnionOrIntersectionTypeNode,
    declarationName: ts.Identifier,
    jsDocs: JsDoc[],
    entry: JsDoc | undefined,
    sourceFile: ts.SourceFile
  ) {
    if (declarationType.kind === ts.SyntaxKind.UnionType) {
      const unionType = declarationType
      if (unionType.types.every(u => u.kind === ts.SyntaxKind.LiteralType || u.kind === ts.SyntaxKind.NullKeyword)) {
        this.handleUnionTypeOfLiteralType(unionType, declarationName, sourceFile)
        return
      }
      if (unionType.types.every(u => u.kind === ts.SyntaxKind.TypeReference)) {
        const unionDeclaration: UnionDeclaration = {
          kind: 'union',
          name: declarationName.text,
          members: unionType.types.map(u => this.getType(u, sourceFile)),
          entry: entry ? entry.comment : undefined,
          position: getPosition(declarationName, sourceFile)
        }
        this.declarations.push(unionDeclaration)
        return
      }
    }
    const { members, minProperties, maxProperties, additionalProperties } = this.getMembersInfo(declarationType, sourceFile)
    const objectDeclaration: ObjectDeclaration = {
      kind: 'object',
      name: declarationName.text,
      members,
      minProperties,
      maxProperties: additionalProperties === undefined ? maxProperties : undefined,
      additionalProperties,
      entry: entry ? entry.comment : undefined,
      position: getPosition(declarationName, sourceFile)
    }
    for (const jsDoc of jsDocs) {
      this.setJsDocObject(jsDoc, objectDeclaration)
    }
    this.declarations.push(objectDeclaration)
  }

  private handleUnionTypeOfLiteralType(unionType: ts.UnionTypeNode, declarationName: ts.Identifier, sourceFile: ts.SourceFile) {
    let enumType: EnumValueType | undefined
    const enums: any[] = []
    for (const childType of unionType.types) {
      if (childType.kind === ts.SyntaxKind.LiteralType) {
        const { type, value } = this.getEnumOfLiteralType(childType as ts.LiteralTypeNode)
        if (type !== undefined) {
          enumType = type
        }
        if (value !== undefined) {
          enums.push(value)
        }
      } else if (childType.kind === ts.SyntaxKind.NullKeyword) {
        enums.push(null)
      }
    }
    if (enumType) {
      if (enumType === 'string') {
        const stringDeclaration: StringDeclaration = {
          kind: 'string',
          name: declarationName.text,
          enums,
          position: getPosition(declarationName, sourceFile)
        }
        this.declarations.push(stringDeclaration)
      } else if (enumType === 'number') {
        const numberDeclaration: NumberDeclaration = {
          kind: 'number',
          type: enumType,
          name: declarationName.text,
          enums,
          position: getPosition(declarationName, sourceFile)
        }
        this.declarations.push(numberDeclaration)
      } else if (enumType === 'boolean') {
        const unionDeclaration: UnionDeclaration = {
          kind: 'union',
          name: declarationName.text,
          members: unionType.types.map(e => this.getType(e, sourceFile)),
          entry: undefined,
          position: getPosition(declarationName, sourceFile)
        }
        this.declarations.push(unionDeclaration)
      }
    }
  }

  private handleArrayTypeInTypeAliasDeclaration(
    arrayType: ts.ArrayTypeNode,
    declarationName: ts.Identifier,
    jsDocs: JsDoc[],
    entry: JsDoc | undefined,
    sourceFile: ts.SourceFile
  ) {
    const type = this.getType(arrayType.elementType, sourceFile)
    const arrayDeclaration: ArrayDeclaration = {
      kind: 'array',
      name: declarationName.text,
      type,
      entry: entry ? entry.comment : undefined,
      position: getPosition(declarationName, sourceFile)
    }
    for (const jsDoc of jsDocs) {
      this.setJsDocArray(jsDoc, arrayDeclaration, sourceFile)
    }
    this.declarations.push(arrayDeclaration)
  }

  private getJsDocs(node: ts.Node, sourceFile: ts.SourceFile) {
    const jsDocs: ts.JSDoc[] | undefined = (node as any).jsDoc
    const result: JsDoc[] = []
    if (jsDocs && jsDocs.length > 0) {
      for (const jsDoc of jsDocs) {
        if (jsDoc.tags) {
          for (const tag of jsDoc.tags) {
            result.push(this.getJsDocFromTag(tag, sourceFile))
          }
        }
      }
    }
    return result
  }

  private getJsDocFromTag(tag: ts.JSDocTag, sourceFile: ts.SourceFile) {
    let type: Type | undefined
    let paramName: string | undefined
    let optional: boolean | undefined
    if (tag.tagName.text === 'param') {
      const typeExpression: ts.JSDocTypeExpression = (tag as any).typeExpression
      type = this.getType(typeExpression.type, sourceFile)
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

  private getType(type: ts.TypeNode, sourceFile: ts.SourceFile): Type {
    if (type.kind === ts.SyntaxKind.StringKeyword) {
      return {
        kind: 'string',
        position: getPosition(type, sourceFile)
      }
    }
    if (type.kind === ts.SyntaxKind.NumberKeyword) {
      return {
        kind: 'number',
        type: 'number',
        position: getPosition(type, sourceFile)
      }
    }
    if (type.kind === ts.SyntaxKind.BooleanKeyword) {
      return {
        kind: 'boolean',
        position: getPosition(type, sourceFile)
      }
    }
    if (type.kind === ts.SyntaxKind.TypeLiteral) {
      return this.getTypeOfTypeLiteral(type as ts.TypeLiteralNode, sourceFile)
    }
    if (type.kind === ts.SyntaxKind.ArrayType) {
      const array = type as ts.ArrayTypeNode
      const elementType = this.getType(array.elementType, sourceFile)
      return {
        kind: 'array',
        type: elementType,
        position: getPosition(type, sourceFile)
      }
    }
    if (type.kind === ts.SyntaxKind.TypeReference) {
      return this.getTypeOfTypeReference(type as ts.TypeReferenceNode, sourceFile)
    }
    if (type.kind === ts.SyntaxKind.UnionType) {
      return this.getTypeOfUnionType(type as ts.UnionTypeNode, sourceFile)
    }
    if (type.kind === ts.SyntaxKind.LiteralType) {
      return this.getTypeOfLiteralType(type as ts.LiteralTypeNode, sourceFile)
    }
    if (type.kind === ts.SyntaxKind.NullKeyword) {
      return {
        kind: 'null',
        position: getPosition(type, sourceFile)
      }
    }
    if (type.kind === ts.SyntaxKind.TupleType) {
      const tupleType = type as ts.TupleTypeNode
      let arrayType: Type | undefined
      for (const elementType of tupleType.elementTypes) {
        arrayType = this.getType(elementType, sourceFile)
      }
      if (arrayType) {
        return {
          kind: 'array',
          type: arrayType,
          minItems: tupleType.elementTypes.length,
          maxItems: tupleType.elementTypes.length,
          position: getPosition(type, sourceFile)
        }
      }
    }
    const position = getPosition(type, sourceFile)
    if (type.kind !== ts.SyntaxKind.AnyKeyword) {
      warn(position, 'parser')
    }
    return {
      kind: undefined,
      position
    }
  }

  private getEnumOfLiteralType(literalType: ts.LiteralTypeNode): { type?: EnumValueType, value: any } {
    if (literalType.literal.kind === ts.SyntaxKind.StringLiteral) {
      return {
        type: 'string',
        value: literalType.literal.text
      }
    }
    if (literalType.literal.kind === ts.SyntaxKind.NumericLiteral) {
      return {
        type: 'number',
        value: +literalType.literal.text
      }
    }
    if (literalType.literal.kind === ts.SyntaxKind.TrueKeyword) {
      return {
        type: 'boolean',
        value: true
      }
    }
    if (literalType.literal.kind === ts.SyntaxKind.FalseKeyword) {
      return {
        type: 'boolean',
        value: false
      }
    }
    return {
      type: undefined,
      value: undefined
    }
  }

  private getTypeOfLiteralType(literalType: ts.LiteralTypeNode, sourceFile: ts.SourceFile): Type {
    let enumType: EnumValueType | undefined
    const enums: any[] = []
    const { type, value } = this.getEnumOfLiteralType(literalType)
    if (type !== undefined) {
      enumType = type
    }
    if (value !== undefined) {
      enums.push(value)
    }
    if (enumType) {
      return {
        kind: 'enum',
        type: enumType,
        name: enumType,
        enums,
        position: getPosition(literalType, sourceFile)
      }
    }
    return {
      kind: undefined,
      position: getPosition(literalType, sourceFile)
    }
  }

  private getTypeOfUnionType(unionType: ts.UnionTypeNode, sourceFile: ts.SourceFile): Type {
    if (unionType.types.every(u => u.kind === ts.SyntaxKind.LiteralType)) {
      let enumType: EnumValueType | undefined
      const enums: any[] = []
      for (const childType of unionType.types) {
        const { type, value } = this.getEnumOfLiteralType(childType as ts.LiteralTypeNode)
        if (type !== undefined) {
          enumType = type
        }
        if (value !== undefined) {
          enums.push(value)
        }
      }
      if (enumType) {
        return {
          kind: 'enum',
          type: enumType,
          name: enumType,
          enums,
          position: getPosition(unionType, sourceFile)
        }
      }
    } else {
      return {
        kind: 'union',
        members: unionType.types.map(u => this.getType(u, sourceFile)),
        position: getPosition(unionType, sourceFile)
      }
    }
    return {
      kind: undefined,
      position: getPosition(unionType, sourceFile)
    }
  }

  private getTypeOfArrayTypeReference(reference: ts.TypeReferenceNode, sourceFile: ts.SourceFile): Type {
    if (reference.typeArguments && reference.typeArguments.length === 1) {
      const typeArgument = reference.typeArguments[0]
      return {
        kind: 'array',
        type: this.getType(typeArgument, sourceFile),
        position: getPosition(typeArgument, sourceFile)
      }
    } else {
      return {
        kind: 'array',
        type: {
          kind: undefined
        },
        position: getPosition(reference, sourceFile)
      } as ArrayType
    }
  }

  private getTypeOfTypeReference(reference: ts.TypeReferenceNode, sourceFile: ts.SourceFile): Type {
    if (reference.typeName.kind === ts.SyntaxKind.Identifier) {
      if (numberTypes.includes(reference.typeName.text)) {
        return {
          kind: 'number',
          type: reference.typeName.text,
          position: getPosition(reference.typeName, sourceFile)
        }
      }
      if (reference.typeName.text === 'Array') {
        return this.getTypeOfArrayTypeReference(reference, sourceFile)
      }
      if (reference.typeName.text === 'Promise' && reference.typeArguments && reference.typeArguments.length > 0) {
        const typeArgument = reference.typeArguments[0]
        if (typeArgument.kind === ts.SyntaxKind.TypeReference) {
          return this.getTypeOfTypeReference(typeArgument as ts.TypeReferenceNode, sourceFile)
        }
      }
      return {
        kind: 'reference',
        name: reference.typeName.text,
        position: getPosition(reference.typeName, sourceFile)
      }
    }
    if (reference.typeName.kind === ts.SyntaxKind.QualifiedName) {
      const enumName = (reference.typeName.left as ts.Identifier).text
      const enumDeclaration = this.declarations.find(m => m.kind === 'enum' && m.name === enumName) as EnumDeclaration | undefined
      if (enumDeclaration) {
        return {
          kind: 'enum',
          name: enumDeclaration.name,
          type: enumDeclaration.type,
          enums: enumDeclaration.members.map(m => m.value),
          position: getPosition(reference.typeName, sourceFile)
        }
      }
    }
    return {
      kind: undefined,
      position: getPosition(reference.typeName, sourceFile)
    }
  }

  private getTypeOfTypeLiteral(literal: ts.TypeLiteralNode, sourceFile: ts.SourceFile): Type {
    if (literal.members.length === 1 && literal.members[0].kind === ts.SyntaxKind.IndexSignature) {
      const indexSignature = literal.members[0] as ts.IndexSignatureDeclaration
      if (indexSignature.parameters.length === 1) {
        const parameterType = indexSignature.parameters[0].type
        if (parameterType && indexSignature.type) {
          return {
            kind: 'map',
            key: this.getType(parameterType, sourceFile),
            value: this.getType(indexSignature.type, sourceFile),
            position: getPosition(parameterType, sourceFile)
          }
        }
      }
    } else {
      const { members, minProperties, maxProperties, additionalProperties } = this.getMembersInfo(literal, sourceFile)
      return {
        kind: 'object',
        members,
        minProperties,
        maxProperties: additionalProperties === undefined ? maxProperties : undefined,
        additionalProperties,
        position: getPosition(literal, sourceFile)
      }
    }
    return {
      kind: undefined,
      position: getPosition(literal, sourceFile)
    }
  }

  private getMembersInfo(node: ts.TypeNode, sourceFile: ts.SourceFile): MembersInfo {
    if (node.kind === ts.SyntaxKind.TypeLiteral) {
      const typeLiteral = node as ts.TypeLiteralNode
      return this.getObjectMembers(typeLiteral.members, sourceFile)
    }
    if (node.kind === ts.SyntaxKind.UnionType) {
      return this.getMembersInfoOfUnionType(node as ts.UnionTypeNode, sourceFile)
    }
    if (node.kind === ts.SyntaxKind.IntersectionType) {
      return this.getMembersInfoOfIntersectionType(node as ts.IntersectionTypeNode, sourceFile)
    }
    if (node.kind === ts.SyntaxKind.ParenthesizedType) {
      return this.getMembersInfoOfParenthesizedType(node as ts.ParenthesizedTypeNode, sourceFile)
    }
    if (node.kind === ts.SyntaxKind.TypeReference) {
      return this.getMembersInfoOfTypeReference(node as ts.TypeReferenceNode)
    }
    return { members: [], minProperties: 0, maxProperties: 0 }
  }

  private getMembersInfoOfUnionType(unionType: ts.UnionTypeNode, sourceFile: ts.SourceFile): MembersInfo {
    const members: Member[] = []
    let minProperties = Infinity
    let maxProperties = 0
    for (const type of unionType.types) {
      const childMembersInfo = this.getMembersInfo(type, sourceFile)
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

  private getMembersInfoOfIntersectionType(intersectionType: ts.IntersectionTypeNode, sourceFile: ts.SourceFile): MembersInfo {
    const members: Member[] = []
    let minProperties = 0
    let maxProperties = 0
    for (const type of intersectionType.types) {
      const childMembersInfo = this.getMembersInfo(type, sourceFile)
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

  private getMembersInfoOfParenthesizedType(parenthesizedType: ts.ParenthesizedTypeNode, sourceFile: ts.SourceFile): MembersInfo {
    const members: Member[] = []
    const childMembersInfo = this.getMembersInfo(parenthesizedType.type, sourceFile)
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
    const objectDeclaration = this.declarations.find(m => m.kind === 'object' && m.name === referenceName)
    if (objectDeclaration && objectDeclaration.kind === 'object') {
      for (const member of objectDeclaration.members) {
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

  // tslint:disable-next-line:cognitive-complexity
  private preHandleType(typeName: string) {
    // if the node is pre-handled, then it should be in `declarations` already, so don't continue
    if (this.declarations.some(m => m.name === typeName)) {
      return
    }

    let findIt = false
    for (const sourceFile of this.sourceFiles) {
      if (findIt) {
        return
      }
      ts.forEachChild(sourceFile, node => {
        if (findIt) {
          return
        }
        if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
          const declaration = node as ts.InterfaceDeclaration
          if (declaration.name.text === typeName) {
            findIt = true
            this.handleSourceFile(node, sourceFile)
          }
        } else if (node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
          const declaration = node as ts.TypeAliasDeclaration
          if (declaration.name.text === typeName) {
            findIt = true
            this.handleSourceFile(node, sourceFile)
          }
        }
      })
    }
  }

  // tslint:disable-next-line:cognitive-complexity
  private getObjectMembers(elements: ts.NodeArray<ts.TypeElement | ts.ClassElement>, sourceFile: ts.SourceFile): MembersInfo {
    const members: Member[] = []
    let minProperties = 0
    let maxProperties = 0
    let additionalProperties: Type | undefined | boolean
    for (const element of elements) {
      if (element.kind === ts.SyntaxKind.PropertySignature || element.kind === ts.SyntaxKind.PropertyDeclaration) {
        const property = element as ts.PropertySignature | ts.PropertyDeclaration
        const member = this.getObjectMemberOfPropertyOrMethodOrConstructorParameter(property, sourceFile)
        members.push(member)
        if (!property.questionToken) {
          minProperties++
        }
        maxProperties++
      } else if (element.kind === ts.SyntaxKind.IndexSignature) {
        const indexSignature = element as ts.IndexSignatureDeclaration
        if (indexSignature.type) {
          additionalProperties = this.getType(indexSignature.type, sourceFile)
        }
      } else if (element.kind === ts.SyntaxKind.MethodSignature || element.kind === ts.SyntaxKind.MethodDeclaration) {
        const methodSignature = element as ts.MethodSignature | ts.MethodDeclaration
        const member = this.getObjectMemberOfPropertyOrMethodOrConstructorParameter(methodSignature, sourceFile)
        members.push(member)
      } else if (element.kind === ts.SyntaxKind.Constructor) {
        const constructorDeclaration = element as ts.ConstructorDeclaration
        for (const parameter of constructorDeclaration.parameters) {
          if (parameter.modifiers
            && parameter.modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.PublicKeyword
              || modifier.kind === ts.SyntaxKind.PrivateKeyword
              || modifier.kind === ts.SyntaxKind.ProtectedKeyword)) {
            const member = this.getObjectMemberOfPropertyOrMethodOrConstructorParameter(parameter, sourceFile)
            members.push(member)
            if (!parameter.questionToken) {
              minProperties++
            }
            maxProperties++
          }
        }
      }
    }
    return { members, minProperties, maxProperties, additionalProperties }
  }

  private getExpression(expression: ts.Expression, name: ts.Identifier, sourceFile: ts.SourceFile): Expression {
    const { type, value } = this.getTypeAndValueOfExpression(expression, sourceFile)
    return {
      name: name.text,
      type,
      value
    }
  }

  private getTypeAndValueOfExpression(expression: ts.Expression, sourceFile: ts.SourceFile): { type: Type, value: any } {
    if (expression.kind === ts.SyntaxKind.StringLiteral) {
      return {
        type: {
          kind: 'string',
          position: getPosition(expression, sourceFile)
        },
        value: (expression as ts.StringLiteral).text
      }
    }
    if (expression.kind === ts.SyntaxKind.NumericLiteral) {
      return {
        type: {
          kind: 'number',
          type: 'number',
          position: getPosition(expression, sourceFile)
        },
        value: +(expression as ts.NumericLiteral).text
      }
    }
    if (expression.kind === ts.SyntaxKind.FalseKeyword || expression.kind === ts.SyntaxKind.TrueKeyword) {
      return {
        type: {
          kind: 'boolean',
          position: getPosition(expression, sourceFile)
        },
        value: expression.kind === ts.SyntaxKind.TrueKeyword
      }
    } else if (expression.kind === ts.SyntaxKind.ArrayLiteralExpression) {
      const arrayLiteral = expression as ts.ArrayLiteralExpression
      let elementsType: Type = {
        kind: undefined,
        position: getPosition(expression, sourceFile)
      }
      const elementsValues = []
      for (const element of arrayLiteral.elements) {
        const { type, value } = this.getTypeAndValueOfExpression(element, sourceFile)
        elementsType = type
        elementsValues.push(value)
      }
      return {
        type: {
          kind: 'array',
          type: elementsType,
          position: getPosition(expression, sourceFile)
        },
        value: elementsValues
      }
    } else if (expression.kind === ts.SyntaxKind.ObjectLiteralExpression) {
      const arrayLiteral = expression as ts.ObjectLiteralExpression
      const members: Member[] = []
      const value: any = {}
      for (const property of arrayLiteral.properties) {
        if (property.kind === ts.SyntaxKind.PropertyAssignment) {
          const expression = this.getExpression(property.initializer, property.name as ts.Identifier, sourceFile)
          members.push({
            name: expression.name,
            type: expression.type
          })
          value[expression.name] = expression.value
        }
      }
      return {
        type: {
          kind: 'object',
          members,
          minProperties: members.length,
          position: getPosition(expression, sourceFile)
        },
        value
      }
    }
    return {
      type: {
        kind: undefined,
        position: getPosition(expression, sourceFile)
      },
      value: undefined
    }
  }

  private getObjectMemberOfPropertyOrMethodOrConstructorParameter(
    // tslint:disable-next-line:max-union-size
    property: ts.PropertySignature | ts.PropertyDeclaration | ts.MethodSignature | ts.MethodDeclaration | ts.ParameterDeclaration,
    sourceFile: ts.SourceFile
  ) {
    const name = property.name as ts.Identifier
    const member: Member = {
      name: name.text,
      type: {
        kind: undefined,
        position: getPosition(property, sourceFile)
      }
    }

    if (property.questionToken) {
      member.optional = true
    }

    let defaultValue: any
    if ((property.kind === ts.SyntaxKind.PropertySignature || property.kind === ts.SyntaxKind.PropertyDeclaration)
      && property.initializer) {
      const { type, value } = this.getTypeAndValueOfExpression(property.initializer, sourceFile)
      member.type = type
      defaultValue = value
    }

    if (property.type) {
      member.type = this.getType(property.type, sourceFile)
    }

    if (defaultValue !== undefined) {
      // tslint:disable-next-line:max-union-size
      (member.type as NumberType | StringType | BooleanType | ArrayType | ObjectType).default = defaultValue
    }

    if (property.kind === ts.SyntaxKind.PropertySignature || property.kind === ts.SyntaxKind.PropertyDeclaration) {
      this.setPropertyJsDoc(property, member, sourceFile)
    }

    if (property.kind === ts.SyntaxKind.MethodSignature || property.kind === ts.SyntaxKind.MethodDeclaration) {
      member.parameters = property.parameters.map((parameter) => this.getParameter(parameter, sourceFile))
    }

    return member
  }

  private getParameter(parameter: ts.ParameterDeclaration, sourceFile: ts.SourceFile) {
    return {
      name: (parameter.name as ts.Identifier).text,
      type: parameter.type ? this.getType(parameter.type, sourceFile) : {
        kind: undefined,
        position: getPosition(parameter, sourceFile)
      },
      optional: !!parameter.questionToken
    } as FunctionParameter
  }

  private setJsDoc(jsDocs: JsDoc[], type: Type, sourceFile: ts.SourceFile) {
    for (const jsDoc of jsDocs) {
      if (jsDoc.name === 'mapValueType') {
        this.setJsDocMapValue(jsDoc, type)
      } else if (jsDoc.name === 'type') {
        this.overrideType(type, jsDoc)
      } else if (type.kind === 'array') {
        this.setJsDocArray(jsDoc, type, sourceFile)
      } else if (type.kind === 'number') {
        this.setJsDocNumber(jsDoc, type)
      } else if (type.kind === 'string') {
        this.setJsDocString(jsDoc, type)
      } else if (type.kind === 'boolean') {
        this.setJsDocBoolean(jsDoc, type)
      } else if (type.kind === 'object') {
        this.setJsDocObject(jsDoc, type)
      } else if (type.kind === 'reference') {
        this.setJsDocReference(jsDoc, type)
      }
    }
  }

  private setPropertyJsDoc(
    property: ts.PropertySignature | ts.PropertyDeclaration,
    member: Member,
    sourceFile: ts.SourceFile
  ) {
    const propertyJsDocs = this.getJsDocs(property, sourceFile)
    for (const propertyJsDoc of propertyJsDocs) {
      if (propertyJsDoc.name === 'tag') {
        this.setJsDocTag(propertyJsDoc, member)
      } else if (propertyJsDoc.name === 'param') {
        this.setJsDocParam(propertyJsDoc, member)
      }
    }
    this.setJsDoc(propertyJsDocs, member.type, sourceFile)
  }

  private setJsDocReference(propertyJsDoc: JsDoc, type: ReferenceType) {
    if (propertyJsDoc.comment) {
      type.default = JSON.parse(this.getJsDocComment(propertyJsDoc.comment))
    }
  }

  private setJsDocTag(propertyJsDoc: JsDoc, member: Member) {
    if (propertyJsDoc.comment) {
      member.tag = +propertyJsDoc.comment
    }
  }

  private setJsDocMapValue(propertyJsDoc: JsDoc, type: Type) {
    if (propertyJsDoc.comment && type.kind === 'map' && type.value.kind === 'number') {
      type.value.type = propertyJsDoc.comment
    }
  }

  private setJsDocParam(propertyJsDoc: JsDoc, member: Member) {
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

  private setJsDocBoolean(propertyJsDoc: JsDoc, type: BooleanType) {
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
    if (comment.length >= 2
      && ((comment.startsWith(`'`) && comment.endsWith(`'`))
        || (comment.startsWith(`"`) && comment.endsWith(`"`))
        || (comment.startsWith('`') && comment.endsWith('`')))) {
      return comment.substring(1, comment.length - 1)
    }
    return comment
  }

  private setJsDocString(propertyJsDoc: JsDoc, type: StringType) {
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

  private setJsDocNumber(propertyJsDoc: JsDoc, type: NumberType) {
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
      } else if (type.kind === 'array' && type.type.kind === 'number') {
        type.type = {
          kind: type.type.kind,
          type: jsDoc.comment,
          position: type.type.position
        }
      }
    }
  }

  private setJsDocArray(jsDoc: JsDoc, type: ArrayType, sourceFile: ts.SourceFile) {
    if (jsDoc.comment) {
      if (jsDoc.name === 'minItems') {
        type.minItems = +jsDoc.comment
      } else if (jsDoc.name === 'maxItems') {
        type.maxItems = +jsDoc.comment
      } else if (jsDoc.name === 'itemType') {
        this.overrideType(type, jsDoc)
      } else if (type.type.kind === 'number') {
        this.setJsDocNumberArray(jsDoc, type.type)
      } else if (type.type.kind === 'string') {
        this.setJsDocStringArray(jsDoc, type.type)
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

  private setJsDocNumberArray(jsDoc: JsDoc, type: NumberType) {
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

  private setJsDocStringArray(jsDoc: JsDoc, type: StringType) {
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

  private setJsDocObject(jsDoc: JsDoc, type: ObjectType) {
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
  comment?: string;
  optional?: boolean;
}

type MembersInfo = {
  members: Member[];
  minProperties: number;
  maxProperties: number;
  additionalProperties?: Type | boolean;
}

type EnumValueType = 'string' | 'number' | 'boolean'
