import * as minimist from "minimist";
import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import * as packageJson from "../package.json";

async function executeCommandLine() {
    const argv = minimist(process.argv.slice(2), { "--": true });

    const showVersion = argv.v || argv.version;
    if (showVersion) {
        showToolVersion();
        return;
    }

    const protobufPath = argv.protobuf;
    if (protobufPath && typeof protobufPath !== "string") {
        throw new Error("expect the path of generated protobuf file");
    }

    const jsonPath = argv.json;
    if (jsonPath && typeof jsonPath !== "string") {
        throw new Error("expect the path of generated json file");
    }

    const debugPath = argv.debug;
    if (debugPath && typeof debugPath !== "string") {
        throw new Error("expect the path of generated debug file");
    }

    const filePaths = argv._;
    if (filePaths.length === 0) {
        throw new Error("expect the path of types file");
    }
    if (filePaths.length > 1) {
        throw new Error("expect only one path of types file");
    }
    const filePath = filePaths[0];

    const program = ts.createProgram(filePaths, { target: ts.ScriptTarget.ESNext });

    const models: Model[] = [];

    const sourceFile = program.getSourceFile(filePath);

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
                        type: firstMember.initializer.kind === ts.SyntaxKind.StringLiteral ? ts.ClassificationTypeNames.stringLiteral : "",
                        members: {},
                    };
                    for (const member of members) {
                        if (member.initializer && member.initializer.kind === ts.SyntaxKind.StringLiteral) {
                            const name = member.name as ts.Identifier;
                            const initializer = member.initializer as ts.StringLiteral;
                            enumType.members[name.text] = initializer.text;
                        }
                    }
                    models.push(enumType);
                }
            }
        }
    });

    function handleSourceFile(node: ts.Node) {
        const jsDocs = getJsDocs(node);
        const entry = jsDocs.find(jsDoc => jsDoc.name === "entry");
        if (node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
            const declaration = node as ts.TypeAliasDeclaration;
            if (declaration.type.kind === ts.SyntaxKind.ArrayType) {
                const arrayType = declaration.type as ts.ArrayTypeNode;
                const uniqueItems = jsDocs.find(jsDoc => jsDoc.name === "uniqueItems");
                const minItems = jsDocs.find(jsDoc => jsDoc.name === "minItems");
                const itemType = jsDocs.find(jsDoc => jsDoc.name === "itemType");
                const itemMinimum = jsDocs.find(jsDoc => jsDoc.name === "itemMinimum");
                const type = getType(arrayType.elementType, models);
                overrideType(type, itemType);
                if (type.kind === "number" && itemMinimum && itemMinimum.comment) {
                    type.minimum = +itemMinimum.comment;
                }
                models.push({
                    kind: "array",
                    name: declaration.name.text,
                    type,
                    entry: entry ? entry.comment : undefined,
                    uniqueItems: uniqueItems ? true : undefined,
                    minItems: (minItems && minItems.comment) ? +minItems.comment : undefined,
                });
            } else {
                const { members, minProperties, maxProperties } = getMembersInfo(declaration.type, models);
                models.push({
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
            if (models.some(m => m.name === declaration.name.text)) {
                return;
            }

            const { members, minProperties: selfMinProperties, maxProperties: selfMaxProperties } = getObjectMembers(declaration.members, models);
            let minProperties = selfMinProperties;
            let maxProperties = selfMaxProperties;

            if (declaration.heritageClauses) {
                for (const clause of declaration.heritageClauses) {
                    if (clause.kind === ts.SyntaxKind.HeritageClause) {
                        for (const type of clause.types) {
                            if (type.kind === ts.SyntaxKind.ExpressionWithTypeArguments) {
                                const interfaceName = (type.expression as ts.Identifier).text;
                                preHandleInterface(interfaceName);
                                const model = models.find(m => m.kind === "object" && m.name === interfaceName);
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

            models.push({
                kind: "object",
                name: declaration.name.text,
                members,
                minProperties,
                maxProperties,
                entry: entry ? entry.comment : undefined,
            });
        }
    }

    function preHandleInterface(interfaceName: string) {
        // if the node is pre-handled, then it should be in `models` already, so don't continue
        if (models.some(m => m.name === interfaceName)) {
            return;
        }

        let findIt = false;
        ts.forEachChild(sourceFile, node => {
            if (findIt) {
                return;
            }
            if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
                const declaration = node as ts.InterfaceDeclaration;
                if (declaration.name.text === interfaceName) {
                    findIt = true;
                    handleSourceFile(node);
                }
            }
        });
    }

    ts.forEachChild(sourceFile, node => {
        handleSourceFile(node);
    });

    if (debugPath) {
        fs.writeFileSync(debugPath, JSON.stringify(models, null, "  "));
    }

    if (protobufPath) {
        fs.writeFileSync(protobufPath, generateProtobuf(models));
    }

    if (jsonPath) {
        generateJsonSchema(jsonPath, models);
    }
}

function overrideType(type: Type, jsDoc: JsDoc | undefined) {
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

type MembersInfo = {
    members: Member[];
    minProperties: number;
    maxProperties: number;
};

function getMembersInfo(node: ts.TypeNode, models: Model[]): MembersInfo {
    const members: Member[] = [];
    let minProperties = 0;
    let maxProperties = 0;
    if (node.kind === ts.SyntaxKind.TypeLiteral) {
        const typeLiteral = node as ts.TypeLiteralNode;
        return getObjectMembers(typeLiteral.members, models);
    } else if (node.kind === ts.SyntaxKind.UnionType) {
        const unionType = node as ts.UnionTypeNode;
        minProperties = Infinity;
        for (const type of unionType.types) {
            const childMembersInfo = getMembersInfo(type, models);
            if (minProperties > childMembersInfo.minProperties) {
                minProperties = childMembersInfo.minProperties;
            }
            if (maxProperties < childMembersInfo.maxProperties) {
                maxProperties = childMembersInfo.maxProperties;
            }
            const childMembers = childMembersInfo.members;
            if (members.length === 0) {
                members.push(...childMembers);
            } else {
                for (const member of members) {
                    if (childMembers.every(m => m.name !== member.name)) {
                        member.optional = true;
                    }
                }
                for (const member of childMembers) {
                    if (members.every(m => m.name !== member.name)) {
                        member.optional = true;
                        members.push(member);
                    }
                }
            }
        }
    } else if (node.kind === ts.SyntaxKind.IntersectionType) {
        const intersectionType = node as ts.IntersectionTypeNode;
        for (const type of intersectionType.types) {
            const childMembersInfo = getMembersInfo(type, models);
            minProperties += childMembersInfo.minProperties;
            maxProperties += childMembersInfo.maxProperties;
            const childMembers = childMembersInfo.members;
            for (const member of childMembers) {
                if (members.every(m => m.name !== member.name)) {
                    members.push(member);
                }
            }
        }
    } else if (node.kind === ts.SyntaxKind.ParenthesizedType) {
        const parenthesizedType = node as ts.ParenthesizedTypeNode;
        const childMembersInfo = getMembersInfo(parenthesizedType.type, models);
        minProperties = childMembersInfo.minProperties;
        maxProperties = childMembersInfo.maxProperties;
        const childMembers = childMembersInfo.members;
        for (const member of childMembers) {
            members.push(member);
        }
    }
    return { members, minProperties, maxProperties };
}

function getObjectMembers(elements: ts.NodeArray<ts.TypeElement>, models: Model[]): MembersInfo {
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
                member.type = getType(property.type, models);
            }

            const propertyJsDocs = getJsDocs(property);
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
                    overrideType(member.type, propertyJsDoc);
                } else if (propertyJsDoc.name === "uniqueItems") {
                    const arrayType = member.type as ArrayType;
                    if (arrayType) {
                        arrayType.uniqueItems = true;
                    }
                } else if (propertyJsDoc.name === "minItems") {
                    const arrayType = member.type as ArrayType;
                    if (arrayType && propertyJsDoc.comment) {
                        arrayType.minItems = +propertyJsDoc.comment;
                    }
                } else if (propertyJsDoc.name === "itemType") {
                    if (propertyJsDoc.comment && member.type.kind === "array") {
                        overrideType(member.type, propertyJsDoc);
                    }
                } else if (propertyJsDoc.name === "itemMinimum") {
                    if (propertyJsDoc.comment
                        && member.type.kind === "array"
                        && member.type.type.kind === "number") {
                        member.type.type.minimum = +propertyJsDoc.comment;
                    }
                }
            }
        }
    }
    return { members, minProperties, maxProperties };
}

function getType(type: ts.TypeNode, models: Model[]): Type {
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
                        key: getType(parameterType, models),
                        value: getType(indexSignature.type, models),
                    };
                }
            }
        } else {
            const { members, minProperties, maxProperties } = getMembersInfo(literal, models);
            return {
                kind: "object",
                members,
                minProperties,
                maxProperties,
            };
        }
    } else if (type.kind === ts.SyntaxKind.ArrayType) {
        const array = type as ts.ArrayTypeNode;
        const elementType = getType(array.elementType, models);
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
            const enumModel = models.find(m => m.kind === "enum" && m.name === enumName) as EnumModel | undefined;
            if (enumModel) {
                return {
                    kind: "enum",
                    type: enumModel.type,
                    enums: Object.values(enumModel.members),
                };
            }
        }
    }
    return {
        kind: "unknown",
    };
}

