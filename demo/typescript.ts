/* eslint-disable */

const enum StringEnum {
  enumMember1 = "enum member 1",
  enumMember2 = "enum member 2",
}

const enum NumberEnum {
  enumMember1 = 0,
  enumMember2 = 1,
}

const enum NumberEnum2 {
  enumMember1 = 3,
  enumMember2 = 4,
}

interface TypeLiteral {
  typeLiteralMember1: number
  typeLiteralMember2: string
}

/**
 * @minProperties 1
 * @maxProperties 1
 */
interface Interface {
  interfaceMember1?: number
  interfaceMember2?: string
  [name: string]: unknown
}

interface TypeUnion1 {
  typeLiteralMember1?: number
  typeLiteralMember2?: string
  typeUnionMember1?: number
  typeUnionMember2?: string
}

interface TypeUnion2 {
  kind: "enum member 1" | "enum member 2"
  typeUnionMember1?: string
  typeUnionMember2?: string
}

interface TypeUnion3 {
  kind: 0 | 1
  typeUnionMember1?: string
  typeUnionMember2?: string
}

interface TypeUnion4 {
  kind: "foo" | "bar"
  typeUnionMember1?: string
  typeUnionMember2?: string
}

type TypeUnion5 = TypeLiteral | Interface

type TypeUnion8 = "foo" | "bar" | null | false

type TypeUnion9 = "foo" | "bar"

interface TypeUnion {
  typeUnionMember1: TypeUnion1
  typeUnionMember2: TypeUnion2
  typeUnionMember3: TypeUnion3
  typeUnionMember4: TypeUnion4
  typeUnionMember5: TypeUnion5
  typeUnionMember6: string | null | false
  typeUnionMember7: "foo" | "bar"
  typeUnionMember8: TypeUnion8
  typeUnionMember9: TypeUnion9
}

interface InterfaceExtends {
  interfaceExtendsMember1: number
  interfaceExtendsMember2: string
  interfaceMember1?: number
  interfaceMember2?: string
  [name: string]: unknown
}

interface TypeIntersection1 {
  interfaceMember1?: number
  interfaceMember2?: string
  typeIntersectionMember1: number
  typeIntersectionMember2: string
}

interface TypeIntersection2 {
  typeIntersectionMember1: number
  typeIntersectionMember2: string
  typeIntersectionMember3: number
  typeIntersectionMember4: string
}

interface TypeIntersection {
  typeIntersectionMember1: TypeIntersection1
  typeIntersectionMember2: TypeIntersection2
  typeIntersectionMember3: unknown
}

interface TypeUnionAndIntersection {
  typeIntersectionMember1: number
  kind: 0 | 1
  typeUnionMember1?: string
  typeUnionMember2?: string
}

interface TaggedField {
  /**
   * @tag 2
   */
  taggedFieldMember1: number
  /**
   * @tag 3
   */
  taggedFieldMember2: string
}

interface Enum {
  stringEnum: StringEnum
  numberEnum: NumberEnum
  numberEnum2: NumberEnum2
  stringEnum2: "foo"
}

interface NumberType {
  /**
   * @multipleOf 10
   * @minimum 70
   * @maximum 90
   * @exclusiveMinimum 70
   * @exclusiveMaximum 90
   */
  numberMember: number
  integerMember: number
  uint32Member: number
  int32Member: number
  sint32Member: number
  fixed32Member: number
  sfixed32Member: number
  uint64Member: number
  int64Member: number
  sint64Member: number
  fixed64Member: number
  sfixed64Member: number
  floatMember: number
  doubleMember: number
  /**
   * @title foo
   * @description bar
   */
  titleMember: number
}

interface StringType {
  /**
   * @minLength 10
   * @maxLength 20
   * @pattern ^[A-z]{3}$
   */
  stringMember: string
}

interface ArrayType {
  /**
   * @itemMinLength 10
   * @itemMaxLength 20
   * @itemPattern ^[A-z]{3}$
   */
  arrayType1: string[]
  /**
   * @uniqueItems
   * @minItems 1
   * @maxItems 10
   */
  arrayType2: TypeLiteral[]
  arrayType3: { literal: number }[]
  /**
   * @itemMultipleOf 100
   * @itemMinimum 100
   * @itemMaximum 200
   * @itemExclusiveMinimum 300
   * @itemExclusiveMaximum 400
   */
  arrayType4: number[]
  arrayType5: { literal: number | string }[]
  arrayType6: { literal: number | null }[]
  arrayType7: { literal: TypeLiteral | null }[]
  arrayType8: { literal: number }[]
  arrayType9: string[]
  arrayType10: ("foo" | "bar")[]
}

