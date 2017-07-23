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
                        type: getExpressType(firstMember.initializer),
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

    ts.forEachChild(sourceFile, node => {
        const jsDocs = getJsDocs(node);
        const entry = jsDocs.find(jsDoc => jsDoc.name === "entry");
        if (node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
            const declaration = node as ts.TypeAliasDeclaration;
            if (declaration.type.kind === ts.SyntaxKind.ArrayType) {
                const arrayType = declaration.type as ts.ArrayTypeNode;
                models.push({
                    kind: "array",
                    name: declaration.name.text,
                    type: getType(arrayType.elementType, models),
                    entry: entry ? entry.comment : undefined,
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

        }
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

type MembersInfo = {
    members: Member[];
    minProperties: number;
    maxProperties: number;
};

function getMembersInfo(node: ts.TypeNode, models: Model[]): MembersInfo {
    const members: Member[] = [];
    let minProperties = 0;
    let maxProperties = 0;
    let lastTag = 0;
    if (node.kind === ts.SyntaxKind.TypeLiteral) {
        const typeLiteral = node as ts.TypeLiteralNode;
        for (const element of typeLiteral.members) {
            if (element.kind === ts.SyntaxKind.PropertySignature) {
                const property = element as ts.PropertySignature;
                const name = property.name as ts.Identifier;
                const member: Member = {
                    name: name.text,
                    type: "",
                    optional: false,
                    tag: 0,
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
                    if (propertyJsDoc.name === "tag" && propertyJsDoc.comment) {
                        member.tag = +propertyJsDoc.comment;
                        lastTag = member.tag;
                    } else if (propertyJsDoc.name === "mapValueType" && propertyJsDoc.comment) {
                        (member.type as MapType).value = propertyJsDoc.comment;
                    } else if (propertyJsDoc.name === "type" && propertyJsDoc.comment) {
                        member.type = propertyJsDoc.comment;
                    }
                }

                if (!member.tag) {
                    member.tag = lastTag + 1;
                    lastTag = member.tag;
                }
            }
        }
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
                lastTag = childMembers[childMembers.length - 1].tag;
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
                        member.tag = lastTag + 1;
                        lastTag = member.tag;
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
                    member.tag = lastTag + 1;
                    lastTag = member.tag;
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
            member.tag = lastTag + 1;
            lastTag = member.tag;
        }
    }
    return { members, minProperties, maxProperties };
}

function getExpressType(type: ts.Expression): Type {
    if (type.kind === ts.SyntaxKind.StringLiteral) {
        return ts.ClassificationTypeNames.stringLiteral;
    }
    return "";
}

function getType(type: ts.TypeNode, models: Model[]): Type {
    if (type.kind === ts.SyntaxKind.StringKeyword) {
        return ts.ClassificationTypeNames.stringLiteral;
    } else if (type.kind === ts.SyntaxKind.NumberKeyword) {
        return ts.ClassificationTypeNames.numericLiteral;
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
    return "";
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
};

type EnumType = {
    kind: "enum";
    type: Type;
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

type Type = string | MapType | ArrayType | EnumType | ReferenceType | ObjectType;

type Member = {
    name: string;
    type: Type;
    optional: boolean;
    tag: number;
    enum?: any[];
};

type Model = EnumModel | ObjectModel | ArrayModel;

type EnumModel = {
    kind: "enum";
    name: string;
    type: Type;
    members: { [key: string]: any };
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

function getProtobufProperty(memberType: Type): { modifier: string, propertyType: Type } {
    let modifier = "";
    let propertyType: Type = "";
    if (typeof memberType !== "string") {
        if (memberType.kind === "map") {
            const valueType = memberType.value === "number" ? "uint32" : memberType.value;
            propertyType = `map<${memberType.key}, ${valueType}>`;
        } else if (memberType.kind === "array") {
            modifier = "repeated ";
            const { propertyType: elementPropertyType } = getProtobufProperty(memberType.type);
            propertyType = elementPropertyType;
        } else if (memberType.kind === "enum") {
            propertyType = memberType.type;
        } else if (memberType.kind === "reference") {
            propertyType = memberType.name;
        }
    } else {
        propertyType = memberType === "number" ? "uint32" : memberType;
    }
    return { modifier, propertyType };
}

function generateProtobuf(models: Model[]) {
    const messages: string[] = [];
    for (const model of models) {
        if (model.kind === "object") {
            const members: string[] = [];
            for (const member of model.members) {
                const { modifier, propertyType } = getProtobufProperty(member.type);
                members.push(`    ${modifier}${propertyType} ${member.name} = ${member.tag};`);
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

function getJsonSchemaProperty(memberType: Type | ObjectModel | ArrayModel): any {
    if (memberType === "double" || memberType === "float") {
        return {
            type: "number",
        };
    } else if (memberType === "uint32" || memberType === "fixed32") {
        return {
            type: "integer",
            minimum: 0,
            maximum: 4294967295,
        };
    } else if (memberType === "int32" || memberType === "sint32" || memberType === "sfixed32") {
        return {
            type: "integer",
            minimum: -2147483648,
            maximum: 2147483647,
        };
    } else if (memberType === "uint64" || memberType === "fixed64") {
        return {
            type: "integer",
            minimum: 0,
            maximum: 18446744073709551615,
        };
    } else if (memberType === "int64" || memberType === "sint64" || memberType === "sfixed64") {
        return {
            type: "integer",
            minimum: -9223372036854775808,
            maximum: 9223372036854775807,
        };
    } else if (memberType === "bool") {
        return {
            type: "boolean",
        };
    } else if (memberType && typeof memberType !== "string") {
        if (memberType.kind === "map") {
            return {
                type: "object",
                additionalProperties: getJsonSchemaProperty(memberType.value),
            };
        } else if (memberType.kind === "array") {
            return {
                type: "array",
                items: getJsonSchemaProperty(memberType.type),
            };
        } else if (memberType.kind === "enum") {
            return {
                type: typeof memberType.type === "string" ? memberType.type : "",
                enum: memberType.enums,
            };
        } else if (memberType.kind === "reference") {
            return {
                $ref: `#/definitions/${memberType.name}`,
            };
        } else if (memberType.kind === "object") {
            const properties: { [name: string]: any } = {};
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
        }
    } else {
        return {
            type: memberType,
        };
    }
}

function generateJsonSchema(outDir: string, models: Model[]) {
    const result: {
        definitions: { [name: string]: any };
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
    const resultString = JSON.stringify(result);
    for (const model of entryModels) {
        const newResult: typeof result = JSON.parse(resultString);
        newResult.$ref = `#/definitions/${model.name}`;
        fs.writeFileSync(path.resolve(outDir, model.entry), JSON.stringify(newResult, null, "  "));
    }
}

executeCommandLine().then(() => {
    printInConsole("success.");
}, error => {
    printInConsole(error);
    process.exit(1);
});
