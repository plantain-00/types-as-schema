[![Dependency Status](https://david-dm.org/plantain-00/types-as-schema.svg)](https://david-dm.org/plantain-00/types-as-schema)
[![devDependency Status](https://david-dm.org/plantain-00/types-as-schema/dev-status.svg)](https://david-dm.org/plantain-00/types-as-schema#info=devDependencies)
[![Build Status](https://travis-ci.org/plantain-00/types-as-schema.svg?branch=master)](https://travis-ci.org/plantain-00/types-as-schema)
[![npm version](https://badge.fury.io/js/types-as-schema.svg)](https://badge.fury.io/js/types-as-schema)
[![Downloads](https://img.shields.io/npm/dm/types-as-schema.svg)](https://www.npmjs.com/package/types-as-schema)

# types-as-schema
Genetate json scheme or protobuf file from types.

#### features

+ generate json schema file
+ generate protobuf file

#### install

`npm i types-as-schema -g`

#### usage

`types-as-schema demo/types.ts --json demo/ --protobuf demo/types.proto --debug demo/debug.json`

#### jsDoc

code | use case | description
--- | --- | ---
`@tag 1` | protobuf | tag or id
`@type uint32` | protobuf and json schema | set `type = "uint32"`
`@mapValueType uint32` | protobuf and json schema | more detailed type of a map type value
`@entry request-protocol.json` | json schema | the entry file name
`@uniqueItems` | json schema  | set `uniqueItems = true`
`@minItems 1` | json schema | set `minItems = 1`
`@itemType integer` | json schema | set item `type = "integer"`
`@itemMinimum 1` | json schema | set item `minimum = 1`