function printInConsole(message: any) {
    // tslint:disable-next-line:no-console
    console.log(message);
}

function showToolVersion() {
    printInConsole(`Version: ${packageJson.version}`);
}

type MapType = {
    kind: "map";
    key: Type;
    value: Type;
};

type ArrayType = {
    kind: "array";
    type: Type;
    uniqueItems?: boolean;
    minItems?: number;
};

type EnumType = {
    kind: "enum";
    type: string;
    enums: any[];
};

type ReferenceType = {
    kind: "reference";
    name: string;
};

type ObjectType = {
    kind: "object";
    members: Member[];
    minProperties: number;
    maxProperties: number;
};

type NumberType = {
    kind: "number";
    type: string;
    minimum?: number;
};

type StringType = {
    kind: "string";
};

type BooleanType = {
    kind: "boolean";
};

type UnknownType = {
    kind: "unknown";
};

type Type = StringType | MapType | ArrayType | EnumType | ReferenceType | ObjectType | NumberType | BooleanType | UnknownType;

type Member = {
    name: string;
    type: Type;
    optional?: boolean;
    tag?: number;
    enum?: any[];
};

type Model = EnumModel | ObjectModel | ArrayModel;

type EnumModel = {
    kind: "enum";
    name: string;
    type: string;
    members: { [key: string]: string };
};

