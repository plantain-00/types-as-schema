# Data Models

## `StringEnum`

Name | Value | Description
--- | --- | ---
`enumMember1` | `enum member 1` |
`enumMember2` | `enum member 2` |

## `NumberEnum`

Name | Value | Description
--- | --- | ---
`enumMember1` | `0` |
`enumMember2` | `1` |

## `NumberEnum2`

Name | Value | Description
--- | --- | ---
`enumMember1` | `3` |
`enumMember2` | `4` |

## `TypeLiteral`

Field | Required | Type | Description
--- | --- | --- | ---
`typeLiteralMember1` | `true` | `number` |
`typeLiteralMember2` | `true` | `string` |

## `Interface`

Field | Required | Type | Description
--- | --- | --- | ---
`interfaceMember1` | `false` | `number` |
`interfaceMember2` | `false` | `string` |

## `TypeUnion1`

Field | Required | Type | Description
--- | --- | --- | ---
`typeLiteralMember1` | `false` | `number` |
`typeLiteralMember2` | `false` | `string` |
`typeUnionMember1` | `false` | `number` |
`typeUnionMember2` | `false` | `string` |

## `TypeUnion2`

Field | Required | Type | Description
--- | --- | --- | ---
`kind` | `true` | `"enum member 1" | "enum member 2"` |
`typeUnionMember1` | `false` | `string` |
`typeUnionMember2` | `false` | `string` |

## `TypeUnion3`

Field | Required | Type | Description
--- | --- | --- | ---
`kind` | `true` | `0 | 1` |
`typeUnionMember1` | `false` | `string` |
`typeUnionMember2` | `false` | `string` |

## `TypeUnion4`

Field | Required | Type | Description
--- | --- | --- | ---
`kind` | `true` | `"foo" | "bar"` |
`typeUnionMember1` | `false` | `string` |
`typeUnionMember2` | `false` | `string` |

## `TypeUnion5`

