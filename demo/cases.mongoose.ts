// tslint:disable

import { Schema } from 'mongoose'

export const typeLiteralSchema = {
  typeLiteralMember1: {
    type: Number,
    required: true
  },
  typeLiteralMember2: {
    type: String,
    required: true
  },
}

export const interfaceSchema = {
  interfaceMember1: {
    type: Number,
    required: false
  },
  interfaceMember2: {
    type: String,
    required: false
  },
}

export const typeUnion1Schema = {
  typeLiteralMember1: {
    type: Number,
    required: false
  },
  typeLiteralMember2: {
    type: String,
    required: false
  },
  typeUnionMember1: {
    type: Number,
    required: false
  },
  typeUnionMember2: {
    type: String,
    required: false
  },
}

export const typeUnion2Schema = {
  kind: {
    type: Schema.Types.Mixed,
    required: true,
    enum: ["enum member 1", "enum member 2"]
  },
  typeUnionMember1: {
    type: String,
    required: false
  },
  typeUnionMember2: {
    type: String,
    required: false
  },
}

export const typeUnion3Schema = {
  kind: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnionMember1: {
    type: String,
    required: false
  },
  typeUnionMember2: {
    type: String,
    required: false
  },
}

export const typeUnion4Schema = {
  kind: {
    type: Schema.Types.Mixed,
    required: true,
    enum: ["foo", "bar"]
  },
  typeUnionMember1: {
    type: String,
    required: false
  },
  typeUnionMember2: {
    type: String,
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
    required: true,
    enum: ["foo", "bar"]
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
    type: Number,
    required: true
  },
  interfaceExtendsMember2: {
    type: String,
    required: true
  },
  interfaceMember1: {
    type: Number,
    required: false
  },
  interfaceMember2: {
    type: String,
    required: false
  },
}

export const typeIntersection1Schema = {
  interfaceMember1: {
    type: Number,
    required: false
  },
  interfaceMember2: {
    type: String,
    required: false
  },
  typeIntersectionMember1: {
    type: Number,
    required: true
  },
  typeIntersectionMember2: {
    type: String,
    required: true
  },
}

export const typeIntersection2Schema = {
  typeIntersectionMember1: {
    type: Number,
    required: true
  },
  typeIntersectionMember2: {
    type: String,
    required: true
  },
  typeIntersectionMember3: {
    type: Number,
    required: true
  },
  typeIntersectionMember4: {
    type: String,
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
    type: Number,
    required: true
  },
  kind: {
    type: Schema.Types.Mixed,
    required: true
  },
  typeUnionMember1: {
    type: String,
    required: false
  },
  typeUnionMember2: {
    type: String,
    required: false
  },
}

export const taggedFieldSchema = {
  taggedFieldMember1: {
    type: Number,
    required: true
  },
  taggedFieldMember2: {
    type: String,
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
    required: true,
    enum: ["foo"]
  },
}

export const numberTypeSchema = {
  numberMember: {
    type: Number,
    required: true,
    min: 70,
    max: 90
  },
  integerMember: {
    type: Number,
    required: true
  },
  uint32Member: {
    type: Number,
    required: true
  },
  int32Member: {
    type: Number,
    required: true
  },
  sint32Member: {
    type: Number,
    required: true
  },
  fixed32Member: {
    type: Number,
    required: true
  },
  sfixed32Member: {
    type: Number,
    required: true
  },
  uint64Member: {
    type: Number,
    required: true
  },
  int64Member: {
    type: Number,
    required: true
  },
  sint64Member: {
    type: Number,
    required: true
  },
  fixed64Member: {
    type: Number,
    required: true
  },
  sfixed64Member: {
    type: Number,
    required: true
  },
  floatMember: {
    type: Number,
    required: true
  },
  doubleMember: {
    type: Number,
    required: true
  },
  titleMember: {
    type: Number,
    required: true
  },
}

export const stringTypeSchema = {
  stringMember: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 20,
    match: "^[A-z]{3}$"
  },
}

