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
  typeUnionMember5: typeUnion5,
  typeUnionMember7: string,
  typeUnionMember8: typeUnion8,
  typeUnionMember9: typeUnion9,
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
  stringEnum2: string,
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
  titleMember: float,
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
  arrayType9: list(string),
  arrayType10: list(string),
};

type mapType7 = {
  .
  foo: string,
};

type mapType8 = {
  .

};

type mapType = {
  .
  mapType7: mapType7,
  mapType8: mapType8,
};

type parameter = {
  .
  member1: string,
  member2: string,
};

type defaultValue = {
  .
  stringMember: string,
  numberMember: float,
  booleanMember: bool,
  stringMember2: string,
  stringMember3: string,
  numberMember1: int,
  objectMember2: typeLiteral,
};

type referenceType = {
  .
  typeReferenceMember1: typeLiteral,
  typeReferenceMember2: typeReferenceMember2,
};

type classType1 = {
  .
  classMember1: string,
  classMember2: float,
};

type classType2 = {
  .
  classMember3: string,
  classMember4: float,
  classMember1: string,
  classMember2: float,
};

type classType3 = {
  .
  classMember1: string,
  classMember2: float,
  classMember3: bool,
  classMember4: string,
  classMember5: list(string),
};

type classType = {
  .
  classType1: classType1,
  classType2: classType2,
  classType3: classType3,
};

type circular = {
  .
  children: list(circular),
};

type typeAlias = {
  .
  result: result2,
};

type createInput = {
  .
  member1: string,
  member2: float,
  member3: createInputMember3,
};

type entryType = {
  .
  optionalMember: option(string),
  booleanMember: bool,
  stringMember: string,
  numberType: numberType,
  arrayType: arrayType,
  referenceType: referenceType,
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
  tupleType: list(string),
  defaultType: defaultValue,
  classType: classType,
  circular: circular,
  outerType: outerType,
  typeAlias: typeAlias,
  pick3: createInput2,
  unknown: layoutMetadataMap,
};

type mutation = {
  .
  create: mutationResult,
};

type mutationResult = {
  .
  result: bool,
};

type query = {
  .
  user: getResult,
  users: getResult,
};

type getResult = {
  .
  result: result,
};

type result = {
  .
  member1: string,
  member2: string,
};

type createInputMember3 = {
  .
  member1: string,
};

type result3 = {
  .
  result3: string,
};

type pet = {
  .
  id: option(float),
  name: string,
  photoUrls: list(string),
  status: string,
};

type mongooseScheme = {
  .
  objectId: objectId,
  date: date,
  decimal128: decimal128,
  index1: string,
  index2: string,
  index3: string,
  buffer: buffer,
};

type createInput2 = {
  .
  member1: string,
  member2: float,
};

type layoutMetadataMap = {
  .

};

type metadata = {
  .

};
