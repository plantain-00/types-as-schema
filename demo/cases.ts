type TypeLiteral = {
    typeLiteralMember1: number;
    typeLiteralMember2: string;
};

interface Interface {
    interfaceMember1: number;
    interfaceMember2: string;
}

type TypeUnion = TypeLiteral | {
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
        kind: Enum.enumMember1;
        typeUnionMember1: string;
    } | {
        kind: Enum.enumMember2;
        typeUnionMember2: string;
    };

interface InterfaceExtends extends Interface {
    interfaceExtendsMember1: number;
    interfaceExtendsMember2: string;
}

type TypeIntersection = Interface & {
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

type TypeUnionAndIntersection =
    {
        typeIntersectionMember1: number;
    } & (
        {
            kind: Enum.enumMember1;
            typeUnionMember1: string;
        } | {
            kind: Enum.enumMember2;
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

export const enum Enum {
    enumMember1,
    enumMember2,
}

/**
 * @entry cases.json
 */
export type PreciseType = {
    optionalMember?: string;

    booleanMember: boolean;

    stringMember: string;

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

    arrayType: string[];
    arrayType2: TypeLiteral[];
    arrayType3: { literal: number }[];

    typeLiteral: { literal: number };

    referenceType: TypeLiteral;
    referenceType2: Interface;
    referenceType3: TypeUnion;
    referenceType4: TypeUnion2;
    referenceType5: TypeUnion3;
    referenceType6: InterfaceExtends;
    referenceType7: TypeIntersection;
    referenceType8: TypeIntersection2;
    referenceType9: TypeUnionAndIntersection;

    mapType: { [name: string]: number };
    mapType2: { [name: string]: TypeLiteral };
    mapType3: { [name: string]: { literal: number } };
    /**
     * @mapValueType uint32
     */
    mapType4: { [name: string]: number };

    taggedField: TaggedField;

    stringEnum: StringEnum;
    enum: Enum;
};
