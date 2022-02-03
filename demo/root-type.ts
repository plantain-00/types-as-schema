/**
 * This file is generated by 'types-as-schema'
 * It is not mean to be edited by hand
 */
// tslint:disable
/* eslint-disable */

import { GraphQLResolveInfo } from 'graphql'

import { StringEnum, NumberEnum, NumberEnum2, TypeUnion9, Template } from './cases'

export interface Root<TContext> {
  create(input: { input: CreateInput }, context: TContext, info: GraphQLResolveInfo): MutationResult | Promise<MutationResult>
  user(input: { id: string }, context: TContext, info: GraphQLResolveInfo): GetResult<TContext> | Promise<GetResult<TContext>>
  users(input: {}, context: TContext, info: GraphQLResolveInfo): GetResult<TContext> | Promise<GetResult<TContext>>
}

export interface TypeLiteral {
  typeLiteralMember1: number
  typeLiteralMember2: string
}

export interface Interface {
  interfaceMember1?: number
  interfaceMember2?: string
}

export interface TypeUnion1 {
  typeLiteralMember1?: number
  typeLiteralMember2?: string
  typeUnionMember1?: number
  typeUnionMember2?: string
}

export interface TypeUnion2 {
  kind: StringEnum
  typeUnionMember1?: string
  typeUnionMember2?: string
}

export interface TypeUnion3 {
  kind: NumberEnum
  typeUnionMember1?: string
  typeUnionMember2?: string
}

export interface TypeUnion4 {
  kind: string
  typeUnionMember1?: string
  typeUnionMember2?: string
}

export type TypeUnion5 = TypeLiteral | Interface

export type TypeUnion8 = string | string | null | boolean

export interface TypeUnion {
  typeUnionMember1: TypeUnion1
  typeUnionMember2: TypeUnion2
  typeUnionMember3: TypeUnion3
  typeUnionMember4: TypeUnion4
  typeUnionMember5: TypeUnion5
  typeUnionMember6: string | null | boolean
  typeUnionMember7: string
  typeUnionMember8: TypeUnion8
  typeUnionMember9: TypeUnion9
}

export interface InterfaceExtends {
  interfaceExtendsMember1: number
  interfaceExtendsMember2: string
  interfaceMember1?: number
  interfaceMember2?: string
}

export interface TypeIntersection1 {
  interfaceMember1?: number
  interfaceMember2?: string
  typeIntersectionMember1: number
  typeIntersectionMember2: string
}

export interface TypeIntersection2 {
  typeIntersectionMember1: number
  typeIntersectionMember2: string
  typeIntersectionMember3: number
  typeIntersectionMember4: string
}

export interface TypeIntersection {
  typeIntersectionMember1: TypeIntersection1
  typeIntersectionMember2: TypeIntersection2
  typeIntersectionMember3: TypeLiteral | Interface
}

export interface TypeUnionAndIntersection {
  typeIntersectionMember1: number
  kind: NumberEnum
  typeUnionMember1?: string
  typeUnionMember2?: string
}

export interface TaggedField {
  taggedFieldMember1: number
  taggedFieldMember2: string
}

export interface Enum {
  stringEnum: StringEnum
  numberEnum: NumberEnum
  numberEnum2: NumberEnum2
  stringEnum2: string
}

export interface NumberType {
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
  titleMember: number
}

export interface StringType {
  stringMember: string
}

export interface ArrayType {
  arrayType1: Array<string>
  arrayType2: Array<TypeLiteral>
  arrayType3: Array<object>
  arrayType4: Array<number>
  arrayType5: Array<object>
  arrayType6: Array<object>
  arrayType7: Array<object>
  arrayType8: Array<object>
  arrayType9: Array<string>
  arrayType10: Array<string>
}

export interface MapType7 {
  foo: string
}

export interface MapType8 {

}

export interface MapType {
  mapType: { [name: string]: number }
  mapType2: { [name: string]: TypeLiteral }
  mapType3: { [name: string]: object }
  mapType4: { [name: string]: number }
  mapType5: { [name: string]: any }
  mapType6: object
  mapType7: MapType7
  mapType8: MapType8
}

