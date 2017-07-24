// type literal
type TypeLiteral = {
    typeLiteralMember1: number;
    typeLiteralMember2: string;
};

// interface
interface Interface {
    interfaceMember1: number;
    interfaceMember2: string;
}

// type union
type TypeUnion = TypeLiteral | {
    typeUnionMember1: number;
    typeUnionMember2: string;
};

// interface extends
interface InterfaceExtends extends Interface {
    interfaceExtendsMember1: number;
    interfaceExtendsMember2: string;
}

// type intersection
type TypeIntersection = Interface & {
    typeIntersectionMember1: number;
    typeIntersectionMember2: string;
};

// type array
type TypeArray = TypeLiteral[];

// map type
type MapType = { [name: string]: TypeLiteral };

// tagged field
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

// marked as more precise type
/**
 * @entry cases.json
 */
export type PreciseType = {
    booleanBar: boolean;

    stringBar: string;

    numberBar: number;

    /**
     * @type integer
     */
    integerBar: number;

    /**
     * @type uint32
     */
    uint32Bar: number;
    /**
     * @type int32
     */
    int32Bar: number;
    /**
     * @type sint32
     */
    sint32Bar: number;
    /**
     * @type fixed32
     */
    fixed32Bar: number;
    /**
     * @type sfixed32
     */
    sfixed32Bar: number;

    /**
     * @type uint64
     */
    uint64Bar: number;
    /**
     * @type int64
     */
    int64Bar: number;
    /**
     * @type sint64
     */
    sint64Bar: number;
    /**
     * @type fixed64
     */
    fixed64Bar: number;
    /**
     * @type sfixed64
     */
    sfixed64Bar: number;

    /**
     * @type float
     */
    floatBar: number;
    /**
     * @type double
     */
    doubleBar: number;

    typeLiteral: TypeLiteral;
    interface: Interface;
    typeUnion: TypeUnion;
    interfaceExtends: InterfaceExtends;
    typeIntersection: TypeIntersection;
    typeArray: TypeArray;
    mapType: MapType;
    taggedField: TaggedField;
};
