[![Dependency Status](https://david-dm.org/plantain-00/types-as-schema.svg)](https://david-dm.org/plantain-00/types-as-schema)
[![devDependency Status](https://david-dm.org/plantain-00/types-as-schema/dev-status.svg)](https://david-dm.org/plantain-00/types-as-schema#info=devDependencies)
[![Build Status](https://travis-ci.org/plantain-00/types-as-schema.svg?branch=master)](https://travis-ci.org/plantain-00/types-as-schema)
[![npm version](https://badge.fury.io/js/types-as-schema.svg)](https://badge.fury.io/js/types-as-schema)
[![Downloads](https://img.shields.io/npm/dm/types-as-schema.svg)](https://www.npmjs.com/package/types-as-schema)

# types-as-schema
Genetate json scheme or protobuf file from types.

#### supported types features

+ type literal
+ interface
+ type union
+ interface extends
+ type intersection
+ type array
+ tagged field
+ marked as more precise type
+ enum

#### supported types features

+ class
+ function
+ variable statement

#### install

`npm i types-as-schema -g`

#### usage

`types-as-schema demo/types.ts --json demo/ --protobuf demo/types.proto --debug demo/debug.json`

#### protobuf and json schema

+ `@type uint32`: set `type = "uint32"`
+ `@mapValueType uint32`: more detailed type of a map type value

#### protobuf only

+ `@tag 1`: tag or id

#### json schema only

entry:

+ `@entry request-protocol.json`: the entry file name

number:

+ `@multipleOf 10`: set `multipleOf = 10`
+ `@minimum 70`: set `minimum = 70`
+ `@maximum 90`: set `maximum = 90`
+ `@exclusiveMinimum 70`: set `exclusiveMinimum = 70`
+ `@exclusiveMaximum 90`: set `exclusiveMaximum = 90`

array:

+ `@uniqueItems`: set `uniqueItems = true`
+ `@minItems 1`: set `minItems = 1`
+ `@itemType integer`: set item `type = "integer"`

number[]:

+ `@itemMultipleOf 10`: set item `multipleOf = 10`
+ `@itemMinimum 70`: set item `minimum = 70`
+ `@itemMaximum 90`: set item `maximum = 90`
+ `@itemExclusiveMinimum 70`: set item `exclusiveMinimum = 70`
+ `@itemExclusiveMaximum 90`: set item `exclusiveMaximum = 90`
