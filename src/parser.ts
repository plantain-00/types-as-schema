import ts from 'typescript'
import { getJsDocs as utilGetJsDocs } from './js-doc'
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
  UnionDeclaration,
  ObjectDeclaration,
  ArrayDeclaration,
  Expression,
  warn,
  FunctionDeclaration,
  FunctionParameter, EnumType, Decorator, TemplateLiteralPart, JsDoc, JsDocAndComment, Modifier
} from './utils'

export class Parser {
  private declarations: TypeDeclaration[] = []
  disableWarning = false
  constructor(private sourceFiles: ts.SourceFile[], private getRelativePath: (fileName: string) => string, private checker?: ts.TypeChecker) { }

  parse() {
    for (const sourceFile of this.sourceFiles) {
      ts.forEachChild(sourceFile, node => {
        if (ts.isEnumDeclaration(node)) {
          this.preHandleEnumDeclaration(node, sourceFile, '')
        } else if (ts.isModuleDeclaration(node) && node.body && ts.isModuleBlock(node.body)) {
          for (const statement of node.body.statements) {
            if (ts.isEnumDeclaration(statement)) {
              this.preHandleEnumDeclaration(statement, sourceFile, node.name.text + '.')
            }
          }
        }
      })
    }

    for (const sourceFile of this.sourceFiles) {
      ts.forEachChild(sourceFile, node => {
        this.handleSourceFile(node, sourceFile, '')
      })
    }

    return this.declarations
  }

