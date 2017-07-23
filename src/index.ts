import * as minimist from "minimist";
import * as ts from "typescript";
import * as fs from "fs";
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
            const model: Model = {
                kind: "object",
                name: declaration.name.text,
                members: [],
                isEntry: !!entry,
            };
            models.push(model);
            if (declaration.type.kind === ts.SyntaxKind.TypeLiteral) {
                model.members = getTypeLiteralMembers(declaration.type as ts.TypeLiteralNode, models);

            } else if (declaration.type.kind === ts.SyntaxKind.UnionType) {
                model.members = getUnionTypeMembers(declaration.type as ts.UnionTypeNode, models);
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
        fs.writeFileSync(jsonPath, JSON.stringify(generateJsonSchema(models), null, "  "));
    }
}

function getTypeLiteralMembers(typeLiteral: ts.TypeLiteralNode, models: Model[]) {
    const results: Member[] = [];
    let lastTag = 0;
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
            results.push(member);

            if (property.questionToken) {
                member.optional = true;
            }

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
    return results;
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
            const mapType: MapType = {
                kind: "map",
            };
            if (indexSignature.parameters.length === 1) {
                const parameterType = indexSignature.parameters[0].type;
                if (parameterType) {
                    mapType.key = getType(parameterType, models);
                }
            }
            if (!mapType.value && indexSignature.type) {
                mapType.value = getType(indexSignature.type, models);
            }
            return mapType;
        }
    } else if (type.kind === ts.SyntaxKind.ArrayType) {
        const array = type as ts.ArrayTypeNode;
        const elementType = getType(array.elementType, models);
        return {
            kind: "array",
            element: elementType,
        };
    } else if (type.kind === ts.SyntaxKind.TypeReference) {
        const reference = type as ts.TypeReferenceNode;
        if (reference.typeName.kind === ts.SyntaxKind.Identifier) {
            const typeName = reference.typeName as ts.Identifier;
            return typeName.text;
        } else if (reference.typeName.kind === ts.SyntaxKind.QualifiedName) {
            const qualified = reference.typeName as ts.QualifiedName;
            const enumName = (qualified.left as ts.Identifier).text;
            // const enumValue = (qualified.right as ts.Identifier).text;
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

function getUnionTypeMembers(unionType: ts.UnionTypeNode, models: Model[]) {
    const members: Member[] = [];
    let lastTag = 0;
    for (const type of unionType.types) {
        if (type.kind === ts.SyntaxKind.TypeLiteral) {
            const childMembers = getTypeLiteralMembers(type as ts.TypeLiteralNode, models);
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
                        lastTag = childMembers[childMembers.length - 1].tag;
                    }
                }
            }
        }
    }
    return members;
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
    key?: Type;
    value?: Type;
};

type ArrayType = {
    kind: "array";
    element: Type;
};

type EnumType = {
    kind: "enum";
    type: Type;
    enums: any[];
};

type Type = string | MapType | ArrayType | EnumType;

type Member = {
    name: string;
    type: Type;
    optional: boolean;
    tag: number;
    enum?: any[];
};

type Model = EnumModel | ObjectModel;

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
    isEntry: boolean;
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

function generateProtobuf(models: Model[]) {
    const messages: string[] = [];
    for (const model of models) {
        if (model.kind === "object") {
            const members: string[] = [];
            for (const member of model.members) {
                let modifier = "";
                let propertyType: Type = "";
                if (typeof member.type !== "string") {
                    if (member.type.kind === "map") {
                        const valueType = member.type.value === "number" ? "uint32" : member.type.value;
                        propertyType = `map<${member.type.key}, ${valueType}>`;
                    } else if (member.type.kind === "array") {
                        modifier = "repeated ";
                        propertyType = member.type.element;
                    } else if (member.type.kind === "enum") {
                        propertyType = member.type.type;
                    }
                } else {
                    propertyType = member.type === "number" ? "uint32" : member.type!;
                }
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

function getJsonSchemaProperty(memberType?: Type) {
    let propertyType: string;
    let minimum: number | undefined;
    let maximum: number | undefined;
    let additionalProperties: any;
    let items: any;
    let enums: any[] | undefined;
    if (memberType === "double" || memberType === "float") {
        propertyType = "number";
    } else if (memberType === "uint32" || memberType === "fixed32") {
        propertyType = "integer";
        minimum = 0;
        maximum = 4294967295;
    } else if (memberType === "int32" || memberType === "sint32" || memberType === "sfixed32") {
        propertyType = "integer";
        minimum = -2147483648;
        maximum = 2147483647;
    } else if (memberType === "uint64" || memberType === "fixed64") {
        propertyType = "integer";
        minimum = 0;
        maximum = 18446744073709551615;
    } else if (memberType === "int64" || memberType === "sint64" || memberType === "sfixed64") {
        propertyType = "integer";
        minimum = -9223372036854775808;
        maximum = 9223372036854775807;
    } else if (memberType === "bool") {
        propertyType = "boolean";
    } else if (memberType && typeof memberType !== "string") {
        if (memberType.kind === "map") {
            propertyType = "object";
            additionalProperties = getJsonSchemaProperty(memberType.value);
        } else if (memberType.kind === "array") {
            propertyType = "array";
            items = {
                $ref: `#/definitions/${memberType.element}`,
            };
        } else if (memberType.kind === "enum") {
            propertyType = typeof memberType.type === "string" ? memberType.type : "";
            enums = memberType.enums;
        } else {
            propertyType = "";
        }
    } else {
        propertyType = memberType as string;
    }
    return {
        type: propertyType,
        minimum,
        maximum,
        additionalProperties,
        items,
        enum: enums,
    };
}

function generateJsonSchema(models: Model[]) {
    const result: {
        definitions: { [name: string]: any };
        $ref?: string;
    } = { definitions: {} };
    for (const model of models) {
        if (model.kind === "object") {
            const properties: { [name: string]: any } = {};
            const required: string[] = [];
            for (const member of model.members) {
                if (!member.optional) {
                    required.push(member.name);
                }
                properties[member.name] = getJsonSchemaProperty(member.type);
            }
            result.definitions[model.name] = {
                type: model.kind,
                properties,
                required,
            };
            if (model.isEntry) {
                result.$ref = `#/definitions/${model.name}`;
            }
        }
    }
    return result;
}

executeCommandLine().then(() => {
    printInConsole("success.");
}, error => {
    printInConsole(error);
    process.exit(1);
});
