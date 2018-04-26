type stringEnum =
  | EnumMember1
  | EnumMember2;

type numberEnum =
  | EnumMember1
  | EnumMember2;

type numberEnum2 =
  | EnumMember1
  | EnumMember2;

type typeLiteral = {
  .
  typeLiteralMember1: float,
  typeLiteralMember2: string,
};

type interface = {
  .
  interfaceMember1: option(float),
  interfaceMember2: option(string),
};

type typeUnion1 = {
  .
  typeLiteralMember1: option(float),
  typeLiteralMember2: option(string),
  typeUnionMember1: option(float),
  typeUnionMember2: option(string),
};

type typeUnion2 = {
  .
  kind: stringEnum,
  typeUnionMember1: option(string),
  typeUnionMember2: option(string),
};

type typeUnion3 = {
  .
  kind: numberEnum,
  typeUnionMember1: option(string),
  typeUnionMember2: option(string),
};

type typeUnion4 = {
  .
  kind: string,
  typeUnionMember1: option(string),
  typeUnionMember2: option(string),
};

type typeUnion = {
  .
  typeUnionMember1: typeUnion1,
  typeUnionMember2: typeUnion2,
  typeUnionMember3: typeUnion3,
  typeUnionMember4: typeUnion4,
};

type interfaceExtends = {
  .
  interfaceExtendsMember1: float,
  interfaceExtendsMember2: string,
  interfaceMember1: option(float),
  interfaceMember2: option(string),
};

type typeIntersection1 = {
  .
  interfaceMember1: option(float),
  interfaceMember2: option(string),
  typeIntersectionMember1: float,
  typeIntersectionMember2: string,
};

type typeIntersection2 = {
  .
  typeIntersectionMember1: float,
  typeIntersectionMember2: string,
  typeIntersectionMember3: float,
  typeIntersectionMember4: string,
};

type typeIntersection = {
  .
  typeIntersectionMember1: typeIntersection1,
  typeIntersectionMember2: typeIntersection2,
};

type typeUnionAndIntersection = {
  .
  typeIntersectionMember1: float,
  kind: numberEnum,
  typeUnionMember1: option(string),
  typeUnionMember2: option(string),
};

type taggedField = {
  .
  taggedFieldMember1: float,
  taggedFieldMember2: string,
};

type enum = {
  .
  stringEnum: string,
  numberEnum: numberEnum,
  numberEnum2: numberEnum2,
};

type numberType = {
  .
  numberMember: float,
  integerMember: int,
  uint32Member: int,
  int32Member: int,
  sint32Member: int,
  fixed32Member: int,
  sfixed32Member: int,
  uint64Member: int,
  int64Member: int,
  sint64Member: int,
  fixed64Member: int,
  sfixed64Member: int,
  floatMember: float,
  doubleMember: float,
};

type stringType = {
  .
  stringMember: string,
};

type arrayType = {
  .
  arrayType1: list(string),
  arrayType2: list(typeLiteral),
  arrayType4: list(int),
};

type mapType = {
  .

};

type parameter = {
  .
  member1: string,
  member2: string,
};

type entryType = {
  .
  optionalMember: option(string),
  booleanMember: bool,
  stringMember: string,
  numberType: numberType,
  arrayType: arrayType,
  referenceType: typeLiteral,
  interfaceType: interface,
  typeUnion: typeUnion,
  interfaceExtends: interfaceExtends,
  typeIntersection: typeIntersection,
  typeUnionAndIntersection: typeUnionAndIntersection,
  mapType: mapType,
  taggedField: taggedField,
  enum: enum,
  stringNumber: stringType,
  id: iD,
  parameter: parameter,
  optionalArrayMember: option(list(string)),
  unionType: string,
  tupleType: list(string),
};
