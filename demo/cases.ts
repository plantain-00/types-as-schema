type TypeLiteral = {
  typeLiteralMember1: number;
  typeLiteralMember2: string;
}

/**
 * @minProperties 1
 * @maxProperties 1
 */
interface Interface {
  interfaceMember1?: number
  interfaceMember2?: string

  [name: string]: any
}

type TypeUnion1 = TypeLiteral | {
  typeUnionMember1: number;
  typeUnionMember2: string;
}
type TypeUnion2 =
  {
    kind: StringEnum.enumMember1;
    typeUnionMember1: string;
  } | {
    kind: StringEnum.enumMember2;
    typeUnionMember2: string;
  }
type TypeUnion3 =
  {
    kind: NumberEnum.enumMember1;
    typeUnionMember1: string;
  } | {
    kind: NumberEnum.enumMember2;
    typeUnionMember2: string;
  }
type TypeUnion4 =
  {
    kind: 'foo';
    typeUnionMember1: string;
  } | {
    kind: 'bar';
    typeUnionMember2: string;
  }
type TypeUnion5 = TypeLiteral | Interface
type TypeUnion8 = 'foo' | 'bar' | null | false
type TypeUnion9 = 'foo' | 'bar'
type TypeUnion = {
  typeUnionMember1: TypeUnion1;
  typeUnionMember2: TypeUnion2;
  typeUnionMember3: TypeUnion3;
  typeUnionMember4: TypeUnion4;
  typeUnionMember5: TypeUnion5;
  typeUnionMember6: string | null | false;
  typeUnionMember7: 'foo' | 'bar';
  typeUnionMember8: TypeUnion8;
  typeUnionMember9: TypeUnion9;
}

interface InterfaceExtends extends Interface {
  interfaceExtendsMember1: number
  interfaceExtendsMember2: string
}

type TypeIntersection1 = Interface & {
  typeIntersectionMember1: number;
  typeIntersectionMember2: string;
}
type TypeIntersection2 =
  {
    typeIntersectionMember1: number;
    typeIntersectionMember2: string;
  } & {
    typeIntersectionMember3: number;
    typeIntersectionMember4: string;
  }

type TypeIntersection = {
  typeIntersectionMember1: TypeIntersection1;
  typeIntersectionMember2: TypeIntersection2;
  typeIntersectionMember3: TypeLiteral & Interface;
}

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
  )

export type TaggedField = {
  /**
   * @tag 2
   */
  taggedFieldMember1: number;
  /**
   * @tag 3
   */
  taggedFieldMember2: string;
}

export const enum StringEnum {
  enumMember1 = 'enum member 1',
  enumMember2 = 'enum member 2'
}
export const enum NumberEnum {
  enumMember1,
  enumMember2
}
export const enum NumberEnum2 {
  enumMember1 = 3,
  enumMember2 = 4
}
export type Enum = {
  stringEnum: StringEnum;
  numberEnum: NumberEnum;
  numberEnum2: NumberEnum2;
  stringEnum2: 'foo';
}

type integer = number
type uint32 = number
type int32 = number
type sint32 = number
type fixed32 = number
type sfixed32 = number
type uint64 = number
type int64 = number
type sint64 = number
type fixed64 = number
type sfixed64 = number
type float = number
type double = number

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

  /**
   * @title foo
   * @description bar
   */
  titleMember: number;
}

type StringType = {
  /**
   * @minLength 10
   * @maxLength 20
   * @pattern ^[A-z]{3}$
   */
  stringMember: string;
}

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
   * @itemMultipleOf 100
   * @itemMinimum 100
   * @itemMaximum 200
   * @itemExclusiveMinimum 300
   * @itemExclusiveMaximum 400
   */
  arrayType4: uint32[];
  arrayType5: { literal: number | string }[];
  arrayType6: { literal: number | null }[];
  arrayType7: { literal: TypeLiteral | null }[];
  arrayType8: Array<{ literal: number }>;
}

type MapType7 = {
  foo: string
  [name: string]: string
}

type MapType = {
  mapType: { [name: string]: number };
  mapType2: { [name: string]: TypeLiteral };
  mapType3: { [name: string]: { literal: number } };
  mapType4: { [name: string]: uint32 };
  mapType5: { [name: string]: any };
  mapType6: {
    foo: number
    [name: string]: number
  };
  mapType7: MapType7
}

type ID = any

type Parameter = {
  /**
   * @param {string} name
   * @param {number} age
   */
  member1: string
  /**
   * @param {string} [name]
   */
  member2: string
}

type DefaultValue = {
  /**
   * @default foo
   */
  stringMember: string
  /**
   * @default 123
   */
  numberMember: number
  /**
   * @default true
   */
  booleanMember: boolean
  /**
   * @default 'foo bar'
   */
  stringMember2: string
  /**
   * @default ''
   */
  stringMember3: string
  /**
   * @default []
   */
  arrayMember: any[]
  /**
   * @default {}
   */
  objectMember: { foo: string }
  /**
   * @default 123
   */
  numberMember1: integer
  /**
   * @default {}
   */
  objectMember2: TypeLiteral
}

type TypeReferenceMember2 = TypeLiteral

type ReferenceType = {
  typeReferenceMember1: TypeLiteral
  typeReferenceMember2: TypeReferenceMember2
}

class ClassType1 {
  classMember1: string
  classMember2: number
}

class ClassType2 extends ClassType1 {
  classMember3: string
  classMember4: number
}

class ClassType3 {
  classMember1 = 'foo'
  classMember2 = 123
  classMember3 = false
  classMember4: string = 'foo'
  classMember5 = ['foo']
  classMember6 = { a: 1 }
}

type ClassType = {
  classType1: ClassType1;
  classType2: ClassType2;
  classType3: ClassType3;
}

type Circular = {
  children: Circular[]
}

import { OuterType } from './case2'

/**
 * @entry cases.json
 * @additionalProperties
 */
export type EntryType = {
  optionalMember?: string;
  booleanMember: boolean;
  stringMember: string;
  numberType: NumberType;
  arrayType: ArrayType;
  typeLiteral: { literal: number };
  referenceType: ReferenceType;
  interfaceType: Interface;
  typeUnion: TypeUnion;
  interfaceExtends: InterfaceExtends;
  typeIntersection: TypeIntersection;
  typeUnionAndIntersection: TypeUnionAndIntersection;
  mapType: MapType;
  taggedField: TaggedField;
  enum: Enum;
  stringNumber: StringType;
  id: ID;
  parameter: Parameter;
  optionalArrayMember?: string[];
  tupleType: [string, string];
  defaultType: DefaultValue;
  anyType: any;
  classType: ClassType;
  circular: Circular;
  outerType: OuterType;
}
