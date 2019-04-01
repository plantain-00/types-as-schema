/**
 * This file is generated by 'types-as-schema'
 * It is not mean to be edited by hand
 */
// tslint:disable

import { GraphQLResolveInfo } from 'graphql'

import { StringEnum, NumberEnum, NumberEnum2, TypeUnion9 } from './cases'

export type DeepPromisifyReturnType<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? Array<DeepPromisifyReturnType<U>>
    : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPromisifyReturnType<U>>
      : T[P] extends (...args: infer P) => infer R
        ? (...args: P) => R | Promise<R>
        : DeepPromisifyReturnType<T[P]>
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

export interface Root<TContext = any> {
  create(input: { input: CreateInput<TContext> }, context: TContext, info: GraphQLResolveInfo): DeepPromisifyReturnType<MutationResult<TContext>> | Promise<DeepPromisifyReturnType<MutationResult<TContext>>>
  user(input: { id: string }, context: TContext, info: GraphQLResolveInfo): DeepPromisifyReturnType<GetResult<TContext>> | Promise<DeepPromisifyReturnType<GetResult<TContext>>>
  users(input: {}, context: TContext, info: GraphQLResolveInfo): DeepPromisifyReturnType<GetResult<TContext>> | Promise<DeepPromisifyReturnType<GetResult<TContext>>>
}

export interface TypeLiteral<TContext = any> {
  typeLiteralMember1: number
  typeLiteralMember2: string
}

export interface Interface<TContext = any> {
  interfaceMember1?: number
  interfaceMember2?: string
}

export interface TypeUnion1<TContext = any> {
  typeLiteralMember1?: number
  typeLiteralMember2?: string
  typeUnionMember1?: number
  typeUnionMember2?: string
}

export interface TypeUnion2<TContext = any> {
  kind: StringEnum
  typeUnionMember1?: string
  typeUnionMember2?: string
}

export interface TypeUnion3<TContext = any> {
  kind: NumberEnum
  typeUnionMember1?: string
  typeUnionMember2?: string
}

export interface TypeUnion4<TContext = any> {
  kind: string
  typeUnionMember1?: string
  typeUnionMember2?: string
}

export type TypeUnion5<TContext = any> = TypeLiteral<TContext> | Interface<TContext>

export type TypeUnion8<TContext = any> = string | string | null | boolean

export interface TypeUnion<TContext = any> {
  typeUnionMember1: TypeUnion1<TContext>
  typeUnionMember2: TypeUnion2<TContext>
  typeUnionMember3: TypeUnion3<TContext>
  typeUnionMember4: TypeUnion4<TContext>
  typeUnionMember5: TypeUnion5<TContext>
  typeUnionMember6: string | null | boolean
  typeUnionMember7: string
  typeUnionMember8: TypeUnion8<TContext>
  typeUnionMember9: TypeUnion9
}

export interface InterfaceExtends<TContext = any> {
  interfaceExtendsMember1: number
  interfaceExtendsMember2: string
  interfaceMember1?: number
  interfaceMember2?: string
}

export interface TypeIntersection1<TContext = any> {
  interfaceMember1?: number
  interfaceMember2?: string
  typeIntersectionMember1: number
  typeIntersectionMember2: string
}

export interface TypeIntersection2<TContext = any> {
  typeIntersectionMember1: number
  typeIntersectionMember2: string
  typeIntersectionMember3: number
  typeIntersectionMember4: string
}

export interface TypeIntersection<TContext = any> {
  typeIntersectionMember1: TypeIntersection1<TContext>
  typeIntersectionMember2: TypeIntersection2<TContext>
  typeIntersectionMember3: any
}

export interface TypeUnionAndIntersection<TContext = any> {
  typeIntersectionMember1: number
  kind: NumberEnum
  typeUnionMember1?: string
  typeUnionMember2?: string
}

export interface TaggedField<TContext = any> {
  taggedFieldMember1: number
  taggedFieldMember2: string
}

export interface Enum<TContext = any> {
  stringEnum: StringEnum
  numberEnum: NumberEnum
  numberEnum2: NumberEnum2
  stringEnum2: string
}

