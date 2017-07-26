import * as ts from "typescript";

export class Generator {
    models: Model[] = [];

    constructor(public sourceFile: ts.SourceFile) {
        ts.forEachChild(sourceFile, node => {
            if (node.kind === ts.SyntaxKind.EnumDeclaration) {
                const declaration = node as ts.EnumDeclaration;
                const members = declaration.members;
                if (members.length > 0) {
                    const firstMember = members[0];
                    if (firstMember.initializer) {
                        const enumType: EnumModel = {
                            kind: "enum",
                            name: declaration.name.text,
                            type: firstMember.initializer.kind === ts.SyntaxKind.StringLiteral ? ts.ClassificationTypeNames.stringLiteral : "uint32",
                            members: [],
                        };
                        for (const member of members) {
                            if (member.initializer) {
                                const name = member.name as ts.Identifier;
                                if (member.initializer.kind === ts.SyntaxKind.StringLiteral) {
                                    const initializer = member.initializer as ts.StringLiteral;
                                    enumType.members.push({
                                        name: name.text,
                                        value: initializer.text,
                                    });
                                } else if (member.initializer.kind === ts.SyntaxKind.NumericLiteral) {
                                    const initializer = member.initializer as ts.NumericLiteral;
                                    enumType.members.push({
                                        name: name.text,
                                        value: +initializer.text,
                                    });
                                }
                            }
                        }
                        this.models.push(enumType);
                    } else {
                        const enumType: EnumModel = {
                            kind: "enum",
                            name: declaration.name.text,
                            type: "uint32",
                            members: [],
                        };
                        let lastIndex = 0;
                        for (const member of members) {
                            const name = member.name as ts.Identifier;
                            if (member.initializer && member.initializer.kind === ts.SyntaxKind.NumericLiteral) {
                                const initializer = member.initializer as ts.NumericLiteral;
                                const value = +initializer.text;
                                enumType.members.push({
                                    name: name.text,
                                    value,
                                });
                                lastIndex = value + 1;
                            } else {
                                enumType.members.push({
                                    name: name.text,
                                    value: lastIndex,
                                });
                                lastIndex++;
                            }
                        }
                        this.models.push(enumType);
                    }
                }
            }
        });

        ts.forEachChild(sourceFile, node => {
            this.handleSourceFile(node);
        });
    }

