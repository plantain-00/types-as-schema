export const demoCasesTs = `type TypeLiteral = {
    typeLiteralMember1: number;
    typeLiteralMember2: string;
};

/**
 * @minProperties 1
 * @maxProperties 1
 * @additionalProperties
 */
interface Interface {
    interfaceMember1?: number;
    interfaceMember2?: string;
}

type TypeUnion1 = TypeLiteral | {
    typeUnionMember1: number;
    typeUnionMember2: string;
};
type TypeUnion2 =
    {
        kind: StringEnum.enumMember1;
        typeUnionMember1: string;
    } | {
        kind: StringEnum.enumMember2;
        typeUnionMember2: string;
    };
type TypeUnion3 =
    {
        kind: NumberEnum.enumMember1;
        typeUnionMember1: string;
    } | {
        kind: NumberEnum.enumMember2;
        typeUnionMember2: string;
    };
type TypeUnion = {
    typeUnionMember1: TypeUnion1;
    typeUnionMember2: TypeUnion2;
    typeUnionMember3: TypeUnion3;
};

interface InterfaceExtends extends Interface {
    interfaceExtendsMember1: number;
    interfaceExtendsMember2: string;
}

type TypeIntersection1 = Interface & {
    typeIntersectionMember1: number;
    typeIntersectionMember2: string;
};
type TypeIntersection2 =
    {
        typeIntersectionMember1: number;
        typeIntersectionMember2: string;
    } & {
        typeIntersectionMember3: number;
        typeIntersectionMember4: string;
    };

type TypeIntersection = {
    typeIntersectionMember1: TypeIntersection1;
    typeIntersectionMember2: TypeIntersection2;
};

type TypeUnionAndIntersection =
    {
        typeIntersectionMember1: number;
    } & (
        {
            kind: NumberEnum.enumMember1;
            typeUnionMember1: string;
        } | {
            kind: NumberEnum.enumMember2;
            typeUnionMember2: string;
        }
    );

export type TaggedField = {
    /**
     * @tag 2
     */
    taggedFieldMember1: number;
    /**
     * @tag 3
     */
    taggedFieldMember2: string;
};

export const enum StringEnum {
    enumMember1 = "enum member 1",
    enumMember2 = "enum member 2",
}
export const enum NumberEnum {
    enumMember1,
    enumMember2,
}
export const enum NumberEnum2 {
    enumMember1 = 3,
    enumMember2 = 4,
}
export type Enum = {
    stringEnum: StringEnum;
    numberEnum: NumberEnum;
    numberEnum2: NumberEnum2;
};

type integer = number;
type uint32 = number;
type int32 = number;
type sint32 = number;
type fixed32 = number;
type sfixed32 = number;
type uint64 = number;
type int64 = number;
type sint64 = number;
type fixed64 = number;
type sfixed64 = number;
type float = number;
type double = number;

type NumberType = {
    /**
     * @multipleOf 10
     * @minimum 70
     * @maximum 90
     * @exclusiveMinimum 70
     * @exclusiveMaximum 90
     */
    numberMember: number;

    integerMember: integer;

    uint32Member: uint32;
    int32Member: int32;
    sint32Member: sint32;
    fixed32Member: fixed32;
    sfixed32Member: sfixed32;

    uint64Member: uint64;
    int64Member: int64;
    sint64Member: sint64;
    fixed64Member: fixed64;
    sfixed64Member: sfixed64;

    floatMember: float;
    doubleMember: double;
};

type StringType = {
    /**
     * @minLength 10
     * @maxLength 20
     * @pattern ^[A-z]{3}$
     */
    stringMember: string;
};

type ArrayType = {
    /**
     * @itemMinLength 10
     * @itemMaxLength 20
     * @itemPattern ^[A-z]{3}$
     */
    arrayType1: string[];
    /**
     * @uniqueItems
     * @minItems 1
     * @maxItems 10
     */
    arrayType2: TypeLiteral[];
    arrayType3: { literal: number }[];
    /**
     * @itemType uint32
     * @itemMultipleOf 100
     * @itemMinimum 100
     * @itemMaximum 200
     * @itemExclusiveMinimum 300
     * @itemExclusiveMaximum 400
     */
    arrayType4: number[];
};

type MapType = {
    mapType: { [name: string]: number };
    mapType2: { [name: string]: TypeLiteral };
    mapType3: { [name: string]: { literal: number } };
    mapType4: { [name: string]: uint32 };
};

/**
 * @entry cases.json
 */
export type EntryType = {
    optionalMember?: string;
    booleanMember: boolean;
    stringMember: string;
    numberType: NumberType;
    arrayType: ArrayType;
    typeLiteral: { literal: number };
    referenceType: TypeLiteral;
    interfaceType: Interface;
    typeUnion: TypeUnion;
    interfaceExtends: InterfaceExtends;
    typeIntersection: TypeIntersection;
    typeUnionAndIntersection: TypeUnionAndIntersection;
    mapType: MapType;
    taggedField: TaggedField;
    enum: Enum;
    stringNumber: StringType;
};
`;
export const indexTemplateHtml = `<div class="app"><textarea class="source" v-model="source"></textarea><div class="result"><button @click="generate()">generate</button><div class="options"><select v-model="selectedOption"><option v-for="option in options" :value="option">{{option}}</option></select></div><pre class="protobuf" v-if="selectedOption === 'protobuf'">{{protobuf}}</pre><pre class="json-schema" v-if="jsonSchema">{{jsonSchema}}</pre></div></div>`;
