// tslint:disable

import { Schema } from 'mongoose'

export const typeLiteralSchema = {
  typeLiteralMember1: {
    type: Schema.Types.Number,
    required: true
  },
  typeLiteralMember2: {
    type: Schema.Types.String,
    required: true
  },
}

export const interfaceSchema = {
  interfaceMember1: {
    type: Schema.Types.Number,
    required: false
  },
  interfaceMember2: {
    type: Schema.Types.String,
    required: false
  },
}

export const typeUnion1Schema = {
  typeLiteralMember1: {
    type: Schema.Types.Number,
    required: false
  },
  typeLiteralMember2: {
    type: Schema.Types.String,
    required: false
  },
  typeUnionMember1: {
    type: Schema.Types.Number,
    required: false
  },
  typeUnionMember2: {
    type: Schema.Types.String,
    required: false
  },
}

export const typeUnion2Schema = {
  kind: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnionMember1: {
    type: Schema.Types.String,
    required: false
  },
  typeUnionMember2: {
    type: Schema.Types.String,
    required: false
  },
}

export const typeUnion3Schema = {
  kind: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnionMember1: {
    type: Schema.Types.String,
    required: false
  },
  typeUnionMember2: {
    type: Schema.Types.String,
    required: false
  },
}

export const typeUnion4Schema = {
  kind: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnionMember1: {
    type: Schema.Types.String,
    required: false
  },
  typeUnionMember2: {
    type: Schema.Types.String,
    required: false
  },
}

