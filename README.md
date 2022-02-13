# types-as-schema

[![Dependency Status](https://david-dm.org/plantain-00/types-as-schema.svg)](https://david-dm.org/plantain-00/types-as-schema)
[![devDependency Status](https://david-dm.org/plantain-00/types-as-schema/dev-status.svg)](https://david-dm.org/plantain-00/types-as-schema#info=devDependencies)
[![Build Status: Windows](https://ci.appveyor.com/api/projects/status/github/plantain-00/types-as-schema?branch=master&svg=true)](https://ci.appveyor.com/project/plantain-00/types-as-schema/branch/master)
![Github CI](https://github.com/plantain-00/types-as-schema/workflows/Github%20CI/badge.svg)
[![npm version](https://badge.fury.io/js/types-as-schema.svg)](https://badge.fury.io/js/types-as-schema)
[![Downloads](https://img.shields.io/npm/dm/types-as-schema.svg)](https://www.npmjs.com/package/types-as-schema)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fplantain-00%2Ftypes-as-schema%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/types-as-schema)

Genetate json schema, protobuf file and swagger doc from typescript types.

## install

`yarn global add types-as-schema`

## usage

`types-as-schema demo/types.ts --json demo/ --protobuf demo/types.proto --debug demo/debug.json --config demo/config.ts`

`demo/types.ts`

```ts
/**
 * @entry a.json
 **/
interface A extends B {
  a: string
}

interface B {
  b: number
}
```

`demo/a.json`

```json
{
  "$ref": "#/definitions/A",
  "definitions": {
    "A": {
      "type": "object",
      "properties": {
        "a": {
          "type": "string"
        },
        "b": {
          "type": "number"
        }
      },
      "required": [
        "a",
        "b"
      ],
      "additionalProperties": false
    }
  }
}
```

`demo/types.proto`

```proto
syntax = "proto3";

message B {
    double b = 1;
}

message A {
    string a = 1;
    double b = 2;
}
```

`demo/debug.json`

```json
[
  {
    "kind": "object",
    "name": "B",
    "members": [
      {
        "name": "b",
        "type": {
          "kind": "number",
          "type": "number",
          "position": {
            "file": "",
            "line": 8,
            "character": 5
          }
        }
      }
    ],
    "minProperties": 1,
    "maxProperties": 1,
    "position": {
      "file": "",
      "line": 7,
      "character": 0
    }
  },
  {
    "kind": "object",
    "name": "A",
    "members": [
      {
        "name": "a",
        "type": {
          "kind": "string",
          "position": {
            "file": "",
            "line": 4,
            "character": 5
          }
        }
      },
      {
        "name": "b",
        "type": {
          "kind": "number",
          "type": "number",
          "position": {
            "file": "",
            "line": 8,
            "character": 5
          }
        }
      }
    ],
    "minProperties": 2,
    "maxProperties": 2,
    "entry": "a.json",
    "position": {
      "file": "",
      "line": 3,
      "character": 0
    },
    "comments": [
      "/**\n * @entry a.json\n **/"
    ],
    "jsDocs": [
      {
        "name": "entry",
        "comment": "a.json"
      }
    ]
  }
]
```

`demo/config.ts`

```ts
import { TypeDeclaration } from 'types-as-schema'

export default (typeDeclarations: TypeDeclaration[]): { path: string, content: string }[] => {
  const content = `export const typeNames = [
${typeDeclarations.map(d => `'${d.name}',`).join('\n')}
]
`
  return [
    {
      path: 'demo/custom.ts',
      content,
    },
  ]
}
```

`demo/custom.ts`

```ts
export const typeNames = [
  'B',
  'A',
]
```

## options

parameters | description
--- | ---
`--json` | directory for generated json files
`--protobuf` | generated protobuf file
`--swagger` | generated swagger json file
`--swagger-base` | swagger json file that generation based on
`--typescript` | generated typescript file
`--debug` | generated file with debug information in it
`--watch` or `-w` | watch mode
`--loose` | do not force `additionalProperties`
`--config` | generate file by the config file, can be multiple
`--markdown` | generated markdown file
`-h` or `--help` | Print this message.
`-v` or `--version` | Print the version
