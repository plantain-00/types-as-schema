import { Type, TypeDeclaration, toUpperCase, ReferenceType, EnumDeclaration, NumberType, ObjectDeclaration, UnionDeclaration, ReferenceDeclaration } from './utils'
import snakeCase from 'lodash/snakeCase'

export function generateRustTypes(typeDeclarations: TypeDeclaration[]) {
  const messages: string[] = []
  let useSerde = false
  for (const typeDeclaration of typeDeclarations) {
    if (typeDeclaration.kind === 'object') {
      const message = getObjectDeclaration(typeDeclaration, typeDeclarations)
      messages.push(message)
    } else if (typeDeclaration.kind === 'enum') {
      const { messages: enumMessages, useSerde: enumUseSerde } = getEnumDeclarations(typeDeclaration)
      messages.push(...enumMessages)
      if (enumUseSerde) {
        useSerde = true
      }
    } else if (typeDeclaration.kind === 'union') {
      const message = getUnionDeclaration(typeDeclaration, typeDeclarations)
      messages.push(message)
    } else if (typeDeclaration.kind === 'reference') {
      const message = getReferenceDeclaration(typeDeclaration)
      messages.push(message)
    }
  }
  if (useSerde) {
    messages.unshift(`extern crate serde;

pub use self::serde::ser::{Serialize, Serializer};
pub use self::serde::de::{Deserialize, Deserializer, Error};`)
  }
  return messages.join('\n\n') + '\n'
}

function getObjectDeclaration(objectDeclaration: ObjectDeclaration, typeDeclarations: TypeDeclaration[]) {
  const members = objectDeclaration.members.map(m => {
    const propertyType = getRustTypesProperty(typeDeclarations, m.type, m.optional)
    if (propertyType) {
      const snakeName = snakeCase(m.name)
      if (m.name === snakeName) {
        return `  pub ${snakeCase(m.name)}: ${propertyType}`
      }
      return `  #[serde(rename = "${m.name}")] pub ${snakeCase(m.name)}: ${propertyType}`
    }
    return undefined
  })
  return `#[derive(Serialize, Deserialize, Debug)]
pub struct ${objectDeclaration.name} {
${members.filter(m => m).map(m => m + ',').join('\n')}
}`
}

function getEnumDeclarations(enumDeclaration: EnumDeclaration) {
  const messages: string[] = []
  let useSerde = false
  if (enumDeclaration.type === 'string') {
    useSerde = true
    const members = enumDeclaration.members.map(m => `  ${toUpperCase(m.name)},`).join('\n')
    messages.push(`#[derive(Debug)]
pub enum ${enumDeclaration.name} {
${members}
}`)

    const serializerValues = enumDeclaration.members.map(m => `      ${enumDeclaration.name}::${toUpperCase(m.name)} => "${m.value}",`).join('\n')
    messages.push(`impl Serialize for ${enumDeclaration.name} {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    serializer.serialize_str(match *self {
${serializerValues}
    })
  }
}`)

    const deSerializerValues = enumDeclaration.members.map(m => `      "${m.value}" => Ok(${enumDeclaration.name}::${toUpperCase(m.name)}),`).join('\n')
    messages.push(`impl<'de> Deserialize<'de> for ${enumDeclaration.name} {
  fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
  where
    D: Deserializer<'de>,
  {
    let s = String::deserialize(deserializer)?;
    match s.as_str() {
${deSerializerValues}
      _ => Err(Error::custom("wrong enum value.")),
    }
  }
}`)
  } else {
    const members = enumDeclaration.members.map(m => `  ${toUpperCase(m.name)} = ${m.value},`).join('\n')
    messages.push(`#[derive(Serialize, Deserialize, Debug)]
pub enum ${enumDeclaration.name} {
${members}
}`)
  }
  return { messages, useSerde }
}

function getUnionDeclaration(unionDeclaration: UnionDeclaration, typeDeclarations: TypeDeclaration[]) {
  const members = unionDeclaration.members.map(m => {
    const propertyType = getRustTypesProperty(typeDeclarations, m, undefined)
    if (propertyType) {
      return `  ${propertyType}(${propertyType})`
    }
    return undefined
  })
  return `#[derive(Serialize, Deserialize, Debug)]
pub enum ${unionDeclaration.name} {
${members.filter(m => m).map(m => m + ',').join('\n')}
}`
}

function getReferenceDeclaration(referenceDeclaration: ReferenceDeclaration) {
  return `type ${referenceDeclaration.newName} = ${referenceDeclaration.name};`
}

function getRustTypesProperty(typeDeclarations: TypeDeclaration[], memberType: Type, optional = false): string {
  let propertyType = ''
  if (memberType.kind === 'array') {
    const elementPropertyType = getRustTypesProperty(typeDeclarations, memberType.type, undefined)
    if (elementPropertyType) {
      propertyType = `Vec<${elementPropertyType}>`
    }
  } else if (memberType.kind === 'enum') {
    if (memberType.name === 'string') {
      propertyType = 'String'
    } else if (memberType.name === 'boolean') {
      propertyType = 'bool'
    } else {
      propertyType = memberType.name
    }
  } else if (memberType.kind === 'reference') {
    propertyType = getRustTypesPropertyOfReference(typeDeclarations, memberType)
  } else if (memberType.kind === 'number') {
    propertyType = getRustTypesPropertyOfNumber(memberType)
  } else if (memberType.kind === 'string') {
    propertyType = 'String'
  } else if (memberType.kind === 'boolean') {
    propertyType = 'bool'
  }
  if (optional) {
    return `Option<${propertyType}>`
  }
  return propertyType
}

function getRustTypesPropertyOfNumber(memberType: NumberType) {
  if (memberType.type === 'number' || memberType.type === 'float') {
    return 'f32'
  }
  if (memberType.type === 'double') {
    return 'f64'
  }
  if (memberType.type === 'integer'
    || memberType.type === 'int32'
    || memberType.type === 'sint32'
    || memberType.type === 'sfixed32') {
    return 'i32'
  }
  if (memberType.type === 'uint32' || memberType.type === 'fixed32') {
    return 'u32'
  }
  if (memberType.type === 'int64'
    || memberType.type === 'sint64'
    || memberType.type === 'sfixed64') {
    return 'i64'
  }
  if (memberType.type === 'uint64' || memberType.type === 'fixed64') {
    return 'u64'
  }
  return memberType.type
}

function getRustTypesPropertyOfReference(typeDeclarations: TypeDeclaration[], memberType: ReferenceType) {
  const typeDeclaration = typeDeclarations.find(m => m.kind === 'enum' && m.name === memberType.name)
  if (typeDeclaration && typeDeclaration.kind === 'enum' && typeDeclaration.type === 'string') {
    return 'String'
  }
  return memberType.name
}