export const arrayTypeSchema = {
  arrayType1: {
    type: [
      {
        type: String,
        required: true,
        minLength: 10,
        maxLength: 20,
        match: "^[A-z]{3}$"
      }
    ],
    required: true
  },
  arrayType2: {
    type: [
      {
        type: Schema.Types.Mixed,
        required: true
      }
    ],
    required: true
  },
  arrayType3: {
    type: [
      {
        type: Schema.Types.Mixed,
        required: true
      }
    ],
    required: true
  },
  arrayType4: {
    type: [
      {
        type: Number,
        required: true,
        min: 100,
        max: 200
      }
    ],
    required: true
  },
  arrayType5: {
    type: [
      {
        type: Schema.Types.Mixed,
        required: true
      }
    ],
    required: true
  },
  arrayType6: {
    type: [
      {
        type: Schema.Types.Mixed,
        required: true
      }
    ],
    required: true
  },
  arrayType7: {
    type: [
      {
        type: Schema.Types.Mixed,
        required: true
      }
    ],
    required: true
  },
  arrayType8: {
    type: [
      {
        type: Schema.Types.Mixed,
        required: true
      }
    ],
    required: true
  },
  arrayType9: {
    type: [
      {
        type: String,
        required: true
      }
    ],
    required: true
  },
}

export const mapType7Schema = {
  foo: {
    type: String,
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
    type: String,
    required: true
  },
  member2: {
    type: String,
    required: true
  },
}

export const defaultValueSchema = {
  stringMember: {
    type: String,
    required: true,
    default: "foo"
  },
  numberMember: {
    type: Number,
    required: true,
    default: 123
  },
  booleanMember: {
    type: Boolean,
    required: true
  },
  stringMember2: {
    type: String,
    required: true,
    default: "foo bar"
  },
  stringMember3: {
    type: String,
    required: true,
    default: ""
  },
  arrayMember: {
    type: [
      {
        type: Schema.Types.Mixed,
        required: true
      }
    ],
    required: true
  },
  objectMember: {
    type: Schema.Types.Mixed,
    required: true
  },
  numberMember1: {
    type: Number,
    required: true,
    default: 123
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
    type: String,
    required: true
  },
  classMember2: {
    type: Number,
    required: true
  },
}

export const classType2Schema = {
  classMember3: {
    type: String,
    required: true
  },
  classMember4: {
    type: Number,
    required: true
  },
  classMember1: {
    type: String,
    required: true
  },
  classMember2: {
    type: Number,
    required: true
  },
}

export const classType3Schema = {
  classMember1: {
    type: String,
    required: true,
    default: "foo"
  },
  classMember2: {
    type: Number,
    required: true,
    default: 123
  },
  classMember3: {
    type: Boolean,
    required: true
  },
  classMember4: {
    type: String,
    required: true,
    default: "foo"
  },
  classMember5: {
    type: [
      {
        type: String,
        required: true
      }
    ],
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
    type: [
      {
        type: Schema.Types.Mixed,
        required: true
      }
    ],
    required: true
  },
}

export const entryTypeSchema = {
  optionalMember: {
    type: String,
    required: false
  },
  booleanMember: {
    type: Boolean,
    required: true
  },
  stringMember: {
    type: String,
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
    type: [
      {
        type: String,
        required: true
      }
    ],
    required: false
  },
  tupleType: {
    type: [
      {
        type: String,
        required: true
      }
    ],
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
    type: String,
    required: true
  },
  member2: {
    type: Number,
    required: true
  },
  member3: {
    type: Schema.Types.Mixed,
    required: true
  },
}

export const mutationResultSchema = {
  result: {
    type: Boolean,
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
    type: String,
    required: true
  },
  member2: {
    type: String,
    required: true
  },
}

export const createInputMember3Schema = {
  member1: {
    type: String,
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
    type: String,
    required: true
  },
}

export const petSchema = {
  id: {
    type: Number,
    required: false
  },
  name: {
    type: String,
    required: true
  },
  photoUrls: {
    type: [
      {
        type: String,
        required: true
      }
    ],
    required: true
  },
  status: {
    type: Schema.Types.Mixed,
    required: true,
    enum: ["available", "pending", "sold"]
  },
}

export const mongooseSchemeSchema = {
  objectId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  decimal128: {
    type: Schema.Types.Decimal128,
    required: true
  },
  index1: {
    type: String,
    required: true,
    index: true
  },
  index2: {
    type: String,
    required: true,
    unique: true
  },
  index3: {
    type: String,
    required: true,
    sparse: true
  },
}

export const outerTypeSchema = {
  outerType: {
    type: Number,
    required: true
  },
}