    handleSourceFile(node: ts.Node) {
        const jsDocs = this.getJsDocs(node);
        const entry = jsDocs.find(jsDoc => jsDoc.name === "entry");
        if (node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
            const declaration = node as ts.TypeAliasDeclaration;
            if (declaration.type.kind === ts.SyntaxKind.ArrayType) {
                const arrayType = declaration.type as ts.ArrayTypeNode;
                const uniqueItems = jsDocs.find(jsDoc => jsDoc.name === "uniqueItems");
                const minItems = jsDocs.find(jsDoc => jsDoc.name === "minItems");
                const maxItems = jsDocs.find(jsDoc => jsDoc.name === "maxItems");
                const itemType = jsDocs.find(jsDoc => jsDoc.name === "itemType");
                const itemMultipleOf = jsDocs.find(jsDoc => jsDoc.name === "itemMultipleOf");
                const itemMinimum = jsDocs.find(jsDoc => jsDoc.name === "itemMinimum");
                const itemMaximum = jsDocs.find(jsDoc => jsDoc.name === "itemMaximum");
                const itemExclusiveMinimum = jsDocs.find(jsDoc => jsDoc.name === "itemExclusiveMinimum");
                const itemExclusiveMaximum = jsDocs.find(jsDoc => jsDoc.name === "itemExclusiveMaximum");
                const type = this.getType(arrayType.elementType);
                this.overrideType(type, itemType);
                if (type.kind === "number") {
                    if (itemMultipleOf && itemMultipleOf.comment) {
                        type.multipleOf = +itemMultipleOf.comment;
                    }
                    if (itemMinimum && itemMinimum.comment) {
                        type.minimum = +itemMinimum.comment;
                    }
                    if (itemMaximum && itemMaximum.comment) {
                        type.maximum = +itemMaximum.comment;
                    }
                    if (itemExclusiveMinimum && itemExclusiveMinimum.comment) {
                        type.exclusiveMinimum = +itemExclusiveMinimum.comment;
                    }
                    if (itemExclusiveMaximum && itemExclusiveMaximum.comment) {
                        type.exclusiveMaximum = +itemExclusiveMaximum.comment;
                    }
                }
                this.models.push({
                    kind: "array",
                    name: declaration.name.text,
                    type,
                    entry: entry ? entry.comment : undefined,
                    uniqueItems: uniqueItems ? true : undefined,
                    minItems: (minItems && minItems.comment) ? +minItems.comment : undefined,
                    maxItems: (maxItems && maxItems.comment) ? +maxItems.comment : undefined,
                });
            } else {
                const { members, minProperties, maxProperties } = this.getMembersInfo(declaration.type);
                this.models.push({
                    kind: "object",
                    name: declaration.name.text,
                    members,
                    minProperties,
                    maxProperties,
                    entry: entry ? entry.comment : undefined,
                });
            }
        } else if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
            const declaration = node as ts.InterfaceDeclaration;

            // if the node is pre-handled, then it should be in `models` already, so don't continue
            if (this.models.some(m => m.name === declaration.name.text)) {
                return;
            }

            const { members, minProperties: selfMinProperties, maxProperties: selfMaxProperties } = this.getObjectMembers(declaration.members);
            let minProperties = selfMinProperties;
            let maxProperties = selfMaxProperties;

            if (declaration.heritageClauses) {
                for (const clause of declaration.heritageClauses) {
                    if (clause.kind === ts.SyntaxKind.HeritageClause) {
                        for (const type of clause.types) {
                            if (type.kind === ts.SyntaxKind.ExpressionWithTypeArguments) {
                                const interfaceName = (type.expression as ts.Identifier).text;
                                this.preHandleType(interfaceName);
                                const model = this.models.find(m => m.kind === "object" && m.name === interfaceName);
                                if (model && model.kind === "object") {
                                    for (const member of model.members) {
                                        if (members.every(m => m.name !== member.name)) {
                                            members.push(member);
                                            maxProperties++;
                                            if (!member.optional) {
                                                minProperties++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            this.models.push({
                kind: "object",
                name: declaration.name.text,
                members,
                minProperties,
                maxProperties,
                entry: entry ? entry.comment : undefined,
            });
        }
    }

    preHandleType(typeName: string) {
        // if the node is pre-handled, then it should be in `models` already, so don't continue
        if (this.models.some(m => m.name === typeName)) {
            return;
        }

        let findIt = false;
        ts.forEachChild(this.sourceFile, node => {
            if (findIt) {
                return;
            }
            if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
                const declaration = node as ts.InterfaceDeclaration;
                if (declaration.name.text === typeName) {
                    findIt = true;
                    this.handleSourceFile(node);
                }
            } else if (node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
                const declaration = node as ts.TypeAliasDeclaration;
                if (declaration.name.text === typeName) {
                    findIt = true;
                    this.handleSourceFile(node);
                }
            }
        });
    }

    overrideType(type: Type, jsDoc: JsDoc | undefined) {
        if (jsDoc && jsDoc.comment) {
            if (type.kind === "number") {
                type.type = jsDoc.comment;
            } else if (type.kind === "array") {
                if (type.type.kind === "number") {
                    type.type = {
                        kind: type.type.kind,
                        type: jsDoc.comment,
                    };
                }
            }
        }
    }
    getMembersInfo(node: ts.TypeNode): MembersInfo {
        const members: Member[] = [];
        let minProperties = 0;
        let maxProperties = 0;
        if (node.kind === ts.SyntaxKind.TypeLiteral) {
            const typeLiteral = node as ts.TypeLiteralNode;
            return this.getObjectMembers(typeLiteral.members);
        } else if (node.kind === ts.SyntaxKind.UnionType) {
            const unionType = node as ts.UnionTypeNode;
            minProperties = Infinity;
            for (const type of unionType.types) {
                const childMembersInfo = this.getMembersInfo(type);
                if (minProperties > childMembersInfo.minProperties) {
                    minProperties = childMembersInfo.minProperties;
                }
                if (maxProperties < childMembersInfo.maxProperties) {
                    maxProperties = childMembersInfo.maxProperties;
                }
                if (members.length === 0) {
                    const childMembers: Member[] = JSON.parse(JSON.stringify(childMembersInfo.members));
                    members.push(...childMembers);
                } else {
                    const childMembers = childMembersInfo.members;
                    for (const member of members) {
                        if (childMembers.every(m => m.name !== member.name)) {
                            member.optional = true;
                        }
                    }
                    for (const member of childMembers) {
                        if (members.every(m => m.name !== member.name)) {
                            const childMember: Member = JSON.parse(JSON.stringify(member));
                            childMember.optional = true;
                            members.push(childMember);
                        }
                    }
                }
            }
        } else if (node.kind === ts.SyntaxKind.IntersectionType) {
            const intersectionType = node as ts.IntersectionTypeNode;
            for (const type of intersectionType.types) {
                const childMembersInfo = this.getMembersInfo(type);
                minProperties += childMembersInfo.minProperties;
                maxProperties += childMembersInfo.maxProperties;
                const childMembers = childMembersInfo.members;
                for (const member of childMembers) {
                    if (members.every(m => m.name !== member.name)) {
                        members.push(JSON.parse(JSON.stringify(member)));
                    }
                }
            }
        } else if (node.kind === ts.SyntaxKind.ParenthesizedType) {
            const parenthesizedType = node as ts.ParenthesizedTypeNode;
            const childMembersInfo = this.getMembersInfo(parenthesizedType.type);
            minProperties = childMembersInfo.minProperties;
            maxProperties = childMembersInfo.maxProperties;
            const childMembers: Member[] = JSON.parse(JSON.stringify(childMembersInfo.members));
            for (const member of childMembers) {
                members.push(member);
            }
        } else if (node.kind === ts.SyntaxKind.TypeReference) {
            const referenceName = ((node as ts.TypeReferenceNode).typeName as ts.Identifier).text;
            this.preHandleType(referenceName);
            const model = this.models.find(m => m.kind === "object" && m.name === referenceName);
            if (model && model.kind === "object") {
                for (const member of model.members) {
                    if (members.every(m => m.name !== member.name)) {
                        members.push(JSON.parse(JSON.stringify(member)));
                        maxProperties++;
                        if (!member.optional) {
                            minProperties++;
                        }
                    }
                }
            }
        }
        return { members, minProperties, maxProperties };
    }

    getObjectMembers(elements: ts.NodeArray<ts.TypeElement>): MembersInfo {
        const members: Member[] = [];
        let minProperties = 0;
        let maxProperties = 0;
        for (const element of elements) {
            if (element.kind === ts.SyntaxKind.PropertySignature) {
                const property = element as ts.PropertySignature;
                const name = property.name as ts.Identifier;
                const member: Member = {
                    name: name.text,
                    type: {
                        kind: "unknown",
                    },
                };
                members.push(member);

                if (property.questionToken) {
                    member.optional = true;
                } else {
                    minProperties++;
                }
                maxProperties++;

                if (property.type) {
                    member.type = this.getType(property.type);
                }

                const propertyJsDocs = this.getJsDocs(property);
                for (const propertyJsDoc of propertyJsDocs) {
                    if (propertyJsDoc.name === "tag") {
                        if (propertyJsDoc.comment) {
                            member.tag = +propertyJsDoc.comment;
                        }
                    } else if (propertyJsDoc.name === "mapValueType") {
                        if (propertyJsDoc.comment && member.type.kind === "map") {
                            if (member.type.value.kind === "number") {
                                member.type.value.type = propertyJsDoc.comment;
                            }
                        }
                    } else if (propertyJsDoc.name === "type") {
                        this.overrideType(member.type, propertyJsDoc);
                    } else if (member.type.kind === "array") {
                        if (propertyJsDoc.comment) {
                            if (propertyJsDoc.name === "minItems") {
                                member.type.minItems = +propertyJsDoc.comment;
                            } else if (propertyJsDoc.name === "maxItems") {
                                member.type.maxItems = +propertyJsDoc.comment;
                            } else if (propertyJsDoc.name === "itemType") {
                                this.overrideType(member.type, propertyJsDoc);
                            } else if (member.type.type.kind === "number") {
                                if (propertyJsDoc.name === "itemMultipleOf") {
                                    member.type.type.multipleOf = +propertyJsDoc.comment;
                                } else if (propertyJsDoc.name === "itemMinimum") {
                                    member.type.type.minimum = +propertyJsDoc.comment;
                                } else if (propertyJsDoc.name === "itemMaximum") {
                                    member.type.type.maximum = +propertyJsDoc.comment;
                                } else if (propertyJsDoc.name === "itemExclusiveMinimum") {
                                    member.type.type.exclusiveMinimum = +propertyJsDoc.comment;
                                } else if (propertyJsDoc.name === "itemExclusiveMaximum") {
                                    member.type.type.exclusiveMaximum = +propertyJsDoc.comment;
                                }
                            } else if (member.type.type.kind === "string") {
                                if (propertyJsDoc.name === "itemMinLength") {
                                    member.type.type.minLength = +propertyJsDoc.comment;
                                } else if (propertyJsDoc.name === "itemMaxLength") {
                                    member.type.type.maxLength = +propertyJsDoc.comment;
                                } else if (propertyJsDoc.name === "itemPattern") {
                                    member.type.type.pattern = propertyJsDoc.comment;
                                }
                            }
                        } else if (propertyJsDoc.name === "uniqueItems") {
                            member.type.uniqueItems = true;
                        }
                    } else if (member.type.kind === "number") {
                        if (propertyJsDoc.comment) {
                            if (propertyJsDoc.name === "multipleOf") {
                                member.type.multipleOf = +propertyJsDoc.comment;
                            } else if (propertyJsDoc.name === "maximum") {
                                member.type.maximum = +propertyJsDoc.comment;
                            } else if (propertyJsDoc.name === "minimum") {
                                member.type.minimum = +propertyJsDoc.comment;
                            } else if (propertyJsDoc.name === "exclusiveMaximum") {
                                member.type.exclusiveMaximum = +propertyJsDoc.comment;
                            } else if (propertyJsDoc.name === "exclusiveMinimum") {
                                member.type.exclusiveMinimum = +propertyJsDoc.comment;
                            }
                        }
                    } else if (member.type.kind === "string") {
                        if (propertyJsDoc.comment) {
                            if (propertyJsDoc.name === "minLength") {
                                member.type.minLength = +propertyJsDoc.comment;
                            } else if (propertyJsDoc.name === "maxLength") {
                                member.type.maxLength = +propertyJsDoc.comment;
                            } else if (propertyJsDoc.name === "pattern") {
                                member.type.pattern = propertyJsDoc.comment;
                            }
                        }
                    }
                }
            }
        }
        return { members, minProperties, maxProperties };
    }

    getType(type: ts.TypeNode): Type {
        if (type.kind === ts.SyntaxKind.StringKeyword) {
            return {
                kind: "string",
            };
        } else if (type.kind === ts.SyntaxKind.NumberKeyword) {
            return {
                kind: "number",
                type: "number",
            };
        } else if (type.kind === ts.SyntaxKind.BooleanKeyword) {
            return {
                kind: "boolean",
            };
        } else if (type.kind === ts.SyntaxKind.TypeLiteral) {
            const literal = type as ts.TypeLiteralNode;
            if (literal.members.length === 1 && literal.members[0].kind === ts.SyntaxKind.IndexSignature) {
                const indexSignature = literal.members[0] as ts.IndexSignatureDeclaration;
                if (indexSignature.parameters.length === 1) {
                    const parameterType = indexSignature.parameters[0].type;
                    if (parameterType && indexSignature.type) {
                        return {
                            kind: "map",
                            key: this.getType(parameterType),
                            value: this.getType(indexSignature.type),
                        };
                    }
                }
            } else {
                const { members, minProperties, maxProperties } = this.getMembersInfo(literal);
                return {
                    kind: "object",
                    members,
                    minProperties,
                    maxProperties,
                };
            }
        } else if (type.kind === ts.SyntaxKind.ArrayType) {
            const array = type as ts.ArrayTypeNode;
            const elementType = this.getType(array.elementType);
            return {
                kind: "array",
                type: elementType,
            };
        } else if (type.kind === ts.SyntaxKind.TypeReference) {
            const reference = type as ts.TypeReferenceNode;
            if (reference.typeName.kind === ts.SyntaxKind.Identifier) {
                const typeName = reference.typeName as ts.Identifier;
                return {
                    kind: "reference",
                    name: typeName.text,
                };
            } else if (reference.typeName.kind === ts.SyntaxKind.QualifiedName) {
                const qualified = reference.typeName as ts.QualifiedName;
                const enumName = (qualified.left as ts.Identifier).text;
                const enumModel = this.models.find(m => m.kind === "enum" && m.name === enumName) as EnumModel | undefined;
                if (enumModel) {
                    return {
                        kind: "enum",
                        name: enumModel.name,
                        type: enumModel.type,
                        enums: enumModel.members.map(m => m.value),
                    };
                }
            }
        }
        return {
            kind: "unknown",
        };
    }

    getJsDocs(node: ts.Node) {
        const jsDocs: ts.JSDoc[] | undefined = (node as any).jsDoc;
        const result: JsDoc[] = [];
        if (jsDocs && jsDocs.length > 0) {
            for (const jsDoc of jsDocs) {
                if (jsDoc.tags) {
                    for (const tag of jsDoc.tags) {
                        result.push({
                            name: tag.tagName.text,
                            comment: tag.comment,
                        });
                    }
                }
            }
        }
        return result;
    }

    getProtobufProperty(memberType: Type): { modifier: string, propertyType: string } {
        let modifier = "";
        let propertyType = "";
        if (memberType.kind === "map") {
            let valueType = "";
            if (memberType.value.kind === "number") {
                const { propertyType: valuePropertyType } = this.getProtobufProperty(memberType.value);
                valueType = valuePropertyType;
            } else if (memberType.value.kind === "reference") {
                valueType = memberType.value.name;
            }
            if (valueType) {
                propertyType = `map<${memberType.key.kind}, ${valueType}>`;
            }
        } else if (memberType.kind === "array") {
            modifier = "repeated ";
            const { propertyType: elementPropertyType } = this.getProtobufProperty(memberType.type);
            propertyType = elementPropertyType;
        } else if (memberType.kind === "enum") {
            propertyType = memberType.type === "string" ? "string" : memberType.name;
        } else if (memberType.kind === "reference") {
            const model = this.models.find(m => m.kind === "enum" && m.name === memberType.name);
            // tslint:disable-next-line:prefer-conditional-expression
            if (model && model.kind === "enum" && model.type === "string") {
                propertyType = "string";
            } else {
                propertyType = memberType.name;
            }
        } else if (memberType.kind === "number") {
            // tslint:disable-next-line:prefer-conditional-expression
            if (memberType.type === "number") {
                propertyType = "double";
            } else if (memberType.type === "integer") {
                propertyType = "int32";
            } else {
                propertyType = memberType.type;
            }
        } else if (memberType.kind === "string") {
            propertyType = memberType.kind;
        } else if (memberType.kind === "boolean") {
            propertyType = "bool";
        }
        return { modifier, propertyType };
    }

    generateProtobuf() {
        const messages: string[] = [];
        for (const model of this.models) {
            if (model.kind === "object") {
                const members: string[] = [];
                let lastTag = model.members.reduce((p, c) => c.tag ? Math.max(p, c.tag) : p, 0);
                for (const member of model.members) {
                    if (!member.tag) {
                        lastTag++;
                    }
                    const { modifier, propertyType } = this.getProtobufProperty(member.type);
                    if (propertyType) {
                        members.push(`    ${modifier}${propertyType} ${member.name} = ${member.tag ? member.tag : lastTag};`);
                    }
                }
                messages.push(`message ${model.name} {
${members.join("\n")}
}`);
            } else if (model.kind === "enum") {
                const members: string[] = [];
                for (const member of model.members) {
                    if (typeof member.value === "number") {
                        members.push(`    ${member.name} = ${member.value};`);
                    }
                }
                if (members.length > 0) {
                    messages.push(`enum ${model.name} {
${members.join("\n")}
}`);
                }
            }
        }
        return `syntax = "proto3";

${messages.join("\n\n")}
`;
    }

    getReferencedDefinitions(typeName: string, definitions: { [name: string]: Definition }) {
        const result: { [name: string]: Definition } = {};
        const definition = definitions[typeName];
        if (definition === undefined) {
            return result;
        }
        result[typeName] = definition;
        if (definition.type === "array") {
            if (definition.items.type === undefined) {
                const itemTypeName = definition.items.$ref.substring("#/definitions/".length);
                Object.assign(result, this.getReferencedDefinitions(itemTypeName, definitions));
            }
        } else if (definition.type === "object") {
            if (definition.properties) {
                // tslint:disable-next-line:forin
                for (const propertyName in definition.properties) {
                    const propertyDefinition = definition.properties[propertyName];
                    if (propertyDefinition.type === undefined) {
                        const itemTypeName = propertyDefinition.$ref.substring("#/definitions/".length);
                        Object.assign(result, this.getReferencedDefinitions(itemTypeName, definitions));
                    } else if (propertyDefinition.type === "array") {
                        if (propertyDefinition.items.type === undefined) {
                            const itemTypeName = propertyDefinition.items.$ref.substring("#/definitions/".length);
                            Object.assign(result, this.getReferencedDefinitions(itemTypeName, definitions));
                        }
                    }
                }
            }
        }
        return result;
    }

    getNumberType(numberType: NumberType): Definition {
        let definition: Definition;
        if (numberType.type === "double" || numberType.type === "float") {
            definition = {
                type: "number",
                minimum: numberType.minimum,
                maximum: numberType.maximum,
            };
        } else if (numberType.type === "uint32" || numberType.type === "fixed32") {
            definition = {
                type: "integer",
                minimum: numberType.minimum !== undefined ? numberType.minimum : 0,
                maximum: numberType.maximum !== undefined ? numberType.maximum : 4294967295,
            };
        } else if (numberType.type === "int32" || numberType.type === "sint32" || numberType.type === "sfixed32") {
            definition = {
                type: "integer",
                minimum: numberType.minimum !== undefined ? numberType.minimum : -2147483648,
                maximum: numberType.maximum !== undefined ? numberType.maximum : 2147483647,
            };
        } else if (numberType.type === "uint64" || numberType.type === "fixed64") {
            definition = {
                type: "integer",
                minimum: numberType.minimum !== undefined ? numberType.minimum : 0,
                maximum: numberType.maximum !== undefined ? numberType.maximum : 18446744073709551615,
            };
        } else if (numberType.type === "int64" || numberType.type === "sint64" || numberType.type === "sfixed64") {
            definition = {
                type: "integer",
                minimum: numberType.minimum !== undefined ? numberType.minimum : -9223372036854775808,
                maximum: numberType.maximum !== undefined ? numberType.maximum : 9223372036854775807,
            };
        } else if (numberType.type === "number" || numberType.type === "integer") {
            definition = {
                type: numberType.type,
                minimum: numberType.minimum,
                maximum: numberType.maximum,
            };
        } else {
            definition = {
                type: numberType.kind,
                minimum: numberType.minimum,
                maximum: numberType.maximum,
            };
        }
        Object.assign(definition, {
            multipleOf: numberType.multipleOf,
            exclusiveMinimum: numberType.exclusiveMinimum,
            exclusiveMaximum: numberType.exclusiveMaximum,
        });
        return definition;
    }

    getJsonSchemaProperty(memberType: Type | ObjectModel | ArrayModel): Definition {
        if (memberType.kind === "number") {
            return this.getNumberType(memberType);
        } else if (memberType.kind === "boolean") {
            return {
                type: "boolean",
            };
        } else if (memberType.kind === "map") {
            return {
                type: "object",
                additionalProperties: this.getJsonSchemaProperty(memberType.value),
            };
        } else if (memberType.kind === "array") {
            return {
                type: "array",
                items: this.getJsonSchemaProperty(memberType.type),
                uniqueItems: memberType.uniqueItems,
                minItems: memberType.minItems,
                maxItems: memberType.maxItems,
            };
        } else if (memberType.kind === "enum") {
            if (memberType.type === "string") {
                return {
                    type: "string",
                    enum: memberType.enums,
                };
            } else {
                const definition = this.getNumberType({
                    kind: "number",
                    type: memberType.type,
                });
                Object.assign(definition, {
                    enum: memberType.enums,
                    minimum: undefined,
                    maximum: undefined,
                });
                return definition;
            }
        } else if (memberType.kind === "reference") {
            return {
                type: undefined,
                $ref: `#/definitions/${memberType.name}`,
            };
        } else if (memberType.kind === "object") {
            const properties: { [name: string]: Definition } = {};
            const required: string[] = [];
            for (const member of memberType.members) {
                if (!member.optional) {
                    required.push(member.name);
                }
                properties[member.name] = this.getJsonSchemaProperty(member.type);
            }
            return {
                type: "object",
                properties,
                required,
                additionalProperties: false,
                minProperties: memberType.minProperties > memberType.members.filter(m => !m.optional).length ? memberType.minProperties : undefined,
                maxProperties: memberType.maxProperties < memberType.members.length ? memberType.maxProperties : undefined,
            };
        } else if (memberType.kind === "string") {
            return {
                type: memberType.kind,
                minLength: memberType.minLength,
                maxLength: memberType.maxLength,
                pattern: memberType.pattern,
            };
        } else {
            return {
                type: memberType.kind,
            };
        }
    }

    generateJsonSchemas() {
        const definitions: { [name: string]: Definition } = {};
        for (const model of this.models) {
            if ((model.kind === "object" || model.kind === "array")) {
                definitions[model.name] = this.getJsonSchemaProperty(model);
            }
        }
        return this.models.filter(m => (m.kind === "object" || m.kind === "array") && m.entry)
            .map((m: ObjectModel | ArrayModel) => ({
                entry: m.entry!,
                schema: {
                    $ref: `#/definitions/${m.name}`,
                    definitions: this.getReferencedDefinitions(m.name, definitions),
                },
            }));
    }
}

export type MembersInfo = {
    members: Member[];
    minProperties: number;
    maxProperties: number;
};

export type MapType = {
    kind: "map";
    key: Type;
    value: Type;
};

export type ArrayType = {
    kind: "array";
    type: Type;
    uniqueItems?: boolean;
    minItems?: number;
    maxItems?: number;
};

export type EnumType = {
    kind: "enum";
    type: string;
    name: string;
    enums: any[];
};

export type ReferenceType = {
    kind: "reference";
    name: string;
};

export type ObjectType = {
    kind: "object";
    members: Member[];
    minProperties: number;
    maxProperties: number;
};

export type NumberType = {
    kind: "number";
    type: string;
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number;
    exclusiveMaximum?: number;
    multipleOf?: number;
};

export type StringType = {
    kind: "string";
    minLength?: number;
    maxLength?: number;
    pattern?: string;
};

export type BooleanType = {
    kind: "boolean";
};

export type UnknownType = {
    kind: "unknown";
};

export type Type = StringType | MapType | ArrayType | EnumType | ReferenceType | ObjectType | NumberType | BooleanType | UnknownType;

export type Member = {
    name: string;
    type: Type;
    optional?: boolean;
    tag?: number;
    enum?: any[];
};

export type Model = EnumModel | ObjectModel | ArrayModel;

export type EnumModel = {
    kind: "enum";
    name: string;
    type: string;
    members: EnumMember[];
};

export type EnumMember = {
    name: string;
    value: string | number;
};

export type ObjectModel = {
    kind: "object";
    name: string;
    members: Member[];
    minProperties: number;
    maxProperties: number;
    entry: string | undefined;
};

export type ArrayModel = {
    kind: "array";
    name: string;
    type: Type;
    entry: string | undefined;
    uniqueItems?: boolean;
    minItems?: number;
    maxItems?: number;
};

export type JsDoc = {
    name: string;
    comment: string | undefined;
};

export type Definition =
    {
        type: "number" | "integer",
        minimum?: number;
        maximum?: number;
        exclusiveMinimum?: number;
        exclusiveMaximum?: number;
        enum?: number[],
        multipleOf?: number;
    } | {
        type: "boolean",
    } | {
        type: "object",
        additionalProperties?: Definition | false,
        properties?: { [name: string]: Definition },
        required?: string[],
        minProperties?: number,
        maxProperties?: number,
    } | {
        type: "array",
        items: Definition,
        uniqueItems?: boolean,
        minItems?: number,
        maxItems?: number,
    } | {
        type: undefined,
        $ref: string,
    } | {
        type: "string",
        enum?: string[],
        minLength?: number;
        maxLength?: number;
        pattern?: string;
    } | {
        type: "unknown",
    };
