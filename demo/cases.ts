export interface Foo {
    /**
     * @tag 2
     */
    bar: number;
    baz: string;
}

/**
 * @entry cases.json
 */
export type Foo2 = {
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

    referenceBar: Foo;
};