interface MapType7 {
  foo: string
  [name: string]: string
}

interface MapType8 {
  [name: string]: string
}

interface MapType {
  mapType: { [name: string]: number }
  mapType2: { [name: string]: TypeLiteral }
  mapType3: { [name: string]: { literal: number } }
  mapType4: { [name: string]: number }
  mapType5: { [name: string]: unknown }
  mapType6: { foo: number, [name: string]: number }
  mapType7: MapType7
  mapType8: MapType8
}

interface Parameter {
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

interface DefaultValue {
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
  arrayMember: unknown[]
  /**
   * @default {}
   */
  objectMember: { foo: string }
  /**
   * @default 123
   */
  numberMember1: number
  /**
   * @default {}
   */
  objectMember2: TypeLiteral
}

type TypeReferenceMember2 = TypeLiteral

interface ReferenceType {
  typeReferenceMember1: TypeLiteral
  typeReferenceMember2: TypeReferenceMember2
}

interface ClassType1 {
  classMember1: string
  classMember2: number
}

interface ClassType2 {
  classMember3: string
  classMember4: number
  classMember1: string
  classMember2: number
}

interface ClassType3 {
  classMember1: string
  classMember2: number
  classMember3: boolean
  classMember4: string
  classMember5: string[]
  classMember6: { a: number }
}

interface ClassType {
  classType1: ClassType1
  classType2: ClassType2
  classType3: ClassType3
}

interface Circular {
  children: Circular[]
}

interface TypeAlias {
  result: Result2
}

interface CreateInput {
  member1: string
  member2: number
  member3: CreateInputMember3
}

/**
 * @entry cases.json
 * @additionalProperties
 */
interface EntryType {
  optionalMember?: string
  booleanMember: boolean
  stringMember: string
  numberType: NumberType
  arrayType: ArrayType
  typeLiteral: { literal: number }
  referenceType: ReferenceType
  interfaceType: Interface
  typeUnion: TypeUnion
  interfaceExtends: InterfaceExtends
  typeIntersection: TypeIntersection
  typeUnionAndIntersection: TypeUnionAndIntersection
  mapType: MapType
  taggedField: TaggedField
  enum: Enum
  stringNumber: StringType
  id: ID
  parameter: Parameter
  optionalArrayMember?: string[]
  tupleType: [string, string]
  defaultType: DefaultValue
  anyType: unknown
  classType: ClassType
  circular: Circular
  outerType: OuterType
  typeAlias: TypeAlias
  pick: { result: Result2 }
  pick2: { member1: string, member2: number }
  pick3: CreateInput2
  unknown: LayoutMetadataMap
  [name: string]: unknown
}

interface Mutation {
  create: MutationResult
}

interface MutationResult {
  result: boolean
}

interface Query {
  user: GetResult
  users: GetResult
}

interface GetResult {
  result: Result
}

interface Result {
  member1: string
  member2: string
}

interface CreateInputMember3 {
  member1: string
}

type Result2 = Result3

interface Result3 {
  result3: string
}

interface Pet {
  id?: number
  name: string
  photoUrls: string[]
  status: "available" | "pending" | "sold"
}

/**
 * @method get
 * @path /pet/{id}
 * @summary get pet by id.
 * @description get pet by id
 * @deprecated
 * @tags pet
 */
declare function getPetById(status: "health" | "sick", tags: string[], pet: Pet, id?: number, sortType?: "asc" | "desc"): Pet

interface MongooseScheme {
  objectId: ObjectId
  date: Date
  decimal128: Decimal128
  /**
   * @index
   */
  index1: string
  /**
   * @unique
   */
  index2: string
  /**
   * @sparse
   * @select
   * @alias index4
   * @lowercase
   * @uppercase
   * @trim
   */
  index3: string
  buffer: Buffer
}

interface CreateInput2 {
  member1: string
  member2: number
}

interface LayoutMetadataMap {
  [name: string]: Metadata
}

interface Metadata {
  [name: string]: unknown
}

interface OuterType {
  outerType: number
}