  private preHandleEnumDeclaration(declaration: ts.EnumDeclaration, sourceFile: ts.SourceFile, namespace: string) {
    const members = declaration.members
    if (members.length > 0) {
      const firstMember = members[0]
      if (firstMember?.initializer) {
        this.handleEnumDeclarationInitializer(declaration, members, firstMember.initializer, sourceFile, namespace)
      } else {
        const enumType: EnumDeclaration = {
          kind: 'enum',
          name: namespace + declaration.name.text,
          type: 'uint32',
          members: [],
          position: this.getPosition(declaration, sourceFile),
          modifiers: this.getModifiers(declaration),
        }
        let lastIndex = 0
        for (const member of members) {
          if (member.initializer && ts.isIdentifier(member.name)) {
            const { name, value } = this.getExpression(member.initializer, member.name, sourceFile)
            enumType.members.push({
              name,
              value: value as number
            })
            lastIndex = value as number + 1
          } else {
            enumType.members.push({
              name: ts.isIdentifier(member.name) ? member.name.text : '',
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
    sourceFile: ts.SourceFile,
    namespace: string,
  ) {
    const enumType: EnumDeclaration = {
      kind: 'enum',
      name: namespace + declaration.name.text,
      type: ts.isStringLiteral(initializer) ? 'string' : 'uint32',
      members: [],
      position: this.getPosition(declaration, sourceFile),
      modifiers: this.getModifiers(declaration),
    }
    for (const member of members) {
      if (member.initializer && ts.isIdentifier(member.name)) {
        const { name, value } = this.getExpression(member.initializer, member.name, sourceFile)
        if (typeof value === 'number' || typeof value === 'string') {
          enumType.members.push({
            name,
            value: value as string | number
          })
        }
      }
    }
    this.declarations.push(enumType)
  }

  private handleSourceFile(node: ts.Node, sourceFile: ts.SourceFile, namespace: string) {
    const jsDocs = this.getJsDocs(node, sourceFile)
    if (ts.isTypeAliasDeclaration(node)) {
      this.handleTypeAliasDeclaration(node, jsDocs, sourceFile, namespace)
    } else if (ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node)) {
      this.handleInterfaceOrClassDeclaration(node, jsDocs, sourceFile, namespace)
    } else if (ts.isFunctionDeclaration(node)) {
      this.handleFunctionDeclaration(node, jsDocs, sourceFile, namespace)
    } else if (ts.isExportAssignment(node)) {
      if (ts.isArrowFunction(node.expression)) {
        this.handleFunctionDeclaration(node.expression, jsDocs, sourceFile, namespace, node)
      }
    } else if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0]
      if (declaration?.initializer) {
        const typeArguments = declaration.type && ts.isTypeReferenceNode(declaration.type) && declaration.type.typeArguments
          ? declaration.type.typeArguments.map((t) => this.getType(t, sourceFile))
          : undefined
        if (ts.isArrowFunction(declaration.initializer)) {
          this.handleFunctionDeclaration(declaration.initializer, jsDocs, sourceFile, namespace, node, ts.isIdentifier(declaration.name) ? declaration.name.text : undefined, typeArguments)
        } else if (ts.isCallExpression(declaration.initializer)) {
          const argument = declaration.initializer.arguments[0]
          if (argument && ts.isArrowFunction(argument)) {
            this.handleFunctionDeclaration(argument, jsDocs, sourceFile, namespace, node, ts.isIdentifier(declaration.name) ? declaration.name.text : undefined, typeArguments)
          }
        } else if (ts.isTaggedTemplateExpression(declaration.initializer)) {
          if (declaration.initializer.typeArguments) {
            this.declarations.push({
              kind: 'unknown',
              name: namespace + (ts.isIdentifier(declaration.name) ? declaration.name.text : ''),
              position: this.getPosition(declaration, sourceFile),
              modifiers: this.getModifiers(declaration),
              ...jsDocs,
              typeArguments: declaration.initializer.typeArguments.map((t) => this.getType(t, sourceFile)),
            })
          }
        }
      }
    } else if (ts.isModuleDeclaration(node) && node.body && ts.isModuleBlock(node.body)) {
      for (const statement of node.body.statements) {
        this.handleSourceFile(statement, sourceFile, namespace + node.name.text + '.')
      }
    }
  }

  private handleFunctionDeclaration(
    declaration: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionTypeNode,
    { jsDocs, comments }: JsDocAndComment,
    sourceFile: ts.SourceFile,
    namespace: string,
    parent?: ts.Node,
    functionName?: string,
    typeArguments?: Type[],
  ) {
    const type = declaration.type
      ? this.getType(declaration.type, sourceFile)
      : {
        kind: undefined,
        position: this.getPosition(declaration, sourceFile)
      }
    const typeParameters = declaration.typeParameters
      ? declaration.typeParameters.map((t) => ({
        name: t.name.text,
        constraint: t.constraint ? this.getType(t.constraint, sourceFile) : undefined,
      }))
      : undefined
    const functionDeclaration: FunctionDeclaration = {
      kind: 'function',
      name: namespace + (functionName ?? (declaration.name && !ts.isFunctionTypeNode(declaration) ? declaration.name.text : '')),
      type,
      optional: ts.isFunctionTypeNode(declaration) ? false : !!declaration.questionToken,
      parameters: declaration.parameters.map((parameter) => this.handleFunctionParameter(parameter, sourceFile)),
      comments,
      jsDocs,
      position: this.getPosition(declaration, sourceFile),
      body: ts.isFunctionTypeNode(declaration) ? undefined : declaration.body?.getText(sourceFile),
      modifiers: this.getModifiers(parent ?? declaration),
      typeArguments,
      typeParameters,
    }
    for (const jsDoc of jsDocs || []) {
      if (jsDoc.comment) {
        if (jsDoc.name === 'method') {
          functionDeclaration.method = jsDoc.comment
        } else if (jsDoc.name === 'path') {
          functionDeclaration.path = jsDoc.comment
        } else if (jsDoc.name === 'description') {
          functionDeclaration.description = jsDoc.comment
        } else if (jsDoc.name === 'summary') {
          functionDeclaration.summary = jsDoc.comment
        } else if (jsDoc.name === 'tags') {
          functionDeclaration.tags = jsDoc.comment.split(',')
        }
      } else if (jsDoc.name === 'deprecated') {
        functionDeclaration.deprecated = true
      }
    }
    this.declarations.push(functionDeclaration)
  }

  private handleFunctionParameter(parameter: ts.ParameterDeclaration, sourceFile: ts.SourceFile) {
    const parameterDoc = this.getParameter(parameter, sourceFile)
    const { jsDocs, comments } = this.getJsDocs(parameter, sourceFile)
    parameterDoc.comments = comments
    parameterDoc.jsDocs = jsDocs
    for (const jsDoc of jsDocs || []) {
      if (jsDoc.comment && jsDoc.name === 'in') {
        parameterDoc.in = jsDoc.comment
      } else {
        this.setJsDoc(jsDoc, parameterDoc.type)
      }
    }
    if (parameterDoc.type.default !== undefined) {
      parameterDoc.optional = true
    }
    return parameterDoc
  }

  private handleInterfaceOrClassDeclaration(
    declaration: ts.InterfaceDeclaration | ts.ClassDeclaration,
    { jsDocs, comments }: JsDocAndComment,
    sourceFile: ts.SourceFile,
    namespace: string,
  ) {
    if (declaration.name) {
      const declarationName = declaration.name.text
      // if the node is pre-handled, then it should be in `declarations` already, so don't continue
      if (this.declarations.some(m => m.name === declarationName)) {
        return
      }
    }

    const objectMembers = this.getObjectMembers(declaration.members, sourceFile)
    const members = objectMembers.members
    let minProperties = objectMembers.minProperties
    let maxProperties = objectMembers.maxProperties
    let additionalProperties = objectMembers.additionalProperties

    const heritageClauses = this.handleHeritageClauses(
      declaration,
      members,
      minProperties,
      maxProperties
    )
    minProperties = heritageClauses.minProperties
    maxProperties = heritageClauses.maxProperties
    if (heritageClauses.additionalProperties) {
      additionalProperties = heritageClauses.additionalProperties
    }

    const objectDeclaration: ObjectDeclaration = {
      kind: 'object',
      name: namespace + (declaration.name ? declaration.name.text : ''),
      members,
      minProperties,
      maxProperties: additionalProperties === undefined ? maxProperties : undefined,
      additionalProperties,
      entry: jsDocs?.find((f) => f.name === 'entry')?.comment,
      position: this.getPosition(declaration, sourceFile),
      comments,
      jsDocs,
      decorators: ts.isClassDeclaration(declaration) ? this.getDecorators(sourceFile, declaration.decorators) : undefined,
      modifiers: this.getModifiers(declaration),
    }

    for (const jsDoc of jsDocs || []) {
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
        if (ts.isHeritageClause(clause)) {
          for (const type of clause.types) {
            if (ts.isExpressionWithTypeArguments(type) && ts.isIdentifier(type.expression)) {
              ({ minProperties, maxProperties, additionalProperties } = this.handleExpressionWithTypeArguments(
                type.expression,
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
    jsDocs: JsDocAndComment,
    sourceFile: ts.SourceFile,
    namespace: string,
  ) {
    if (ts.isArrayTypeNode(declaration.type)) {
      this.handleArrayTypeInTypeAliasDeclaration(
        declaration.type,
        declaration.name,
        jsDocs,
        sourceFile,
        namespace,
      )
    } else if (ts.isTypeLiteralNode(declaration.type)
      || ts.isUnionTypeNode(declaration.type)
      || ts.isIntersectionTypeNode(declaration.type)) {
      this.handleTypeLiteralOrUnionTypeOrIntersectionType(
        declaration.type,
        declaration.name,
        jsDocs,
        sourceFile,
        namespace,
      )
    } else if (
      ts.isTypeReferenceNode(declaration.type) &&
      ts.isIdentifier(declaration.type.typeName) &&
      declaration.type.typeArguments &&
      declaration.type.typeArguments.length > 0
    ) {
        if (this.checker) {
          const type = this.getTypeOfComplexType(declaration.type, sourceFile)
          if (type) {
            this.declarations.push({
              name: namespace + declaration.name.text,
              ...type,
              modifiers: this.getModifiers(declaration),
            })
            return
          } else if (!this.disableWarning) {
            warn(this.getPosition(declaration, sourceFile), 'parse')
          }
        } else if (declaration.type.typeName.text === 'Pick') {
          const type = this.getTypeOfPick(declaration.type.typeName, declaration.type.typeArguments, sourceFile)
          if (type) {
            this.declarations.push({
              name: namespace + declaration.name.text,
              ...type,
              modifiers: this.getModifiers(declaration),
            })
            return
          }
        } else if (!this.disableWarning) {
          warn(this.getPosition(declaration, sourceFile), 'parse')
        }
    } else if (ts.isTemplateLiteralTypeNode(declaration.type)) {
      const spans = this.getTemplateSpans(declaration.type, sourceFile)
      if (spans.every((s) => s.kind === 'enum')) {
        this.declarations.push({
          kind: 'string',
          name: namespace + declaration.name.text,
          enums: this.getTemplateLiteralTypeEnums(declaration.type, spans),
          position: this.getPosition(declaration.name, sourceFile),
          modifiers: this.getModifiers(declaration),
        })
      } else if (spans.every((s) => s.kind === 'enum' || s.kind === 'string' || s.kind === 'number' || s.kind === 'boolean')) {
        this.declarations.push({
          kind: 'string',
          name: namespace + declaration.name.text,
          templateLiteral: this.getTemplateLiteral(declaration.type, spans),
          position: this.getPosition(declaration.type, sourceFile),
          modifiers: this.getModifiers(declaration),
        })
      }
    } else if (ts.isFunctionTypeNode(declaration.type)) {
      this.handleFunctionDeclaration(declaration.type, jsDocs, sourceFile, namespace, declaration, ts.isIdentifier(declaration.name) ? declaration.name.text : undefined)
    } else {
      const type = this.getType(declaration.type, sourceFile)
      const declarationName = declaration.name && !ts.isFunctionTypeNode(declaration) ? declaration.name.text : ''
      if (type.kind === 'reference') {
        this.declarations.push({
          name: namespace + declarationName,
          ...type,
          ...jsDocs,
          modifiers: this.getModifiers(declaration),
        })
      } else if (type.kind === 'enum') {
        this.declarations.push({
          members: type.enums.map((e) => ({
            name: e as string,
            value: e as string | number,
          })),
          ...type,
          ...jsDocs,
          name: namespace + declarationName,
          modifiers: this.getModifiers(declaration),
        })
      } else if (
        type.kind !== undefined &&
        type.kind !== 'file' &&
        type.kind !== 'void'
      ) {
        this.declarations.push({
          ...type,
          ...jsDocs,
          name: namespace + declarationName,
          modifiers: this.getModifiers(declaration),
        })
      }
    }
  }

  private handleTypeLiteralOrUnionTypeOrIntersectionType(
    declarationType: ts.TypeLiteralNode | ts.UnionOrIntersectionTypeNode,
    declarationName: ts.Identifier,
    { jsDocs, comments }: JsDocAndComment,
    sourceFile: ts.SourceFile,
    namespace: string,
  ) {
    let unionDeclaration: UnionDeclaration | undefined
    if (ts.isUnionTypeNode(declarationType)) {
      if (declarationType.types.every(u => ts.isLiteralTypeNode(u) || u.kind === ts.SyntaxKind.NullKeyword)) {
        this.handleUnionTypeOfLiteralType(declarationType, declarationName, sourceFile, namespace)
        return
      }
      if (declarationType.types.every(u => ts.isTypeReferenceNode(u))) {
        unionDeclaration = {
          kind: 'union',
          name: namespace + declarationName.text,
          members: declarationType.types.map(u => this.getType(u, sourceFile)),
          entry: jsDocs?.find((f) => f.name === 'entry')?.comment,
          position: this.getPosition(declarationName, sourceFile),
          comments,
          jsDocs,
          modifiers: this.getModifiers(declarationType),
        }
        this.declarations.push(unionDeclaration)
      }
    }
    const { members, minProperties, maxProperties, additionalProperties } = this.getMembersInfo(declarationType, sourceFile)
    const objectDeclaration: ObjectDeclaration = {
      kind: 'object',
      name: namespace + declarationName.text,
      members,
      minProperties,
      maxProperties: additionalProperties === undefined ? maxProperties : undefined,
      additionalProperties,
      entry: jsDocs?.find((f) => f.name === 'entry')?.comment,
      position: this.getPosition(declarationName, sourceFile),
      comments,
      jsDocs,
      modifiers: this.getModifiers(declarationType),
    }
    for (const jsDoc of jsDocs || []) {
      this.setJsDocObject(jsDoc, objectDeclaration)
    }
    if (unionDeclaration) {
      unionDeclaration.objectType = objectDeclaration
    } else {
      this.declarations.push(objectDeclaration)
    }
  }

  private handleUnionTypeOfLiteralType(unionType: ts.UnionTypeNode, declarationName: ts.Identifier, sourceFile: ts.SourceFile, namespace: string) {
    let enumType: EnumValueType | undefined
    const enums: unknown[] = []
    for (const childType of unionType.types) {
      if (ts.isLiteralTypeNode(childType)) {
        const { type, value } = this.getEnumOfLiteralType(childType)
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
          name: namespace + declarationName.text,
          enums: enums as string[],
          position: this.getPosition(declarationName, sourceFile),
          modifiers: this.getModifiers(unionType),
        }
        this.declarations.push(stringDeclaration)
      } else if (enumType === 'number') {
        const numberDeclaration: NumberDeclaration = {
          kind: 'number',
          type: enumType,
          name: namespace + declarationName.text,
          enums: enums as string[],
          position: this.getPosition(declarationName, sourceFile),
          modifiers: this.getModifiers(unionType),
        }
        this.declarations.push(numberDeclaration)
      } else if (enumType === 'boolean') {
        const unionDeclaration: UnionDeclaration = {
          kind: 'union',
          name: namespace + declarationName.text,
          members: unionType.types.map(e => this.getType(e, sourceFile)),
          entry: undefined,
          position: this.getPosition(declarationName, sourceFile),
          modifiers: this.getModifiers(unionType),
        }
        this.declarations.push(unionDeclaration)
      }
    }
  }

  private handleArrayTypeInTypeAliasDeclaration(
    arrayType: ts.ArrayTypeNode,
    declarationName: ts.Identifier,
    { jsDocs, comments }: JsDocAndComment,
    sourceFile: ts.SourceFile,
    namespace: string,
  ) {
    const type = this.getType(arrayType.elementType, sourceFile)
    const arrayDeclaration: ArrayDeclaration = {
      kind: 'array',
      name: namespace + declarationName.text,
      type,
      entry: jsDocs?.find((f) => f.name === 'entry')?.comment,
      position: this.getPosition(declarationName, sourceFile),
      comments,
      jsDocs,
      modifiers: this.getModifiers(arrayType),
    }
    for (const jsDoc of jsDocs || []) {
      this.setJsDocArray(jsDoc, arrayDeclaration)
    }
    this.declarations.push(arrayDeclaration)
  }

  private getJsDocs(node: ts.Node, sourceFile: ts.SourceFile): JsDocAndComment {
    const ranges = ts.getLeadingCommentRanges(sourceFile.text, node.getFullStart())
    const comments = ranges ? ranges.map((r) => sourceFile.text.slice(r.pos, r.end)) : undefined
    const jsDocs = utilGetJsDocs(node)
    const result: JsDoc[] = []
    for (const jsDoc of jsDocs) {
      result.push({
        ...jsDoc,
        type: jsDoc.type ? this.getType(jsDoc.type, sourceFile) : undefined
      })
    }
    return { jsDocs: result.length === 0 ? undefined : result, comments }
  }

  private getType(type: ts.TypeNode | ts.TemplateLiteralLikeNode, sourceFile: ts.SourceFile): Type {
    if (type.kind === ts.SyntaxKind.StringKeyword) {
      return {
        kind: 'string',
        position: this.getPosition(type, sourceFile)
      }
    }
    if (type.kind === ts.SyntaxKind.NumberKeyword) {
      return {
        kind: 'number',
        type: 'number',
        position: this.getPosition(type, sourceFile)
      }
    }
    if (type.kind === ts.SyntaxKind.BooleanKeyword) {
      return {
        kind: 'boolean',
        position: this.getPosition(type, sourceFile)
      }
    }
    if (type.kind === ts.SyntaxKind.VoidKeyword) {
      return {
        kind: 'void',
        position: this.getPosition(type, sourceFile)
      }
    }
    if (ts.isTypeLiteralNode(type)) {
      return this.getTypeOfTypeLiteral(type, sourceFile)
    }
    if (ts.isArrayTypeNode(type)) {
      const elementType = this.getType(type.elementType, sourceFile)
      return {
        kind: 'array',
        type: elementType,
        position: this.getPosition(type, sourceFile)
      }
    }
    if (ts.isTypeReferenceNode(type)) {
      return this.getTypeOfTypeReference(type, sourceFile)
    }
    if (ts.isUnionTypeNode(type) || ts.isIntersectionTypeNode(type)) {
      return this.getTypeOfUnionTypeOrIntersectionType(type, sourceFile)
    }
    if (ts.isLiteralTypeNode(type)) {
      if (type.literal.kind === ts.SyntaxKind.NullKeyword) {
        return {
          kind: 'null',
          position: this.getPosition(type, sourceFile)
        }
      }
      return this.getTypeOfLiteralType(type, sourceFile)
    }
    if (type.kind === ts.SyntaxKind.NullKeyword) {
      return {
        kind: 'null',
        position: this.getPosition(type, sourceFile)
      }
    }
    if (ts.isTupleTypeNode(type)) {
      let arrayType: Type | undefined
      const elementsType = type.elements || (type as { elementTypes?: ts.NodeArray<ts.Node> }).elementTypes
      for (const elementType of elementsType) {
        arrayType = this.getType(elementType, sourceFile)
      }
      if (arrayType) {
        return {
          kind: 'array',
          type: arrayType,
          minItems: elementsType.length,
          maxItems: elementsType.length,
          position: this.getPosition(type, sourceFile)
        }
      }
    }
    if (ts.isTemplateLiteralTypeNode(type)) {
      const spans = this.getTemplateSpans(type, sourceFile)
      if (spans.every((s) => s.kind === 'enum')) {
        return {
          kind: 'enum',
          type: 'string',
          name: 'string',
          enums: this.getTemplateLiteralTypeEnums(type, spans),
          position: this.getPosition(type, sourceFile)
        }
      } else if (spans.every((s) => s.kind === 'enum' || s.kind === 'string' || s.kind === 'number' || s.kind === 'boolean')) {
        return {
          kind: 'string',
          templateLiteral: this.getTemplateLiteral(type, spans),
          position: this.getPosition(type, sourceFile)
        }
      }
    }
    if (ts.isTemplateMiddleOrTemplateTail(type)) {
      return {
        kind: 'enum',
        type: 'string',
        name: 'string',
        enums: [type.text],
        position: this.getPosition(type, sourceFile),
      }
    }
    if (ts.isParenthesizedTypeNode(type)) {
      return this.getType(type.type, sourceFile)
    }
    if (ts.isTypeOperatorNode(type)) {
      if (type.operator === ts.SyntaxKind.KeyOfKeyword && ts.isTypeReferenceNode(type.type)) {
        const objectType = this.getTypeOfComplexType(type.type, sourceFile)
        if (objectType) {
          return {
            kind: 'enum',
            type: 'string',
            name: 'string',
            enums: objectType.members.map((m) => m.name),
            position: this.getPosition(type, sourceFile),
          }
        }
      }
    }
    if (ts.isFunctionTypeNode(type)) {
      return {
        kind: 'function',
        type: this.getType(type.type, sourceFile),
        parameters: type.parameters.map((parameter) => this.handleFunctionParameter(parameter, sourceFile)),
        position: this.getPosition(type, sourceFile),
      }
    }
    const position = this.getPosition(type, sourceFile)
    if (type.kind !== ts.SyntaxKind.AnyKeyword && !this.disableWarning) {
      warn(position, 'parser')
    }
    return {
      kind: undefined,
      position
    }
  }

  private getTemplateSpans(type: ts.TemplateLiteralTypeNode, sourceFile: ts.SourceFile) {
    const spans: Type[] = []
    for (const span of type.templateSpans) {
      spans.push(
        this.getType(span.type, sourceFile),
        this.getType(span.literal, sourceFile),
      )
    }
    return spans
  }

  private getTemplateLiteralTypeEnums(type: ts.TemplateLiteralTypeNode, spans: Type[]) {
    let parts = [type.head.text]
    for (const t of spans) {
      if (t.kind === 'enum') {
        const newParts: string[] = []
        for (const e of t.enums) {
          newParts.push(...parts.map((p) => p + e))
        }
        parts = newParts
      }
    }
    return parts
  }

  private getTemplateLiteral(type: ts.TemplateLiteralTypeNode, spans: Type[]) {
    const templateLiteral: TemplateLiteralPart[] = []
    if (type.head.text) {
      templateLiteral.push({
        kind: 'enum',
        enums: [type.head.text],
      })
    }
    for (const t of spans) {
      if (t.kind === 'string') {
        templateLiteral.push({
          kind: 'string'
        })
      } else if (t.kind === 'number') {
        templateLiteral.push({
          kind: 'number'
        })
      } else if (t.kind === 'boolean') {
        templateLiteral.push({
          kind: 'boolean'
        })
      } else if (t.kind === 'enum') {
        const enums = (t.enums as string[]).filter((e) => e)
        if (enums.length > 0) {
          templateLiteral.push({
            kind: 'enum',
            enums,
          })
        }
      }
    }
    return templateLiteral
  }

  private getEnumOfLiteralType(literalType: ts.LiteralTypeNode): { type?: EnumValueType, value: unknown } {
    if (ts.isStringLiteral(literalType.literal)) {
      return {
        type: 'string',
        value: literalType.literal.text
      }
    }
    if (ts.isNumericLiteral(literalType.literal)) {
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
    const enums: unknown[] = []
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
        position: this.getPosition(literalType, sourceFile)
      }
    }
    return {
      kind: undefined,
      position: this.getPosition(literalType, sourceFile)
    }
  }

  private getTypeOfUnionTypeOrIntersectionType(unionType: ts.UnionTypeNode | ts.IntersectionTypeNode, sourceFile: ts.SourceFile): Type {
    if (unionType.types.every(u => ts.isLiteralTypeNode(u))) {
      let enumType: EnumValueType | undefined
      const enums: unknown[] = []
      for (const childType of unionType.types) {
        if (ts.isLiteralTypeNode(childType)) {
          const { type, value } = this.getEnumOfLiteralType(childType)
          if (type !== undefined) {
            enumType = type
          }
          if (value !== undefined) {
            enums.push(value)
          }
        }
      }
      if (enumType) {
        return {
          kind: 'enum',
          type: enumType,
          name: enumType,
          enums,
          position: this.getPosition(unionType, sourceFile)
        }
      }
    } else {
      return {
        kind: 'union',
        members: unionType.types.map(u => this.getType(u, sourceFile)),
        position: this.getPosition(unionType, sourceFile)
      }
    }
    return {
      kind: undefined,
      position: this.getPosition(unionType, sourceFile)
    }
  }

  private getTypeOfArrayTypeReference(reference: ts.TypeReferenceNode, sourceFile: ts.SourceFile): ArrayType {
    const typeArgument = reference.typeArguments?.[0]
    if (typeArgument) {
      return {
        kind: 'array',
        type: this.getType(typeArgument, sourceFile),
        position: this.getPosition(typeArgument, sourceFile)
      }
    } else {
      const position = this.getPosition(reference, sourceFile)
      return {
        kind: 'array',
        type: {
          kind: undefined,
          position
        },
        position
      }
    }
  }

  private getTypeOfTypeReference(reference: ts.TypeReferenceNode, sourceFile: ts.SourceFile): Type {
    if (ts.isIdentifier(reference.typeName)) {
      if (numberTypes.includes(reference.typeName.text)) {
        return {
          kind: 'number',
          type: reference.typeName.text,
          position: this.getPosition(reference.typeName, sourceFile)
        }
      }
      if (reference.typeName.text === 'File') {
        return {
          kind: 'file',
          position: this.getPosition(reference.typeName, sourceFile)
        }
      }
      if (reference.typeName.text === 'Array' || reference.typeName.text === 'ReadonlyArray') {
        return this.getTypeOfArrayTypeReference(reference, sourceFile)
      }
      const typeArgument = reference.typeArguments?.[0]
      if (typeArgument) {
        if ((reference.typeName.text === 'Promise'
          || reference.typeName.text === 'ReturnType'
          || reference.typeName.text === 'DeepReturnType')) {
          return this.getType(typeArgument, sourceFile)
        } else if (this.checker && !['Map', 'Set', 'WeakMap', 'WeakSet'].includes(reference.typeName.text)) {
          const type = this.getTypeOfComplexType(reference, sourceFile)
          if (type) {
            return type
          }
        } else if (reference.typeName.text === 'Pick') {
          const type = this.getTypeOfPick(reference.typeName, reference.typeArguments, sourceFile)
          if (type) {
            return type
          }
        }
      }
      return {
        kind: 'reference',
        referenceName: reference.getText(sourceFile),
        position: this.getPosition(reference, sourceFile)
      }
    }
    if (ts.isQualifiedName(reference.typeName) && ts.isIdentifier(reference.typeName.left)) {
      const enumName = reference.typeName.left.text
      const enumDeclaration = this.declarations.find((m): m is EnumDeclaration => m.kind === 'enum' && m.name === enumName)
      if (enumDeclaration) {
        return {
          kind: 'enum',
          name: enumDeclaration.name,
          type: enumDeclaration.type,
          enums: enumDeclaration.members.map(m => m.value),
          position: this.getPosition(reference.typeName, sourceFile)
        }
      }
    }
    return {
      kind: 'reference',
      referenceName: reference.typeName.getText(sourceFile),
      position: this.getPosition(reference.typeName, sourceFile)
    }
  }

  private getTypeOfTsType(
    type: ts.Type,
    typeNode: ts.Node,
    sourceFile: ts.SourceFile,
    checker: ts.TypeChecker,
  ): Type {
    if (type.flags & ts.TypeFlags.String) {
      return {
        kind: 'string',
        position: this.getPosition(typeNode, sourceFile),
      }
    }
    if (type.flags & ts.TypeFlags.Number) {
      return {
        kind: 'number',
        type: 'number',
        position: this.getPosition(typeNode, sourceFile),
      }
    }
    if (type.flags & ts.TypeFlags.Boolean) {
      return {
        kind: 'boolean',
        position: this.getPosition(typeNode, sourceFile),
      }
    }
    if (type.flags & ts.TypeFlags.Void) {
      return {
        kind: 'void',
        position: this.getPosition(typeNode, sourceFile),
      }
    }
    if (type.flags & ts.TypeFlags.Null) {
      return {
        kind: 'null',
        position: this.getPosition(typeNode, sourceFile),
      }
    }
    const name = checker.typeToString(type)
    if (name === 'File') {
      return {
        kind: 'file',
        position: this.getPosition(typeNode, sourceFile)
      }
    }
    return {
      kind: 'reference',
      referenceName: name,
      position: this.getPosition(typeNode, sourceFile),
    }
  }

  private getTypeOfPick(
    typeName: ts.Identifier,
    typeArguments: ts.NodeArray<ts.TypeNode>,
    sourceFile: ts.SourceFile
  ): ObjectType | undefined {
    const argument = typeArguments[0]
    if (argument && ts.isTypeReferenceNode(argument) && ts.isIdentifier(argument.typeName)) {
      const declarationName = argument.typeName.escapedText.toString()
      this.preHandleType(declarationName)
      const declaration = this.declarations.find(m => m.kind === 'object' && m.name === declarationName)
      const field = typeArguments[1]
      if (declaration && declaration.kind === 'object' && field) {
        const memberNames: string[] = []
        if (ts.isLiteralTypeNode(field)) {
          if (ts.isStringLiteral(field.literal)) {
            memberNames.push(field.literal.text)
          }
        } else if (ts.isUnionTypeNode(field)) {
          for (const type of field.types) {
            if (ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal)) {
              memberNames.push(type.literal.text)
            }
          }
        } else {
          if (!this.disableWarning) {
            warn(this.getPosition(typeName, sourceFile), 'parser')
          }
          return undefined
        }
        const members: Member[] = []
        let minProperties = 0
        let maxProperties = 0
        for (const member of declaration.members) {
          if (memberNames.includes(member.name)) {
            maxProperties++
            if (!member.optional) {
              minProperties++
            }
            members.push(member)
          }
        }
        return {
          kind: 'object',
          members,
          minProperties,
          maxProperties,
          position: this.getPosition(typeName, sourceFile)
        }
      }
    }
    return undefined
  }

  private getTypeOfComplexType(
    referenceNode: ts.TypeReferenceNode,
    sourceFile: ts.SourceFile
  ): ObjectType | undefined {
    if (!this.checker) {
      return undefined
    }
    const type = this.checker.getTypeAtLocation(referenceNode)
    if (type.flags & ts.TypeFlags.Object) {
      const members: Member[] = []
      let minProperties = 0
      let maxProperties = 0
      for (const property of type.getProperties()) {
        const memberType = this.checker.getTypeOfSymbolAtLocation(property, referenceNode)
        maxProperties++
        if (!(property.flags & ts.SymbolFlags.Optional)) {
          minProperties++
        }
        members.push({
          name: property.getName(),
          type: this.getTypeOfTsType(memberType, referenceNode.typeName, sourceFile, this.checker),
        })
      }
      return {
        kind: 'object',
        members,
        minProperties,
        maxProperties,
        position: this.getPosition(referenceNode.typeName, sourceFile)
      }
    }
    return undefined
  }

  private getTypeOfTypeLiteral(literal: ts.TypeLiteralNode, sourceFile: ts.SourceFile): Type {
    const member = literal.members[0]
    if (member && ts.isIndexSignatureDeclaration(member)) {
      if (ts.isIndexSignatureDeclaration(member) && member.parameters.length === 1) {
        const parameterType = member.parameters[0]?.type
        if (parameterType && member.type) {
          return {
            kind: 'map',
            key: this.getType(parameterType, sourceFile),
            value: this.getType(member.type, sourceFile),
            position: this.getPosition(parameterType, sourceFile)
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
        position: this.getPosition(literal, sourceFile)
      }
    }
    return {
      kind: undefined,
      position: this.getPosition(literal, sourceFile)
    }
  }

  private getDecorators(sourceFile: ts.SourceFile, decorators?: ts.NodeArray<ts.Decorator>) {
    if (!decorators) {
      return undefined
    }
    const result: Decorator[] = []
    for (const decorator of decorators) {
      if (ts.isCallExpression(decorator.expression) && ts.isIdentifier(decorator.expression.expression)) {
        result.push({
          name: decorator.expression.expression.escapedText.toString(),
          parameters: decorator.expression.arguments.map((a) => this.getTypeAndValueOfExpression(a, sourceFile).value)
        })
      }
    }
    return result
  }

  private getMembersInfo(node: ts.TypeNode, sourceFile: ts.SourceFile): MembersInfo {
    if (ts.isTypeLiteralNode(node)) {
      return this.getObjectMembers(node.members, sourceFile)
    }
    if (ts.isUnionTypeNode(node)) {
      return this.getMembersInfoOfUnionType(node, sourceFile)
    }
    if (ts.isIntersectionTypeNode(node)) {
      return this.getMembersInfoOfIntersectionType(node, sourceFile)
    }
    if (ts.isParenthesizedTypeNode(node)) {
      return this.getMembersInfoOfParenthesizedType(node, sourceFile)
    }
    if (ts.isTypeReferenceNode(node)) {
      return this.getMembersInfoOfTypeReference(node)
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
    const referenceName = ts.isIdentifier(node.typeName) ? node.typeName.text : ''
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
        if (ts.isInterfaceDeclaration(node)) {
          if (node.name.text === typeName) {
            findIt = true
            this.handleSourceFile(node, sourceFile, '')
          }
        } else if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
          findIt = true
          this.handleSourceFile(node, sourceFile, '')
        }
      })
    }
  }

  private getObjectMembers(elements: ts.NodeArray<ts.TypeElement | ts.ClassElement>, sourceFile: ts.SourceFile): MembersInfo {
    const members: Member[] = []
    let minProperties = 0
    let maxProperties = 0
    let additionalProperties: Type | undefined | boolean
    for (const element of elements) {
      if (ts.isPropertySignature(element) || ts.isPropertyDeclaration(element)) {
        const member = this.getObjectMemberOfPropertyOrMethodOrConstructorParameterOrCallSignature(element, sourceFile)
        members.push(member)
        if (!element.questionToken) {
          minProperties++
        }
        maxProperties++
      } else if (ts.isIndexSignatureDeclaration(element)) {
        if (element.type) {
          additionalProperties = this.getType(element.type, sourceFile)
        }
      } else if (ts.isMethodSignature(element) || ts.isMethodDeclaration(element) || ts.isCallSignatureDeclaration(element)) {
        const member = this.getObjectMemberOfPropertyOrMethodOrConstructorParameterOrCallSignature(element, sourceFile)
        members.push(member)
      } else if (ts.isConstructorDeclaration(element)) {
        for (const parameter of element.parameters) {
          if (parameter.modifiers
            && parameter.modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.PublicKeyword
              || modifier.kind === ts.SyntaxKind.PrivateKeyword
              || modifier.kind === ts.SyntaxKind.ProtectedKeyword)) {
            const member = this.getObjectMemberOfPropertyOrMethodOrConstructorParameterOrCallSignature(parameter, sourceFile)
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

  private getTypeAndValueOfExpression(expression: ts.Expression, sourceFile: ts.SourceFile): { type: Type, value: unknown } {
    if (ts.isStringLiteral(expression)) {
      return {
        type: {
          kind: 'string',
          position: this.getPosition(expression, sourceFile)
        },
        value: expression.text
      }
    }
    if (ts.isNumericLiteral(expression)) {
      return {
        type: {
          kind: 'number',
          type: 'number',
          position: this.getPosition(expression, sourceFile)
        },
        value: +expression.text
      }
    }
    if (expression.kind === ts.SyntaxKind.FalseKeyword || expression.kind === ts.SyntaxKind.TrueKeyword) {
      return {
        type: {
          kind: 'boolean',
          position: this.getPosition(expression, sourceFile)
        },
        value: expression.kind === ts.SyntaxKind.TrueKeyword
      }
    } else if (ts.isArrayLiteralExpression(expression)) {
      let elementsType: Type = {
        kind: undefined,
        position: this.getPosition(expression, sourceFile)
      }
      const elementsValues: unknown[] = []
      for (const element of expression.elements) {
        const { type, value } = this.getTypeAndValueOfExpression(element, sourceFile)
        elementsType = type
        elementsValues.push(value)
      }
      return {
        type: {
          kind: 'array',
          type: elementsType,
          position: this.getPosition(expression, sourceFile)
        },
        value: elementsValues
      }
    } else if (ts.isObjectLiteralExpression(expression)) {
      const members: Member[] = []
      const value: { [name: string]: unknown } = {}
      for (const property of expression.properties) {
        if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name)) {
          const expression = this.getExpression(property.initializer, property.name, sourceFile)
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
          position: this.getPosition(expression, sourceFile)
        },
        value
      }
    } else if (ts.isIdentifier(expression)) {
      return {
        type: {
          kind: 'reference',
          referenceName: expression.escapedText.toString(),
          position: this.getPosition(expression, sourceFile)
        },
        value: expression.escapedText.toString(),
      }
    }
    return {
      type: {
        kind: undefined,
        position: this.getPosition(expression, sourceFile)
      },
      value: undefined
    }
  }

  private getObjectMemberOfPropertyOrMethodOrConstructorParameterOrCallSignature(
    property: ts.PropertySignature | ts.PropertyDeclaration | ts.MethodSignature | ts.MethodDeclaration | ts.ParameterDeclaration | ts.CallSignatureDeclaration,
    sourceFile: ts.SourceFile
  ) {
    const member: Member = {
      name: !ts.isCallSignatureDeclaration(property) && ts.isIdentifier(property.name) ? property.name.text : '',
      type: {
        kind: undefined,
        position: this.getPosition(property, sourceFile)
      },
      decorators: this.getDecorators(sourceFile, property.decorators),
    }

    if (property.questionToken) {
      member.optional = true
    }

    let defaultValue: unknown
    if ((ts.isPropertySignature(property) || ts.isPropertyDeclaration(property))
      && property.initializer) {
      const { type, value } = this.getTypeAndValueOfExpression(property.initializer, sourceFile)
      member.type = type
      defaultValue = value
    }

    if (property.type) {
      member.type = this.getType(property.type, sourceFile)
    }

    if (defaultValue !== undefined) {
      member.type.default = defaultValue
    }

    if (ts.isPropertySignature(property) || ts.isPropertyDeclaration(property)) {
      this.setPropertyJsDoc(property, member, sourceFile)
    }

    if (ts.isMethodSignature(property) || ts.isMethodDeclaration(property) || ts.isCallSignatureDeclaration(property)) {
      const { jsDocs, comments } = this.getJsDocs(property, sourceFile)
      member.comments = comments
      member.jsDocs = jsDocs
      member.parameters = property.parameters.map((parameter) => this.handleFunctionParameter(parameter, sourceFile))
    }

    return member
  }

  private getParameter(parameter: ts.ParameterDeclaration, sourceFile: ts.SourceFile): FunctionParameter {
    let type: Type | undefined
    let value: unknown
    if (parameter.initializer) {
      const typeAndValue = this.getTypeAndValueOfExpression(parameter.initializer, sourceFile)
      type = typeAndValue.type
      value = typeAndValue.value
    }
    if (parameter.type) {
      type = this.getType(parameter.type, sourceFile)
    }
    if (!type) {
      type = {
        kind: undefined,
        position: this.getPosition(parameter, sourceFile)
      }
    }
    type.default = value

    return {
      name: ts.isIdentifier(parameter.name) ? parameter.name.text : '',
      type,
      optional: !!parameter.questionToken || type.default !== undefined,
      decorators: this.getDecorators(sourceFile, parameter.decorators),
    }
  }

  private setJsDoc(jsDoc: JsDoc, type: Type) {
    if (jsDoc.name === 'mapValueType') {
      this.setJsDocMapValue(jsDoc, type)
    } else if (jsDoc.name === 'type') {
      this.overrideType(type, jsDoc)
    } else if (type.kind === 'array') {
      this.setJsDocArray(jsDoc, type)
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
    } else if (type.kind === 'enum') {
      this.setJsDocEnum(jsDoc, type)
    }
  }

  private setPropertyJsDoc(
    property: ts.PropertySignature | ts.PropertyDeclaration,
    member: Member,
    sourceFile: ts.SourceFile
  ) {
    const { jsDocs, comments } = this.getJsDocs(property, sourceFile)
    member.comments = comments
    member.jsDocs = jsDocs
    for (const propertyJsDoc of jsDocs || []) {
      if (propertyJsDoc.name === 'tag') {
        this.setJsDocTag(propertyJsDoc, member)
      } else if (propertyJsDoc.name === 'param') {
        this.setJsDocParam(propertyJsDoc, member)
      } else if (propertyJsDoc.name === 'index') {
        member.index = true
      } else if (propertyJsDoc.name === 'unique') {
        member.unique = true
      } else if (propertyJsDoc.name === 'sparse') {
        member.sparse = true
      } else if (propertyJsDoc.name === 'select') {
        member.select = true
      } else if (propertyJsDoc.name === 'alias') {
        if (propertyJsDoc.comment) {
          member.alias = propertyJsDoc.comment
        }
      } else {
        this.setJsDoc(propertyJsDoc, member.type)
      }
    }
  }

  private setJsDocReference(propertyJsDoc: JsDoc, type: ReferenceType) {
    if (propertyJsDoc.comment) {
      try {
        type.default = JSON.parse(this.getJsDocComment(propertyJsDoc.comment))
      } catch (error: unknown) {
        if (!this.disableWarning) {
          warn(type.position, 'parser')
        }
      }
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

  private setJsDocEnum(propertyJsDoc: JsDoc, type: EnumType) {
    if (propertyJsDoc.comment) {
      if (propertyJsDoc.name === 'default') {
        type.default = this.getJsDocComment(propertyJsDoc.comment)
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
    if (propertyJsDoc.name === 'lowercase') {
      type.lowercase = true
    } else if (propertyJsDoc.name === 'uppercase') {
      type.uppercase = true
    } else if (propertyJsDoc.name === 'trim') {
      type.trim = true
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

  private setJsDocArray(jsDoc: JsDoc, type: ArrayType) {
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
      } else if (jsDoc.name === 'title') {
        type.title = jsDoc.comment
      } else if (jsDoc.name === 'description') {
        type.description = jsDoc.comment
      }
    } else if (jsDoc.name === 'uniqueItems') {
      type.uniqueItems = true
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

  private getPosition(typeNode: ts.Node, sourceFile: ts.SourceFile) {
    return {
      file: this.getRelativePath(sourceFile.fileName),
      ...ts.getLineAndCharacterOfPosition(sourceFile, typeNode.getStart(sourceFile))
    }
  }

  private getModifiers(typeNode: ts.Node): Modifier[] | undefined {
    const modifiers: Modifier[] = []
    if (typeNode.modifiers) {
      for (const modifier of typeNode.modifiers) {
        if (modifier.kind === ts.SyntaxKind.AbstractKeyword) {
          modifiers.push('abstract')
        }
        if (modifier.kind === ts.SyntaxKind.AsyncKeyword) {
          modifiers.push('async')
        }
        if (modifier.kind === ts.SyntaxKind.ConstKeyword) {
          modifiers.push('const')
        }
        if (modifier.kind === ts.SyntaxKind.DeclareKeyword) {
          modifiers.push('declare')
        }
        if (modifier.kind === ts.SyntaxKind.DefaultKeyword) {
          modifiers.push('default')
        }
        if (modifier.kind === ts.SyntaxKind.ExportKeyword) {
          modifiers.push('export')
        }
        if (modifier.kind === ts.SyntaxKind.PrivateKeyword) {
          modifiers.push('private')
        }
        if (modifier.kind === ts.SyntaxKind.ProtectedKeyword) {
          modifiers.push('protected')
        }
        if (modifier.kind === ts.SyntaxKind.PublicKeyword) {
          modifiers.push('public')
        }
        if (modifier.kind === ts.SyntaxKind.OverrideKeyword) {
          modifiers.push('override')
        }
        if (modifier.kind === ts.SyntaxKind.ReadonlyKeyword) {
          modifiers.push('readonly')
        }
        if (modifier.kind === ts.SyntaxKind.StaticKeyword) {
          modifiers.push('static')
        }
      }
    }
    return modifiers.length > 0 ? modifiers : undefined
  }
}

const numberTypes = ['double', 'float', 'uint32', 'fixed32', 'integer', 'int32', 'sint32', 'sfixed32', 'uint64', 'fixed64', 'int64', 'sint64', 'sfixed64']

interface MembersInfo {
  members: Member[];
  minProperties: number;
  maxProperties: number;
  additionalProperties?: Type | boolean;
}

type EnumValueType = 'string' | 'number' | 'boolean'
