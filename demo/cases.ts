type TypeLiteral = {
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

type NumberType = {
    /**
     * @multipleOf 10
     * @minimum 70
     * @maximum 90
     * @exclusiveMinimum 70
     * @exclusiveMaximum 90
     */
    numberMember: number;

    /**
     * @type integer
     */
    integerMember: number;

    /**
     * @type uint32
     */
    uint32Member: number;
    /**
     * @type int32
     */
    int32Member: number;
    /**
     * @type sint32
     */
    sint32Member: number;
    /**
     * @type fixed32
     */
    fixed32Member: number;
    /**
     * @type sfixed32
     */
    sfixed32Member: number;

    /**
     * @type uint64
     */
    uint64Member: number;
    /**
     * @type int64
     */
    int64Member: number;
    /**
     * @type sint64
     */
    sint64Member: number;
    /**
     * @type fixed64
     */
    fixed64Member: number;
    /**
     * @type sfixed64
     */
    sfixed64Member: number;

    /**
     * @type float
     */
    floatMember: number;
    /**
     * @type double
     */
    doubleMember: number;
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
    /**
     * @mapValueType uint32
     */
    mapType4: { [name: string]: number };
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
