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
  typeUnionMember7: string;
  typeUnionMember8: typeUnion8;
  typeUnionMember9: typeUnion9;
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
  stringEnum2: string;
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
  titleMember: float;
}

type stringType = {
  stringMember: string;
}

type arrayType = {
  arrayType1: string list;
  arrayType2: typeLiteral list;
  arrayType4: int list;
}

type mapType7 = {
  foo: string;
}

type mapType8 = {

}

type mapType = {
  mapType7: mapType7;
  mapType8: mapType8;
}

type parameter = {
  member1: string;
  member2: string;
}

type defaultValue = {
  stringMember: string;
  numberMember: float;
  booleanMember: bool;
  stringMember2: string;
  stringMember3: string;
  numberMember1: int;
  objectMember2: typeLiteral;
}

type referenceType = {
  typeReferenceMember1: typeLiteral;
  typeReferenceMember2: typeReferenceMember2;
}

type classType1 = {
  classMember1: string;
  classMember2: float;
}

type classType2 = {
  classMember3: string;
  classMember4: float;
  classMember1: string;
  classMember2: float;
}

type classType3 = {
  classMember1: string;
  classMember2: float;
  classMember3: bool;
  classMember4: string;
  classMember5: string list;
}

type classType = {
  classType1: classType1;
  classType2: classType2;
  classType3: classType3;
}

type circular = {
  children: circular list;
}

type entryType = {
  optionalMember: string option;
  booleanMember: bool;
  stringMember: string;
  numberType: numberType;
  arrayType: arrayType;
  referenceType: referenceType;
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
  tupleType: string list;
  defaultType: defaultValue;
  classType: classType;
  circular: circular;
  outerType: outerType;
}

type mutation = {
  create: mutationResult;
}

type createInput = {
  member1: string;
  member2: float;
  member3: createInputMember3;
}

type mutationResult = {
  result: bool;
}

type query = {
  user: getResult;
}

type getResult = {
  result: result;
}

type result = {
  member1: string;
  member2: string;
}

type createInputMember3 = {
  member1: string;
}

type outerType = {
  outerType: float;
}
