# types-as-schema

[![Dependency Status](https://david-dm.org/plantain-00/types-as-schema.svg)](https://david-dm.org/plantain-00/types-as-schema)
[![devDependency Status](https://david-dm.org/plantain-00/types-as-schema/dev-status.svg)](https://david-dm.org/plantain-00/types-as-schema#info=devDependencies)
[![Build Status: Linux](https://travis-ci.org/plantain-00/types-as-schema.svg?branch=master)](https://travis-ci.org/plantain-00/types-as-schema)
[![Build Status: Windows](https://ci.appveyor.com/api/projects/status/github/plantain-00/types-as-schema?branch=master&svg=true)](https://ci.appveyor.com/project/plantain-00/types-as-schema/branch/master)
[![npm version](https://badge.fury.io/js/types-as-schema.svg)](https://badge.fury.io/js/types-as-schema)
[![Downloads](https://img.shields.io/npm/dm/types-as-schema.svg)](https://www.npmjs.com/package/types-as-schema)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fplantain-00%2Ftypes-as-schema%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/types-as-schema)

Genetate json scheme, protobuf file, graphQL/mongoose(alpha) schema, reasonml(alpha)/ocaml(alpha)/rust(alpha) types and swagger doc from typescript types.

## supported types features

+ type literal
+ interface
+ type union
+ interface extends
+ type intersection
+ type array
+ tagged field
+ marked as more precise type
+ enum
+ class
+ class extends
+ muitiple files
+ function / method

## unsupported types features

+ variable statement

## install

`yarn global add types-as-schema`

## usage

`types-as-schema demo/types.ts --json demo/ --protobuf demo/types.proto --graphql demo/types.gql --graphql-root-type demo/root-type.ts --reason demo/types.re --ocaml demo/types.ml --rust demo/types.rs --debug demo/debug.json`

parameters | description
--- | ---
`--json` | directory for generated json files
`--protobuf` | generated protobuf file
`--graphql` | generated graphql schema file
`--graphql-root-type` | generated graphql root type
`--reason` | generated reason types file
`--ocaml` | generated ocaml types file
`--rust` | generated rust types file
`--mongoose` | generated mongoose schema file
`--swagger` | generated swagger json file
`--swagger-base` | swagger json file that generation based on
`--debug` | generated file with debug information in it
`--watch` or `-w` | watch mode

## protobuf and json schema

+ `@type uint32`: set `type = "uint32"`
+ `@mapValueType uint32`: more detailed type of a map type value

## protobuf only

+ `@tag 1`: tag or id

## json schema only

entry:

+ `@entry request-protocol.json`: the entry file name

common:

+ `@title foo`: set `title = 'foo'`
+ `@description bar`: set `description = 'bar'`

number:

+ `@multipleOf 10`: set `multipleOf = 10`
+ `@minimum 70`: set `minimum = 70`
+ `@maximum 90`: set `maximum = 90`
+ `@exclusiveMinimum 70`: set `exclusiveMinimum = 70`
+ `@exclusiveMaximum 90`: set `exclusiveMaximum = 90`
+ `@default 10`: set `default = 10`

string:

+ `@minLength 10`: set `minLength = 10`
+ `@maxLength 20`: set `maxLength = 20`
+ `@pattern ^[A-z]{3}$`: set `pattern = ^[A-z]{3}$`
+ `@default foo`: set `default = 'foo'`

boolean:

+ `@default true`: set `default = true`

object:

+ `@minProperties 1`: set `minProperties = 1`
+ `@maxProperties 3`: set `maxProperties = 3`
+ `@additionalProperties`: set `additionalProperties = true`

array:

+ `@uniqueItems`: set `uniqueItems = true`
+ `@minItems 1`: set `minItems = 1`
+ `@maxItems 10`: set `maxItems = 10`
+ `@itemType integer`: set item `type = "integer"`

number[]:

+ `@itemMultipleOf 10`: set item `multipleOf = 10`
+ `@itemMinimum 70`: set item `minimum = 70`
+ `@itemMaximum 90`: set item `maximum = 90`
+ `@itemExclusiveMinimum 70`: set item `exclusiveMinimum = 70`
+ `@itemExclusiveMaximum 90`: set item `exclusiveMaximum = 90`
+ `@itemDefault 10`: set item `default = 10`

string[]:

+ `@itemMinLength 10`: set item `minLength = 10`
+ `@itemMaxLength 20`: set item `maxLength = 20`
+ `@itemPattern ^[A-z]{3}$`: set item `pattern = ^[A-z]{3}$`
+ `@itemDefault foo`: set item `default = 'foo'`

boolean[]:

+ `@itemDefault true`: set item `default = true`

## graphql schema only

+ `@param {string} name`: set argument `name: String!`
+ `@param {string} [name]`: set argument `name: String`

## swagger doc only

+ `@method get`: set api method
+ `@path /pet/{id}`: set api url
+ `@in query`: a parameter in a `query`, `body`, `header`, `formData` or `path`
+ `@deprecated`: set api as deprecated api
+ `@tags pet`: set api tags, can be seperated by `,`

## number type alias

```ts
type uint32 = number;
type integer = number;

type Foo = {
    bar: uint32;
    foo: integer;
}
```