export interface NumberType<TContext = any> {
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

export interface StringType<TContext = any> {
  stringMember: string
}

export interface ArrayType<TContext = any> {
  arrayType1: Array<string>
  arrayType2: Array<TypeLiteral<TContext>>
  arrayType3: Array<object>
  arrayType4: Array<number>
  arrayType5: Array<object>
  arrayType6: Array<object>
  arrayType7: Array<object>
  arrayType8: Array<object>
  arrayType9: Array<string>
}

export interface MapType7<TContext = any> {
  foo: string
}

export interface MapType8<TContext = any> {

}

export interface MapType<TContext = any> {
  mapType: { [name: string]: number }
  mapType2: { [name: string]: TypeLiteral<TContext> }
  mapType3: { [name: string]: object }
  mapType4: { [name: string]: number }
  mapType5: { [name: string]: any }
  mapType6: object
  mapType7: MapType7<TContext>
  mapType8: MapType8<TContext>
}

export interface Parameter<TContext = any> {
  member1(input: { name: string, age: number }, context: TContext, info: GraphQLResolveInfo): string | Promise<string>
  member2(input: { name?: string }, context: TContext, info: GraphQLResolveInfo): string | Promise<string>
}

export interface DefaultValue<TContext = any> {
  stringMember: string
  numberMember: number
  booleanMember: boolean
  stringMember2: string
  stringMember3: string
  arrayMember: Array<any>
  objectMember: object
  numberMember1: number
  objectMember2: TypeLiteral<TContext>
}

export type TypeReferenceMember2<TContext = any> = TypeLiteral<TContext>

export interface ReferenceType<TContext = any> {
  typeReferenceMember1: TypeLiteral<TContext>
  typeReferenceMember2: TypeReferenceMember2<TContext>
}

export interface ClassType1<TContext = any> {
  classMember1: string
  classMember2: number
}

export interface ClassType2<TContext = any> {
  classMember3: string
  classMember4: number
  classMember1: string
  classMember2: number
}

export interface ClassType3<TContext = any> {
  classMember1: string
  classMember2: number
  classMember3: boolean
  classMember4: string
  classMember5: Array<string>
  classMember6: object
}

export interface ClassType<TContext = any> {
  classType1: ClassType1<TContext>
  classType2: ClassType2<TContext>
  classType3: ClassType3<TContext>
}

export interface Circular<TContext = any> {
  children: Array<Circular<TContext>>
}

export interface EntryType<TContext = any> {
  optionalMember?: string
  booleanMember: boolean
  stringMember: string
  numberType: NumberType<TContext>
  arrayType: ArrayType<TContext>
  typeLiteral: object
  referenceType: ReferenceType<TContext>
  interfaceType: Interface<TContext>
  typeUnion: TypeUnion<TContext>
  interfaceExtends: InterfaceExtends<TContext>
  typeIntersection: TypeIntersection<TContext>
  typeUnionAndIntersection: TypeUnionAndIntersection<TContext>
  mapType: MapType<TContext>
  taggedField: TaggedField<TContext>
  enum: Enum<TContext>
  stringNumber: StringType<TContext>
  id: ID<TContext>
  parameter: Parameter<TContext>
  optionalArrayMember?: Array<string>
  tupleType: Array<string>
  defaultType: DefaultValue<TContext>
  anyType: any
  classType: ClassType<TContext>
  circular: Circular<TContext>
  outerType: OuterType<TContext>
  typeAlias: TypeAlias<TContext>
  pick: Pick<TContext>
}

export interface CreateInput<TContext = any> {
  member1: string
  member2: number
  member3: CreateInputMember3<TContext>
}

export interface MutationResult<TContext = any> {
  result: boolean
}

export interface GetResult<TContext = any> {
  result: Result<TContext>
}

export interface Result<TContext = any> {
  member1: string
  member2(input: { input: string }, context: TContext, info: GraphQLResolveInfo): string | Promise<string>
}

export interface CreateInputMember3<TContext = any> {
  member1: string
}

export interface TypeAlias<TContext = any> {
  result: Result2<TContext>
}

export type Result2<TContext = any> = Result3<TContext>

export interface Result3<TContext = any> {
  result3: string
}

export interface Pet<TContext = any> {
  id?: number
  name: string
  photoUrls: Array<string>
  status: string
}

export interface MongooseScheme<TContext = any> {
  objectId: ObjectId<TContext>
  date: Date<TContext>
  decimal128: Decimal128<TContext>
  index1: string
  index2: string
  index3: string
  buffer: Buffer<TContext>
}

export interface OuterType<TContext = any> {
  outerType: number
}

export interface ApolloResolvers<TContext = any> {
  TypeLiteral?: {
    typeLiteralMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeLiteralMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  Interface?: {
    interfaceMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    interfaceMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  TypeUnion1?: {
    typeLiteralMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeLiteralMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  TypeUnion2?: {
    kind?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  TypeUnion3?: {
    kind?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  TypeUnion4?: {
    kind?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  TypeUnion?: {
    typeUnionMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember3?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember4?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember5?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember6?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember7?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember8?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember9?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  InterfaceExtends?: {
    interfaceExtendsMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    interfaceExtendsMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    interfaceMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    interfaceMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  TypeIntersection1?: {
    interfaceMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    interfaceMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeIntersectionMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeIntersectionMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  TypeIntersection2?: {
    typeIntersectionMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeIntersectionMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeIntersectionMember3?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeIntersectionMember4?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  TypeIntersection?: {
    typeIntersectionMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeIntersectionMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeIntersectionMember3?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  TypeUnionAndIntersection?: {
    typeIntersectionMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    kind?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  TaggedField?: {
    taggedFieldMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    taggedFieldMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  Enum?: {
    stringEnum?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    numberEnum?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    numberEnum2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    stringEnum2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  NumberType?: {
    numberMember?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    integerMember?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    uint32Member?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    int32Member?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    sint32Member?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    fixed32Member?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    sfixed32Member?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    uint64Member?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    int64Member?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    sint64Member?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    fixed64Member?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    sfixed64Member?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    floatMember?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    doubleMember?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    titleMember?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  StringType?: {
    stringMember?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  ArrayType?: {
    arrayType1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    arrayType2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    arrayType3?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    arrayType4?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    arrayType5?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    arrayType6?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    arrayType7?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    arrayType8?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    arrayType9?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  MapType7?: {
    foo?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  MapType8?: {

  },
  MapType?: {
    mapType?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    mapType2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    mapType3?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    mapType4?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    mapType5?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    mapType6?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    mapType7?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    mapType8?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  Parameter?: {
    member1?(parent: any, input: { name: string, age: number }, context: TContext, info: GraphQLResolveInfo): any,
    member2?(parent: any, input: { name?: string }, context: TContext, info: GraphQLResolveInfo): any,
  },
  DefaultValue?: {
    stringMember?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    numberMember?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    booleanMember?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    stringMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    stringMember3?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    arrayMember?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    objectMember?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    numberMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    objectMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  ReferenceType?: {
    typeReferenceMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeReferenceMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  ClassType1?: {
    classMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    classMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  ClassType2?: {
    classMember3?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    classMember4?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    classMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    classMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  ClassType3?: {
    classMember1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    classMember2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    classMember3?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    classMember4?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    classMember5?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    classMember6?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  ClassType?: {
    classType1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    classType2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    classType3?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  Circular?: {
    children?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  EntryType?: {
    optionalMember?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    booleanMember?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    stringMember?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    numberType?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    arrayType?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeLiteral?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    referenceType?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    interfaceType?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnion?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    interfaceExtends?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeIntersection?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeUnionAndIntersection?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    mapType?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    taggedField?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    enum?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    stringNumber?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    id?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    parameter?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    optionalArrayMember?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    tupleType?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    defaultType?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    anyType?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    classType?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    circular?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    outerType?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    typeAlias?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    pick?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  Mutation: {
    create(parent: any, input: { input: CreateInput<TContext> }, context: TContext, info: GraphQLResolveInfo): any,
  },
  CreateInput?: {
    member1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    member2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    member3?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  MutationResult?: {
    result?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  Query: {
    user(parent: any, input: { id: string }, context: TContext, info: GraphQLResolveInfo): any,
    users(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  GetResult?: {
    result?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  Result?: {
    member1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    member2?(parent: any, input: { input: string }, context: TContext, info: GraphQLResolveInfo): any,
  },
  CreateInputMember3?: {
    member1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  TypeAlias?: {
    result?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  Result3?: {
    result3?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  Pet?: {
    id?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    name?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    photoUrls?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    status?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  MongooseScheme?: {
    objectId?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    date?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    decimal128?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    index1?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    index2?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    index3?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
    buffer?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
  OuterType?: {
    outerType?(parent: any, input: {}, context: TContext, info: GraphQLResolveInfo): any,
  },
}

export interface ResolveResult<TContext = any> {
  create: DeepReturnType<MutationResult<TContext>>
  user: DeepReturnType<GetResult<TContext>>
  users: DeepReturnType<GetResult<TContext>>
}

// tslint:enable