type ObjectModel = {
    kind: "object";
    name: string;
    members: Member[];
    minProperties: number;
    maxProperties: number;
    entry: string | undefined;
};

type ArrayModel = {
    kind: "array";
    name: string;
    type: Type;
    entry: string | undefined;
    uniqueItems?: boolean;
    minItems?: number;
};

type JsDoc = {
    name: string;
    comment: string | undefined;
};

function getJsDocs(node: ts.Node) {
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

function getProtobufProperty(memberType: Type): { modifier: string, propertyType: string } {
    let modifier = "";
    let propertyType = "";
    if (memberType.kind === "map") {
        const valueType = memberType.value.kind === "number" ? "uint32" : memberType.value;
        propertyType = `map<${memberType.key.kind}, ${valueType}>`;
    } else if (memberType.kind === "array") {
        modifier = "repeated ";
        const { propertyType: elementPropertyType } = getProtobufProperty(memberType.type);
        propertyType = elementPropertyType;
    } else if (memberType.kind === "enum") {
        propertyType = memberType.type;
    } else if (memberType.kind === "reference") {
        propertyType = memberType.name;
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

function generateProtobuf(models: Model[]) {
    const messages: string[] = [];
    for (const model of models) {
        if (model.kind === "object") {
            const members: string[] = [];
            let lastTag = model.members.reduce((p, c) => c.tag ? Math.max(p, c.tag) : p, 0);
            for (const member of model.members) {
                if (!member.tag) {
                    lastTag++;
                }
                const { modifier, propertyType } = getProtobufProperty(member.type);
                members.push(`    ${modifier}${propertyType} ${member.name} = ${member.tag ? member.tag : lastTag};`);
            }
            messages.push(`message ${model.name} {
${members.join("\n")}
}`);
        }
    }
    return `syntax = "proto3";

${messages.join("\n\n")}
`;
}

type Definition =
    {
        type: "number" | "integer",
        minimum?: number,
        maximum?: number,
        enum?: number[],
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
    } | {
        type: undefined,
        $ref: string,
    } | {
        type: "string",
        enum?: string[],
    } | {
        type: "unknown",
    };

function getReferencedDefinitions(typeName: string, definitions: { [name: string]: Definition }) {
    const result: { [name: string]: Definition } = {};
    const definition = definitions[typeName];
    if (definition === undefined) {
        return result;
    }
    result[typeName] = definition;
    if (definition.type === "array") {
        if (definition.items.type === undefined) {
            const itemTypeName = definition.items.$ref.substring("#/definitions/".length);
            Object.assign(result, getReferencedDefinitions(itemTypeName, definitions));
        }
    } else if (definition.type === "object") {
        if (definition.properties) {
            // tslint:disable-next-line:forin
            for (const propertyName in definition.properties) {
                const propertyDefinition = definition.properties[propertyName];
                if (propertyDefinition.type === undefined) {
                    const itemTypeName = propertyDefinition.$ref.substring("#/definitions/".length);
                    Object.assign(result, getReferencedDefinitions(itemTypeName, definitions));
                } else if (propertyDefinition.type === "array") {
                    if (propertyDefinition.items.type === undefined) {
                        const itemTypeName = propertyDefinition.items.$ref.substring("#/definitions/".length);
                        Object.assign(result, getReferencedDefinitions(itemTypeName, definitions));
                    }
                }
            }
        }
    }
    return result;
}

function getJsonSchemaProperty(memberType: Type | ObjectModel | ArrayModel): Definition {
    if (memberType.kind === "number") {
        if (memberType.type === "double" || memberType.type === "float") {
            return {
                type: "number",
                minimum: memberType.minimum,
            };
        } else if (memberType.type === "uint32" || memberType.type === "fixed32") {
            return {
                type: "integer",
                minimum: memberType.minimum !== undefined ? memberType.minimum : 0,
                maximum: 4294967295,
            };
        } else if (memberType.type === "int32" || memberType.type === "sint32" || memberType.type === "sfixed32") {
            return {
                type: "integer",
                minimum: memberType.minimum !== undefined ? memberType.minimum : -2147483648,
                maximum: 2147483647,
            };
        } else if (memberType.type === "uint64" || memberType.type === "fixed64") {
            return {
                type: "integer",
                minimum: memberType.minimum !== undefined ? memberType.minimum : 0,
                maximum: 18446744073709551615,
            };
        } else if (memberType.type === "int64" || memberType.type === "sint64" || memberType.type === "sfixed64") {
            return {
                type: "integer",
                minimum: memberType.minimum !== undefined ? memberType.minimum : -9223372036854775808,
                maximum: 9223372036854775807,
            };
        } else if (memberType.type === "number" || memberType.type === "integer") {
            return {
                type: memberType.type,
                minimum: memberType.minimum,
            };
        } else {
            return {
                type: memberType.kind,
                minimum: memberType.minimum,
            };
        }
    } else if (memberType.kind === "boolean") {
        return {
            type: "boolean",
        };
    } else if (memberType.kind === "map") {
        return {
            type: "object",
            additionalProperties: getJsonSchemaProperty(memberType.value),
        };
    } else if (memberType.kind === "array") {
        return {
            type: "array",
            items: getJsonSchemaProperty(memberType.type),
            uniqueItems: memberType.uniqueItems,
            minItems: memberType.minItems,
        };
    } else if (memberType.kind === "enum") {
        if (memberType.type === "string") {
            return {
                type: "string",
                enum: memberType.enums,
            };
        } else {
            return {
                type: "number",
                enum: memberType.enums,
            };
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
            properties[member.name] = getJsonSchemaProperty(member.type);
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
        };
    } else {
        return {
            type: memberType.kind,
        };
    }
}

function generateJsonSchema(outDir: string, models: Model[]) {
    const result: {
        definitions: { [name: string]: Definition };
        $ref?: string;
    } = { definitions: {} };
    const entryModels: (ObjectModel | ArrayModel)[] = [];
    for (const model of models) {
        if ((model.kind === "object" || model.kind === "array")) {
            result.definitions[model.name] = getJsonSchemaProperty(model);
            if (model.entry) {
                entryModels.push(model);
            }
        }
    }
    for (const model of entryModels) {
        fs.writeFileSync(path.resolve(outDir, model.entry), JSON.stringify({
            $ref: `#/definitions/${model.name}`,
            definitions: getReferencedDefinitions(model.name, result.definitions),
        }, null, "  "));
    }
}

executeCommandLine().then(() => {
    printInConsole("success.");
}, error => {
    printInConsole(error);
    process.exit(1);
});