export const typeUnionSchema = {
  typeUnionMember1: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnionMember2: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnionMember3: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnionMember4: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnionMember5: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnionMember6: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnionMember7: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnionMember8: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnionMember9: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const interfaceExtendsSchema = {
  interfaceExtendsMember1: {
    type: Schema.Types.Number,
    required: true
  },
  interfaceExtendsMember2: {
    type: Schema.Types.String,
    required: true
  },
  interfaceMember1: {
    type: Schema.Types.Number,
    required: false
  },
  interfaceMember2: {
    type: Schema.Types.String,
    required: false
  },
}

export const typeIntersection1Schema = {
  interfaceMember1: {
    type: Schema.Types.Number,
    required: false
  },
  interfaceMember2: {
    type: Schema.Types.String,
    required: false
  },
  typeIntersectionMember1: {
    type: Schema.Types.Number,
    required: true
  },
  typeIntersectionMember2: {
    type: Schema.Types.String,
    required: true
  },
}

export const typeIntersection2Schema = {
  typeIntersectionMember1: {
    type: Schema.Types.Number,
    required: true
  },
  typeIntersectionMember2: {
    type: Schema.Types.String,
    required: true
  },
  typeIntersectionMember3: {
    type: Schema.Types.Number,
    required: true
  },
  typeIntersectionMember4: {
    type: Schema.Types.String,
    required: true
  },
}

export const typeIntersectionSchema = {
  typeIntersectionMember1: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeIntersectionMember2: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeIntersectionMember3: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const typeUnionAndIntersectionSchema = {
  typeIntersectionMember1: {
    type: Schema.Types.Number,
    required: true
  },
  kind: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnionMember1: {
    type: Schema.Types.String,
    required: false
  },
  typeUnionMember2: {
    type: Schema.Types.String,
    required: false
  },
}

export const taggedFieldSchema = {
  taggedFieldMember1: {
    type: Schema.Types.Number,
    required: true
  },
  taggedFieldMember2: {
    type: Schema.Types.String,
    required: true
  },
}

export const enumSchema = {
  stringEnum: {
    type: Schema.Types.Mixed,
    required: true
  },
  numberEnum: {
    type: Schema.Types.Mixed,
    required: true
  },
  numberEnum2: {
    type: Schema.Types.Mixed,
    required: true
  },
  stringEnum2: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const numberTypeSchema = {
  numberMember: {
    type: Schema.Types.Number,
    required: true
  },
  integerMember: {
    type: Schema.Types.Number,
    required: true
  },
  uint32Member: {
    type: Schema.Types.Number,
    required: true
  },
  int32Member: {
    type: Schema.Types.Number,
    required: true
  },
  sint32Member: {
    type: Schema.Types.Number,
    required: true
  },
  fixed32Member: {
    type: Schema.Types.Number,
    required: true
  },
  sfixed32Member: {
    type: Schema.Types.Number,
    required: true
  },
  uint64Member: {
    type: Schema.Types.Number,
    required: true
  },
  int64Member: {
    type: Schema.Types.Number,
    required: true
  },
  sint64Member: {
    type: Schema.Types.Number,
    required: true
  },
  fixed64Member: {
    type: Schema.Types.Number,
    required: true
  },
  sfixed64Member: {
    type: Schema.Types.Number,
    required: true
  },
  floatMember: {
    type: Schema.Types.Number,
    required: true
  },
  doubleMember: {
    type: Schema.Types.Number,
    required: true
  },
  titleMember: {
    type: Schema.Types.Number,
    required: true
  },
}

export const stringTypeSchema = {
  stringMember: {
    type: Schema.Types.String,
    required: true
  },
}

export const arrayTypeSchema = {
  arrayType1: {
    type: Schema.Types.Mixed,
    required: true
  },
  arrayType2: {
    type: Schema.Types.Mixed,
    required: true
  },
  arrayType3: {
    type: Schema.Types.Mixed,
    required: true
  },
  arrayType4: {
    type: Schema.Types.Mixed,
    required: true
  },
  arrayType5: {
    type: Schema.Types.Mixed,
    required: true
  },
  arrayType6: {
    type: Schema.Types.Mixed,
    required: true
  },
  arrayType7: {
    type: Schema.Types.Mixed,
    required: true
  },
  arrayType8: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const mapType7Schema = {
  foo: {
    type: Schema.Types.String,
    required: true
  },
}

export const mapType8Schema = {

}

export const mapTypeSchema = {
  mapType: {
    type: Schema.Types.Mixed,
    required: true
  },
  mapType2: {
    type: Schema.Types.Mixed,
    required: true
  },
  mapType3: {
    type: Schema.Types.Mixed,
    required: true
  },
  mapType4: {
    type: Schema.Types.Mixed,
    required: true
  },
  mapType5: {
    type: Schema.Types.Mixed,
    required: true
  },
  mapType6: {
    type: Schema.Types.Mixed,
    required: true
  },
  mapType7: {
    type: Schema.Types.Mixed,
    required: true
  },
  mapType8: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const parameterSchema = {
  member1: {
    type: Schema.Types.String,
    required: true
  },
  member2: {
    type: Schema.Types.String,
    required: true
  },
}

export const defaultValueSchema = {
  stringMember: {
    type: Schema.Types.String,
    required: true
  },
  numberMember: {
    type: Schema.Types.Number,
    required: true
  },
  booleanMember: {
    type: Schema.Types.Boolean,
    required: true
  },
  stringMember2: {
    type: Schema.Types.String,
    required: true
  },
  stringMember3: {
    type: Schema.Types.String,
    required: true
  },
  arrayMember: {
    type: Schema.Types.Mixed,
    required: true
  },
  objectMember: {
    type: Schema.Types.Mixed,
    required: true
  },
  numberMember1: {
    type: Schema.Types.Number,
    required: true
  },
  objectMember2: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const referenceTypeSchema = {
  typeReferenceMember1: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeReferenceMember2: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const classType1Schema = {
  classMember1: {
    type: Schema.Types.String,
    required: true
  },
  classMember2: {
    type: Schema.Types.Number,
    required: true
  },
}

export const classType2Schema = {
  classMember3: {
    type: Schema.Types.String,
    required: true
  },
  classMember4: {
    type: Schema.Types.Number,
    required: true
  },
  classMember1: {
    type: Schema.Types.String,
    required: true
  },
  classMember2: {
    type: Schema.Types.Number,
    required: true
  },
}

export const classType3Schema = {
  classMember1: {
    type: Schema.Types.String,
    required: true
  },
  classMember2: {
    type: Schema.Types.Number,
    required: true
  },
  classMember3: {
    type: Schema.Types.Boolean,
    required: true
  },
  classMember4: {
    type: Schema.Types.String,
    required: true
  },
  classMember5: {
    type: Schema.Types.Mixed,
    required: true
  },
  classMember6: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const classTypeSchema = {
  classType1: {
    type: Schema.Types.Mixed,
    required: true
  },
  classType2: {
    type: Schema.Types.Mixed,
    required: true
  },
  classType3: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const circularSchema = {
  children: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const entryTypeSchema = {
  optionalMember: {
    type: Schema.Types.String,
    required: false
  },
  booleanMember: {
    type: Schema.Types.Boolean,
    required: true
  },
  stringMember: {
    type: Schema.Types.String,
    required: true
  },
  numberType: {
    type: Schema.Types.Mixed,
    required: true
  },
  arrayType: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeLiteral: {
    type: Schema.Types.Mixed,
    required: true
  },
  referenceType: {
    type: Schema.Types.Mixed,
    required: true
  },
  interfaceType: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnion: {
    type: Schema.Types.Mixed,
    required: true
  },
  interfaceExtends: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeIntersection: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnionAndIntersection: {
    type: Schema.Types.Mixed,
    required: true
  },
  mapType: {
    type: Schema.Types.Mixed,
    required: true
  },
  taggedField: {
    type: Schema.Types.Mixed,
    required: true
  },
  enum: {
    type: Schema.Types.Mixed,
    required: true
  },
  stringNumber: {
    type: Schema.Types.Mixed,
    required: true
  },
  id: {
    type: Schema.Types.Mixed,
    required: true
  },
  parameter: {
    type: Schema.Types.Mixed,
    required: true
  },
  optionalArrayMember: {
    type: Schema.Types.Mixed,
    required: false
  },
  tupleType: {
    type: Schema.Types.Mixed,
    required: true
  },
  defaultType: {
    type: Schema.Types.Mixed,
    required: true
  },
  anyType: {
    type: Schema.Types.Mixed,
    required: true
  },
  classType: {
    type: Schema.Types.Mixed,
    required: true
  },
  circular: {
    type: Schema.Types.Mixed,
    required: true
  },
  outerType: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeAlias: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const mutationSchema = {
  create: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const createInputSchema = {
  member1: {
    type: Schema.Types.String,
    required: true
  },
  member2: {
    type: Schema.Types.Number,
    required: true
  },
  member3: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const mutationResultSchema = {
  result: {
    type: Schema.Types.Boolean,
    required: true
  },
}

export const querySchema = {
  user: {
    type: Schema.Types.Mixed,
    required: true
  },
  users: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const getResultSchema = {
  result: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const resultSchema = {
  member1: {
    type: Schema.Types.String,
    required: true
  },
  member2: {
    type: Schema.Types.String,
    required: true
  },
}

export const createInputMember3Schema = {
  member1: {
    type: Schema.Types.String,
    required: true
  },
}

export const typeAliasSchema = {
  result: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const result3Schema = {
  result3: {
    type: Schema.Types.String,
    required: true
  },
}

export const petSchema = {
  id: {
    type: Schema.Types.Number,
    required: false
  },
  name: {
    type: Schema.Types.String,
    required: true
  },
  photoUrls: {
    type: Schema.Types.Mixed,
    required: true
  },
  status: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const outerTypeSchema = {
  outerType: {
    type: Schema.Types.Number,
    required: true
  },
}
