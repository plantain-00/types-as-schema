type stringEnum =
  | EnumMember1
  | EnumMember2

type numberEnum =
  | EnumMember1
  | EnumMember2

type numberEnum2 =
  | EnumMember1
  | EnumMember2

type typeLiteral = {
  typeLiteralMember1: float;
  typeLiteralMember2: string;
}

type interface = {
  interfaceMember1: float option;
  interfaceMember2: string option;
}

type typeUnion1 = {
  typeLiteralMember1: float option;
  typeLiteralMember2: string option;
  typeUnionMember1: float option;
  typeUnionMember2: string option;
}

type typeUnion2 = {
  kind: stringEnum;
  typeUnionMember1: string option;
  typeUnionMember2: string option;
}

type typeUnion3 = {
  kind: numberEnum;
  typeUnionMember1: string option;
  typeUnionMember2: string option;
}

type typeUnion4 = {
  kind: string;
  typeUnionMember1: string option;
  typeUnionMember2: string option;
}

type typeUnion = {
  typeUnionMember1: typeUnion1;
  typeUnionMember2: typeUnion2;
  typeUnionMember3: typeUnion3;
  typeUnionMember4: typeUnion4;
  typeUnionMember5: typeUnion5;
}

type interfaceExtends = {
  interfaceExtendsMember1: float;
  interfaceExtendsMember2: string;
  interfaceMember1: float option;
  interfaceMember2: string option;
}

type typeIntersection1 = {
  interfaceMember1: float option;
  interfaceMember2: string option;
  typeIntersectionMember1: float;
  typeIntersectionMember2: string;
}

type typeIntersection2 = {
  typeIntersectionMember1: float;
  typeIntersectionMember2: string;
  typeIntersectionMember3: float;
  typeIntersectionMember4: string;
}

type typeIntersection = {
  typeIntersectionMember1: typeIntersection1;
  typeIntersectionMember2: typeIntersection2;
}

type typeUnionAndIntersection = {
  typeIntersectionMember1: float;
  kind: numberEnum;
  typeUnionMember1: string option;
  typeUnionMember2: string option;
}

type taggedField = {
  taggedFieldMember1: float;
  taggedFieldMember2: string;
}

type enum = {
  stringEnum: string;
  numberEnum: numberEnum;
  numberEnum2: numberEnum2;
}

type numberType = {
  numberMember: float;
  integerMember: int;
  uint32Member: int;
  int32Member: int;
  sint32Member: int;
  fixed32Member: int;
  sfixed32Member: int;
  uint64Member: int;
  int64Member: int;
  sint64Member: int;
  fixed64Member: int;
  sfixed64Member: int;
  floatMember: float;
  doubleMember: float;
}

type stringType = {
  stringMember: string;
}

type arrayType = {
  arrayType1: string list;
  arrayType2: typeLiteral list;
  arrayType4: int list;
}

type mapType = {

}

type parameter = {
  member1: string;
  member2: string;
}

type defaultValue = {
  stringMember: string;
  numberMember: float;
  booleanMember: bool;
}

type entryType = {
  optionalMember: string option;
  booleanMember: bool;
  stringMember: string;
  numberType: numberType;
  arrayType: arrayType;
  referenceType: typeLiteral;
  interfaceType: interface;
  typeUnion: typeUnion;
  interfaceExtends: interfaceExtends;
  typeIntersection: typeIntersection;
  typeUnionAndIntersection: typeUnionAndIntersection;
  mapType: mapType;
  taggedField: taggedField;
  enum: enum;
  stringNumber: stringType;
  id: iD;
  parameter: parameter;
  optionalArrayMember: string list option;
  unionType: string;
  tupleType: string list;
  defaultType: defaultValue;
}