Union | Description
--- | ---
[`TypeLiteral`](#TypeLiteral) |
[`Interface`](#Interface) |

## `TypeUnion8`

Union | Description
--- | ---
`"foo"` |
`"bar"` |
`null` |
`false` |

## `TypeUnion9`

Enum | Description
--- | ---
`foo` |
`bar` |

## `TypeUnion`

Field | Required | Type | Description
--- | --- | --- | ---
`typeUnionMember1` | `true` | [`TypeUnion1`](#TypeUnion1) |
`typeUnionMember2` | `true` | [`TypeUnion2`](#TypeUnion2) |
`typeUnionMember3` | `true` | [`TypeUnion3`](#TypeUnion3) |
`typeUnionMember4` | `true` | [`TypeUnion4`](#TypeUnion4) |
`typeUnionMember5` | `true` | [`TypeUnion5`](#TypeUnion5) |
`typeUnionMember6` | `true` | `string | null | false` |
`typeUnionMember7` | `true` | `"foo" | "bar"` |
`typeUnionMember8` | `true` | [`TypeUnion8`](#TypeUnion8) |
`typeUnionMember9` | `true` | [`TypeUnion9`](#TypeUnion9) |

## `InterfaceExtends`

Field | Required | Type | Description
--- | --- | --- | ---
`interfaceExtendsMember1` | `true` | `number` |
`interfaceExtendsMember2` | `true` | `string` |
`interfaceMember1` | `false` | `number` |
`interfaceMember2` | `false` | `string` |

## `TypeIntersection1`

Field | Required | Type | Description
--- | --- | --- | ---
`interfaceMember1` | `false` | `number` |
`interfaceMember2` | `false` | `string` |
`typeIntersectionMember1` | `true` | `number` |
`typeIntersectionMember2` | `true` | `string` |

## `TypeIntersection2`

Field | Required | Type | Description
--- | --- | --- | ---
`typeIntersectionMember1` | `true` | `number` |
`typeIntersectionMember2` | `true` | `string` |
`typeIntersectionMember3` | `true` | `number` |
`typeIntersectionMember4` | `true` | `string` |

## `TypeIntersection`

Field | Required | Type | Description
--- | --- | --- | ---
`typeIntersectionMember1` | `true` | [`TypeIntersection1`](#TypeIntersection1) |
`typeIntersectionMember2` | `true` | [`TypeIntersection2`](#TypeIntersection2) |
`typeIntersectionMember3` | `true` | `unknown` |

## `TypeUnionAndIntersection`

Field | Required | Type | Description
--- | --- | --- | ---
`typeIntersectionMember1` | `true` | `number` |
`kind` | `true` | `0 | 1` |
`typeUnionMember1` | `false` | `string` |
`typeUnionMember2` | `false` | `string` |

## `TaggedField`

Field | Required | Type | Description
--- | --- | --- | ---
`taggedFieldMember1` | `true` | `number` |
`taggedFieldMember2` | `true` | `string` |

## `Enum`

Field | Required | Type | Description
--- | --- | --- | ---
`stringEnum` | `true` | [`StringEnum`](#StringEnum) |
`numberEnum` | `true` | [`NumberEnum`](#NumberEnum) |
`numberEnum2` | `true` | [`NumberEnum2`](#NumberEnum2) |
`stringEnum2` | `true` | `"foo"` |

## `NumberType`

Field | Required | Type | Description
--- | --- | --- | ---
`numberMember` | `true` | `number` |
`integerMember` | `true` | `number` |
`uint32Member` | `true` | `number` |
`int32Member` | `true` | `number` |
`sint32Member` | `true` | `number` |
`fixed32Member` | `true` | `number` |
`sfixed32Member` | `true` | `number` |
`uint64Member` | `true` | `number` |
`int64Member` | `true` | `number` |
`sint64Member` | `true` | `number` |
`fixed64Member` | `true` | `number` |
`sfixed64Member` | `true` | `number` |
`floatMember` | `true` | `number` |
`doubleMember` | `true` | `number` |
`titleMember` | `true` | `number` | bar

## `StringType`

Field | Required | Type | Description
--- | --- | --- | ---
`stringMember` | `true` | `string` |

## `ArrayType`

Field | Required | Type | Description
--- | --- | --- | ---
`arrayType1` | `true` | `string[]` |
`arrayType2` | `true` | [`TypeLiteral`](#TypeLiteral)[] |
`arrayType3` | `true` | `{ literal: number }[]` |
`arrayType4` | `true` | `number[]` |
`arrayType5` | `true` | `{ literal: number | string }[]` |
`arrayType6` | `true` | `{ literal: number | null }[]` |
`arrayType7` | `true` | { literal: [`TypeLiteral`](#TypeLiteral) | null }[] |
`arrayType8` | `true` | `{ literal: number }[]` |
`arrayType9` | `true` | `string[]` |
`arrayType10` | `true` | `("foo" | "bar")[]` |

## `MapType7`

Field | Required | Type | Description
--- | --- | --- | ---
`foo` | `true` | `string` |

## `MapType8`

Field | Required | Type | Description
--- | --- | --- | ---

## `MapType`

Field | Required | Type | Description
--- | --- | --- | ---
`mapType` | `true` | `{ [name: string]: number }` |
`mapType2` | `true` | { [name: string]: [`TypeLiteral`](#TypeLiteral) } |
`mapType3` | `true` | `{ [name: string]: { literal: number } }` |
`mapType4` | `true` | `{ [name: string]: number }` |
`mapType5` | `true` | `{ [name: string]: unknown }` |
`mapType6` | `true` | `{ foo: number, [name: string]: number }` |
`mapType7` | `true` | [`MapType7`](#MapType7) |
`mapType8` | `true` | [`MapType8`](#MapType8) |

## `Parameter`

Field | Required | Type | Description
--- | --- | --- | ---
`member1` | `true` | `string` |
`member2` | `true` | `string` |

## `DefaultValue`

Field | Required | Type | Description
--- | --- | --- | ---
`stringMember` | `true` | `string` |
`numberMember` | `true` | `number` |
`booleanMember` | `true` | `boolean` |
`stringMember2` | `true` | `string` |
`stringMember3` | `true` | `string` |
`arrayMember` | `true` | `unknown[]` |
`objectMember` | `true` | `{ foo: string }` |
`numberMember1` | `true` | `number` |
`objectMember2` | `true` | [`TypeLiteral`](#TypeLiteral) |

## `TypeReferenceMember2`

Reference | Description
--- | ---
[`TypeLiteral`](#TypeLiteral) |

## `ReferenceType`

Field | Required | Type | Description
--- | --- | --- | ---
`typeReferenceMember1` | `true` | [`TypeLiteral`](#TypeLiteral) |
`typeReferenceMember2` | `true` | [`TypeReferenceMember2`](#TypeReferenceMember2) |

## `ClassType1`

Field | Required | Type | Description
--- | --- | --- | ---
`classMember1` | `true` | `string` |
`classMember2` | `true` | `number` |

## `ClassType2`

Field | Required | Type | Description
--- | --- | --- | ---
`classMember3` | `true` | `string` |
`classMember4` | `true` | `number` |
`classMember1` | `true` | `string` |
`classMember2` | `true` | `number` |

## `ClassType3`

Field | Required | Type | Description
--- | --- | --- | ---
`classMember1` | `true` | `string` |
`classMember2` | `true` | `number` |
`classMember3` | `true` | `boolean` |
`classMember4` | `true` | `string` |
`classMember5` | `true` | `string[]` |
`classMember6` | `true` | `{ a: number }` |

## `ClassType`

Field | Required | Type | Description
--- | --- | --- | ---
`classType1` | `true` | [`ClassType1`](#ClassType1) |
`classType2` | `true` | [`ClassType2`](#ClassType2) |
`classType3` | `true` | [`ClassType3`](#ClassType3) |

## `Circular`

Field | Required | Type | Description
--- | --- | --- | ---
`children` | `true` | [`Circular`](#Circular)[] |

## `TypeAlias`

Field | Required | Type | Description
--- | --- | --- | ---
`result` | `true` | [`Result2`](#Result2) |

## `CreateInput`

Field | Required | Type | Description
--- | --- | --- | ---
`member1` | `true` | `string` |
`member2` | `true` | `number` |
`member3` | `true` | [`CreateInputMember3`](#CreateInputMember3) |

## `EntryType`

Field | Required | Type | Description
--- | --- | --- | ---
`optionalMember` | `false` | `string` |
`booleanMember` | `true` | `boolean` |
`stringMember` | `true` | `string` |
`numberType` | `true` | [`NumberType`](#NumberType) |
`arrayType` | `true` | [`ArrayType`](#ArrayType) |
`typeLiteral` | `true` | `{ literal: number }` |
`referenceType` | `true` | [`ReferenceType`](#ReferenceType) |
`interfaceType` | `true` | [`Interface`](#Interface) |
`typeUnion` | `true` | [`TypeUnion`](#TypeUnion) |
`interfaceExtends` | `true` | [`InterfaceExtends`](#InterfaceExtends) |
`typeIntersection` | `true` | [`TypeIntersection`](#TypeIntersection) |
`typeUnionAndIntersection` | `true` | [`TypeUnionAndIntersection`](#TypeUnionAndIntersection) |
`mapType` | `true` | [`MapType`](#MapType) |
`taggedField` | `true` | [`TaggedField`](#TaggedField) |
`enum` | `true` | [`Enum`](#Enum) |
`stringNumber` | `true` | [`StringType`](#StringType) |
`id` | `true` | [`ID`](#ID) |
`parameter` | `true` | [`Parameter`](#Parameter) |
`optionalArrayMember` | `false` | `string[]` |
`tupleType` | `true` | `[string, string]` |
`defaultType` | `true` | [`DefaultValue`](#DefaultValue) |
`anyType` | `true` | `unknown` |
`classType` | `true` | [`ClassType`](#ClassType) |
`circular` | `true` | [`Circular`](#Circular) |
`outerType` | `true` | [`OuterType`](#OuterType) |
`typeAlias` | `true` | [`TypeAlias`](#TypeAlias) |
`pick` | `true` | { result: [`Result2`](#Result2) } |
`pick2` | `true` | `{ member1: string, member2: number }` |
`pick3` | `true` | [`CreateInput2`](#CreateInput2) |
`unknown` | `true` | [`LayoutMetadataMap`](#LayoutMetadataMap) |
`template` | `true` | `"1-left-top" | "1-right-top" | "1-left-bottom" | "1-right-bottom"` |

## `Mutation`

Field | Required | Type | Description
--- | --- | --- | ---
`create` | `true` | [`MutationResult`](#MutationResult) |

## `MutationResult`

Field | Required | Type | Description
--- | --- | --- | ---
`result` | `true` | `boolean` |

## `Query`

Field | Required | Type | Description
--- | --- | --- | ---
`user` | `true` | [`GetResult`](#GetResult) |
`users` | `true` | [`GetResult`](#GetResult) |

## `GetResult`

Field | Required | Type | Description
--- | --- | --- | ---
`result` | `true` | [`Result`](#Result) |

## `Result`

Field | Required | Type | Description
--- | --- | --- | ---
`member1` | `true` | `string` |
`member2` | `true` | `string` |

## `CreateInputMember3`

Field | Required | Type | Description
--- | --- | --- | ---
`member1` | `true` | `string` |

## `Result2`

Reference | Description
--- | ---
[`Result3`](#Result3) |

## `Result3`

Field | Required | Type | Description
--- | --- | --- | ---
`result3` | `true` | `string` |

## `Pet`

Field | Required | Type | Description
--- | --- | --- | ---
`id` | `false` | `number` |
`name` | `true` | `string` |
`photoUrls` | `true` | `string[]` |
`status` | `true` | `"available" | "pending" | "sold"` |

## `getPetById`

get pet by id

Field | Required | Type | Description
--- | --- | --- | ---
`status` | `true` | `"health" | "sick"` |
`tags` | `true` | `string[]` |
`pet` | `true` | [`Pet`](#Pet) |
`id` | `false` | `number` | pet id
`sortType` | `false` | `"asc" | "desc"` |

Return | Description
--- | ---
[`Pet`](#Pet) |

## `MongooseScheme`

Field | Required | Type | Description
--- | --- | --- | ---
`objectId` | `true` | [`ObjectId`](#ObjectId) |
`date` | `true` | [`Date`](#Date) |
`decimal128` | `true` | [`Decimal128`](#Decimal128) |
`index1` | `true` | `string` |
`index2` | `true` | `string` |
`index3` | `true` | `string` |
`buffer` | `true` | [`Buffer`](#Buffer) |

## `CreateInput2`

Field | Required | Type | Description
--- | --- | --- | ---
`member1` | `true` | `string` |
`member2` | `true` | `number` |

## `LayoutMetadataMap`

Field | Required | Type | Description
--- | --- | --- | ---

## `Metadata`

Field | Required | Type | Description
--- | --- | --- | ---

## `WsCommand`

Union | Description
--- | ---
[`CreateBlog`](#CreateBlog) |
[`UpdateBlog`](#UpdateBlog) |

## `CreateBlog`

Field | Required | Type | Description
--- | --- | --- | ---
`type` | `true` | `"create blog"` |
`content` | `true` | `string` |

## `UpdateBlog`

Field | Required | Type | Description
--- | --- | --- | ---
`type` | `true` | `"update blog"` |
`id` | `true` | `number` |
`content` | `true` | `string` |

## `WsPush`

Union | Description
--- | ---
[`BlogChange`](#BlogChange) |

## `BlogChange`

Field | Required | Type | Description
--- | --- | --- | ---
`type` | `true` | `"blog change"` |
`id` | `true` | `number` |
`content` | `true` | `string` |

## `TestController`

Field | Required | Type | Description
--- | --- | --- | ---
`get` | `true` | `unknown` |

## `Template`

Enum | Description
--- | ---
`left-top` |
`right-top` |
`left-bottom` |
`right-bottom` |

## `downloadFile`

Field | Required | Type | Description
--- | --- | --- | ---

Return | Description
--- | ---
`File` |

## `returnEmpty`

Field | Required | Type | Description
--- | --- | --- | ---

Return | Description
--- | ---
`void` |

## `OuterType`

Field | Required | Type | Description
--- | --- | --- | ---
`outerType` | `true` | `number` |
