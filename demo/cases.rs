extern crate serde;

pub use self::serde::ser::{Serialize, Serializer};
pub use self::serde::de::{Deserialize, Deserializer, Error};

#[derive(Debug)]
pub enum StringEnum {
  EnumMember1,
  EnumMember2,
}

impl Serialize for StringEnum {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    serializer.serialize_str(match *self {
      StringEnum::EnumMember1 => "enum member 1",
      StringEnum::EnumMember2 => "enum member 2",
    })
  }
}

impl<'de> Deserialize<'de> for StringEnum {
  fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
  where
    D: Deserializer<'de>,
  {
    let s = String::deserialize(deserializer)?;
    match s.as_str() {
      "enum member 1" => Ok(StringEnum::EnumMember1),
      "enum member 2" => Ok(StringEnum::EnumMember2),
      _ => Err(Error::custom("wrong enum value.")),
    }
  }
}

#[derive(Serialize, Deserialize, Debug)]
pub enum NumberEnum {
  EnumMember1 = 0,
  EnumMember2 = 1,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum NumberEnum2 {
  EnumMember1 = 3,
  EnumMember2 = 4,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TypeLiteral {
  #[serde(rename = "typeLiteralMember1")] pub type_literal_member_1: f32,
  #[serde(rename = "typeLiteralMember2")] pub type_literal_member_2: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Interface {
  #[serde(rename = "interfaceMember1")] pub interface_member_1: Option<f32>,
  #[serde(rename = "interfaceMember2")] pub interface_member_2: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TypeUnion1 {
  #[serde(rename = "typeLiteralMember1")] pub type_literal_member_1: Option<f32>,
  #[serde(rename = "typeLiteralMember2")] pub type_literal_member_2: Option<String>,
  #[serde(rename = "typeUnionMember1")] pub type_union_member_1: Option<f32>,
  #[serde(rename = "typeUnionMember2")] pub type_union_member_2: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TypeUnion2 {
  pub kind: StringEnum,
  #[serde(rename = "typeUnionMember1")] pub type_union_member_1: Option<String>,
  #[serde(rename = "typeUnionMember2")] pub type_union_member_2: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TypeUnion3 {
  pub kind: NumberEnum,
  #[serde(rename = "typeUnionMember1")] pub type_union_member_1: Option<String>,
  #[serde(rename = "typeUnionMember2")] pub type_union_member_2: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TypeUnion4 {
  pub kind: String,
  #[serde(rename = "typeUnionMember1")] pub type_union_member_1: Option<String>,
  #[serde(rename = "typeUnionMember2")] pub type_union_member_2: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum TypeUnion5 {
  TypeLiteral(TypeLiteral),
  Interface(Interface),
}

#[derive(Serialize, Deserialize, Debug)]
pub enum TypeUnion8 {
  String(String),
  String(String),
  bool(bool),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TypeUnion {
  #[serde(rename = "typeUnionMember1")] pub type_union_member_1: TypeUnion1,
  #[serde(rename = "typeUnionMember2")] pub type_union_member_2: TypeUnion2,
  #[serde(rename = "typeUnionMember3")] pub type_union_member_3: TypeUnion3,
  #[serde(rename = "typeUnionMember4")] pub type_union_member_4: TypeUnion4,
  #[serde(rename = "typeUnionMember5")] pub type_union_member_5: TypeUnion5,
  #[serde(rename = "typeUnionMember7")] pub type_union_member_7: String,
  #[serde(rename = "typeUnionMember8")] pub type_union_member_8: TypeUnion8,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct InterfaceExtends {
  #[serde(rename = "interfaceExtendsMember1")] pub interface_extends_member_1: f32,
  #[serde(rename = "interfaceExtendsMember2")] pub interface_extends_member_2: String,
  #[serde(rename = "interfaceMember1")] pub interface_member_1: Option<f32>,
  #[serde(rename = "interfaceMember2")] pub interface_member_2: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TypeIntersection1 {
  #[serde(rename = "interfaceMember1")] pub interface_member_1: Option<f32>,
  #[serde(rename = "interfaceMember2")] pub interface_member_2: Option<String>,
  #[serde(rename = "typeIntersectionMember1")] pub type_intersection_member_1: f32,
  #[serde(rename = "typeIntersectionMember2")] pub type_intersection_member_2: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TypeIntersection2 {
  #[serde(rename = "typeIntersectionMember1")] pub type_intersection_member_1: f32,
  #[serde(rename = "typeIntersectionMember2")] pub type_intersection_member_2: String,
  #[serde(rename = "typeIntersectionMember3")] pub type_intersection_member_3: f32,
  #[serde(rename = "typeIntersectionMember4")] pub type_intersection_member_4: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TypeIntersection {
  #[serde(rename = "typeIntersectionMember1")] pub type_intersection_member_1: TypeIntersection1,
  #[serde(rename = "typeIntersectionMember2")] pub type_intersection_member_2: TypeIntersection2,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TypeUnionAndIntersection {
  #[serde(rename = "typeIntersectionMember1")] pub type_intersection_member_1: f32,
  pub kind: NumberEnum,
  #[serde(rename = "typeUnionMember1")] pub type_union_member_1: Option<String>,
  #[serde(rename = "typeUnionMember2")] pub type_union_member_2: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TaggedField {
  #[serde(rename = "taggedFieldMember1")] pub tagged_field_member_1: f32,
  #[serde(rename = "taggedFieldMember2")] pub tagged_field_member_2: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Enum {
  #[serde(rename = "stringEnum")] pub string_enum: String,
  #[serde(rename = "numberEnum")] pub number_enum: NumberEnum,
  #[serde(rename = "numberEnum2")] pub number_enum_2: NumberEnum2,
  #[serde(rename = "stringEnum2")] pub string_enum_2: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NumberType {
  #[serde(rename = "numberMember")] pub number_member: f32,
  #[serde(rename = "integerMember")] pub integer_member: i32,
  #[serde(rename = "uint32Member")] pub uint_32_member: u32,
  #[serde(rename = "int32Member")] pub int_32_member: i32,
  #[serde(rename = "sint32Member")] pub sint_32_member: i32,
  #[serde(rename = "fixed32Member")] pub fixed_32_member: u32,
  #[serde(rename = "sfixed32Member")] pub sfixed_32_member: i32,
  #[serde(rename = "uint64Member")] pub uint_64_member: u64,
  #[serde(rename = "int64Member")] pub int_64_member: i64,
  #[serde(rename = "sint64Member")] pub sint_64_member: i64,
  #[serde(rename = "fixed64Member")] pub fixed_64_member: u64,
  #[serde(rename = "sfixed64Member")] pub sfixed_64_member: i64,
  #[serde(rename = "floatMember")] pub float_member: f32,
  #[serde(rename = "doubleMember")] pub double_member: f64,
  #[serde(rename = "titleMember")] pub title_member: f32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct StringType {
  #[serde(rename = "stringMember")] pub string_member: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ArrayType {
  #[serde(rename = "arrayType1")] pub array_type_1: Vec<String>,
  #[serde(rename = "arrayType2")] pub array_type_2: Vec<TypeLiteral>,
  #[serde(rename = "arrayType4")] pub array_type_4: Vec<u32>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MapType7 {
  pub foo: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MapType {
  #[serde(rename = "mapType7")] pub map_type_7: MapType7,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Parameter {
  #[serde(rename = "member1")] pub member_1: String,
  #[serde(rename = "member2")] pub member_2: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DefaultValue {
  #[serde(rename = "stringMember")] pub string_member: String,
  #[serde(rename = "numberMember")] pub number_member: f32,
  #[serde(rename = "booleanMember")] pub boolean_member: bool,
  #[serde(rename = "stringMember2")] pub string_member_2: String,
  #[serde(rename = "stringMember3")] pub string_member_3: String,
  #[serde(rename = "numberMember1")] pub number_member_1: i32,
  #[serde(rename = "objectMember2")] pub object_member_2: TypeLiteral,
}

type TypeReferenceMember2 = TypeLiteral;

#[derive(Serialize, Deserialize, Debug)]
pub struct ReferenceType {
  #[serde(rename = "typeReferenceMember1")] pub type_reference_member_1: TypeLiteral,
  #[serde(rename = "typeReferenceMember2")] pub type_reference_member_2: TypeReferenceMember2,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ClassType1 {
  #[serde(rename = "classMember1")] pub class_member_1: String,
  #[serde(rename = "classMember2")] pub class_member_2: f32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ClassType2 {
  #[serde(rename = "classMember3")] pub class_member_3: String,
  #[serde(rename = "classMember4")] pub class_member_4: f32,
  #[serde(rename = "classMember1")] pub class_member_1: String,
  #[serde(rename = "classMember2")] pub class_member_2: f32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ClassType3 {
  #[serde(rename = "classMember1")] pub class_member_1: String,
  #[serde(rename = "classMember2")] pub class_member_2: f32,
  #[serde(rename = "classMember3")] pub class_member_3: bool,
  #[serde(rename = "classMember4")] pub class_member_4: String,
  #[serde(rename = "classMember5")] pub class_member_5: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ClassType {
  #[serde(rename = "classType1")] pub class_type_1: ClassType1,
  #[serde(rename = "classType2")] pub class_type_2: ClassType2,
  #[serde(rename = "classType3")] pub class_type_3: ClassType3,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Circular {
  pub children: Vec<Circular>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EntryType {
  #[serde(rename = "optionalMember")] pub optional_member: Option<String>,
  #[serde(rename = "booleanMember")] pub boolean_member: bool,
  #[serde(rename = "stringMember")] pub string_member: String,
  #[serde(rename = "numberType")] pub number_type: NumberType,
  #[serde(rename = "arrayType")] pub array_type: ArrayType,
  #[serde(rename = "referenceType")] pub reference_type: ReferenceType,
  #[serde(rename = "interfaceType")] pub interface_type: Interface,
  #[serde(rename = "typeUnion")] pub type_union: TypeUnion,
  #[serde(rename = "interfaceExtends")] pub interface_extends: InterfaceExtends,
  #[serde(rename = "typeIntersection")] pub type_intersection: TypeIntersection,
  #[serde(rename = "typeUnionAndIntersection")] pub type_union_and_intersection: TypeUnionAndIntersection,
  #[serde(rename = "mapType")] pub map_type: MapType,
  #[serde(rename = "taggedField")] pub tagged_field: TaggedField,
  pub enum: Enum,
  #[serde(rename = "stringNumber")] pub string_number: StringType,
  pub id: ID,
  pub parameter: Parameter,
  #[serde(rename = "optionalArrayMember")] pub optional_array_member: Option<Vec<String>>,
  #[serde(rename = "tupleType")] pub tuple_type: Vec<String>,
  #[serde(rename = "defaultType")] pub default_type: DefaultValue,
  #[serde(rename = "classType")] pub class_type: ClassType,
  pub circular: Circular,
  #[serde(rename = "outerType")] pub outer_type: OuterType,
}
