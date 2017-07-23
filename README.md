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

run `types-as-schema`

or `types-as-schema demo/types.ts --json demo/types.json --protobuf demo/types.proto --debug demo/debug.json`

#### jsDoc

code | description
--- | ---
`@tag 1` | protobuf tag
`@type uint32` | more detailed type
`@mapValueType uint32` | more detailed type of a map type value
`@entry` | the entry type, used for json schema