export interface Parameter<TContext> {
  member1(input: { name: string, age: number }, context: TContext, info: GraphQLResolveInfo): string | Promise<string>
  member2(input: { name?: string }, context: TContext, info: GraphQLResolveInfo): string | Promise<string>
}

export interface DefaultValue {
  stringMember: string
  numberMember: number
  booleanMember: boolean
  stringMember2: string
  stringMember3: string
  arrayMember: Array<any>
  objectMember: object
  numberMember1: number
  objectMember2: TypeLiteral
}

export type TypeReferenceMember2 = TypeLiteral

export interface ReferenceType {
  typeReferenceMember1: TypeLiteral
  typeReferenceMember2: TypeReferenceMember2
}

export interface ClassType1 {
  classMember1: string
  classMember2: number
}

export interface ClassType2 {
  classMember3: string
  classMember4: number
  classMember1: string
  classMember2: number
}

export interface ClassType3 {
  classMember1: string
  classMember2: number
  classMember3: boolean
  classMember4: string
  classMember5: Array<string>
  classMember6: object
}

export interface ClassType {
  classType1: ClassType1
  classType2: ClassType2
  classType3: ClassType3
}

export interface Circular {
  children: Array<Circular>
}

export interface EntryType<TContext> {
  optionalMember?: string
  booleanMember: boolean
  stringMember: string
  numberType: NumberType
  arrayType: ArrayType
  typeLiteral: object
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
  parameter: Parameter<TContext>
  optionalArrayMember?: Array<string>
  tupleType: Array<string>
  defaultType: DefaultValue
  anyType: any
  classType: ClassType
  circular: Circular
  outerType: OuterType
  typeAlias: TypeAlias
  pick: object
  pick2: object
  pick3: CreateInput2
  unknown: LayoutMetadataMap
  template: string
  template2: string
  template3: string
  template4: string
  template5: string
  keyof: string
}

export interface CreateInput {
  member1: string
  member2: file
  member3: CreateInputMember3
}

export interface MutationResult {
  result: boolean
}

export interface GetResult<TContext> {
  result: Result<TContext>
}

export interface Result<TContext> {
  member1: string
  member2(input: { input: string }, context: TContext, info: GraphQLResolveInfo): string | Promise<string>
}

export interface CreateInputMember3 {
  member1: string
}

export interface TypeAlias {
  result: Result2
}

export type Result2 = Result3

export interface Result3 {
  result3: string
}

export interface Pet {
  id?: number
  name: string
  photoUrls: Array<string>
  status: string
}

export interface MongooseScheme {
  objectId: ObjectId
  date: Date
  decimal128: Decimal128
  index1: string
  index2: string
  index3: string
  buffer: Buffer
}

export interface CreateInput2 {
  member1: string
  member2: file
}

export interface LayoutMetadataMap {

}

export interface Metadata {

}

export type WsCommand = CreateBlog | UpdateBlog

export interface CreateBlog {
  type: string
  content: string
}

export interface UpdateBlog {
  type: string
  id: number
  content: string
}

export type WsPush = BlogChange

export interface BlogChange {
  type: string
  id: number
  content: string
}

export interface TestController<TContext> {
  get(input: { foo: number, bar: string }, context: TContext, info: GraphQLResolveInfo): any | Promise<any>
}

export type Pet1 = Pet

export interface OuterType {
  outerType: number
}

export type DeepReturnType<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? Array<DeepReturnType<U>>
    : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepReturnType<U>>
      : T[P] extends (...args: any[]) => infer R
        ? R extends Promise<infer U>
          ? U
          : R
        : DeepReturnType<T[P]>
}

export interface ResolveResult<TContext> {
  create: DeepReturnType<MutationResult>
  user: DeepReturnType<GetResult<TContext>>
  users: DeepReturnType<GetResult<TContext>>
}

/* eslint-enable */
// tslint:enable
