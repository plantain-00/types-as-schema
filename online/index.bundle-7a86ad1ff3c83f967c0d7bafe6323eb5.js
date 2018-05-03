!function(e){function n(n){for(var i,a,o=n[0],s=n[1],p=n[2],l=0,d=[];l<o.length;l++)a=o[l],r[a]&&d.push(r[a][0]),r[a]=0;for(i in s)Object.prototype.hasOwnProperty.call(s,i)&&(e[i]=s[i]);for(u&&u(n);d.length;)d.shift()();return m.push.apply(m,p||[]),t()}function t(){for(var e,n=0;n<m.length;n++){for(var t=m[n],i=!0,o=1;o<t.length;o++){var s=t[o];0!==r[s]&&(i=!1)}i&&(m.splice(n--,1),e=a(a.s=t[0]))}return e}var i={},r={1:0};var m=[];function a(n){if(i[n])return i[n].exports;var t=i[n]={i:n,l:!1,exports:{}};return e[n].call(t.exports,t,t.exports,a),t.l=!0,t.exports}a.m=e,a.c=i,a.d=function(e,n,t){a.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:t})},a.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},a.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(n,"a",n),n},a.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},a.p="";var o=window.webpackJsonp=window.webpackJsonp||[],s=o.push.bind(o);o.push=n,o=o.slice();for(var p=0;p<o.length;p++)n(o[p]);var u=s;m.push([83,0]),t()}({144:function(e,n){},145:function(e,n){},179:function(e,n){},181:function(e,n){},185:function(e,n){},186:function(e,n){},187:function(e,n){},41:function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.toUpperCase=function(e){return e[0].toUpperCase()+e.substring(1)},n.toLowerCase=function(e){return e[0].toLowerCase()+e.substring(1)}},81:function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});const i=t(89),r=t(88),m=t(87),a=t(86),o=t(85),s=t(84);n.Generator=class{constructor(e){this.sourceFile=e,this.models=[];const n=new i.Parser(e);this.models=n.models}generateProtobuf(){return r.generateProtobuf(this.models)}generateJsonSchemas(){return m.generateJsonSchemas(this.models)}generateGraphqlSchema(){return a.generateGraphqlSchema(this.models)}generateReasonTypes(){return o.generateReasonTypes(this.models)}generateOcamlTypes(){return s.generateOcamlTypes(this.models)}}},83:function(e,n,t){"use strict";t.r(n);var i=t(21),r=t(20),m=t(40),a=t(82),o=t.n(a),s=t(81),p="type TypeLiteral = {\n  typeLiteralMember1: number;\n  typeLiteralMember2: string;\n}\n\n/**\n * @minProperties 1\n * @maxProperties 1\n */\ninterface Interface {\n  interfaceMember1?: number\n  interfaceMember2?: string\n\n  [name: string]: any\n}\n\ntype TypeUnion1 = TypeLiteral | {\n  typeUnionMember1: number;\n  typeUnionMember2: string;\n}\ntype TypeUnion2 =\n  {\n    kind: StringEnum.enumMember1;\n    typeUnionMember1: string;\n  } | {\n    kind: StringEnum.enumMember2;\n    typeUnionMember2: string;\n  }\ntype TypeUnion3 =\n  {\n    kind: NumberEnum.enumMember1;\n    typeUnionMember1: string;\n  } | {\n    kind: NumberEnum.enumMember2;\n    typeUnionMember2: string;\n  }\ntype TypeUnion4 =\n  {\n    kind: 'foo';\n    typeUnionMember1: string;\n  } | {\n    kind: 'bar';\n    typeUnionMember2: string;\n  }\ntype TypeUnion5 = TypeLiteral | Interface\ntype TypeUnion8 = 'foo' | 'bar' | null\ntype TypeUnion = {\n  typeUnionMember1: TypeUnion1;\n  typeUnionMember2: TypeUnion2;\n  typeUnionMember3: TypeUnion3;\n  typeUnionMember4: TypeUnion4;\n  typeUnionMember5: TypeUnion5;\n  typeUnionMember6: string | null;\n  typeUnionMember7: 'foo' | 'bar';\n  typeUnionMember8: TypeUnion8;\n}\n\ninterface InterfaceExtends extends Interface {\n  interfaceExtendsMember1: number\n  interfaceExtendsMember2: string\n}\n\ntype TypeIntersection1 = Interface & {\n  typeIntersectionMember1: number;\n  typeIntersectionMember2: string;\n}\ntype TypeIntersection2 =\n  {\n    typeIntersectionMember1: number;\n    typeIntersectionMember2: string;\n  } & {\n    typeIntersectionMember3: number;\n    typeIntersectionMember4: string;\n  }\n\ntype TypeIntersection = {\n  typeIntersectionMember1: TypeIntersection1;\n  typeIntersectionMember2: TypeIntersection2;\n}\n\ntype TypeUnionAndIntersection =\n  {\n    typeIntersectionMember1: number;\n  } & (\n    {\n      kind: NumberEnum.enumMember1;\n      typeUnionMember1: string;\n    } | {\n      kind: NumberEnum.enumMember2;\n      typeUnionMember2: string;\n    }\n  )\n\nexport type TaggedField = {\n  /**\n   * @tag 2\n   */\n  taggedFieldMember1: number;\n  /**\n   * @tag 3\n   */\n  taggedFieldMember2: string;\n}\n\nexport const enum StringEnum {\n  enumMember1 = 'enum member 1',\n  enumMember2 = 'enum member 2'\n}\nexport const enum NumberEnum {\n  enumMember1,\n  enumMember2\n}\nexport const enum NumberEnum2 {\n  enumMember1 = 3,\n  enumMember2 = 4\n}\nexport type Enum = {\n  stringEnum: StringEnum;\n  numberEnum: NumberEnum;\n  numberEnum2: NumberEnum2;\n  stringEnum2: 'foo';\n}\n\ntype integer = number\ntype uint32 = number\ntype int32 = number\ntype sint32 = number\ntype fixed32 = number\ntype sfixed32 = number\ntype uint64 = number\ntype int64 = number\ntype sint64 = number\ntype fixed64 = number\ntype sfixed64 = number\ntype float = number\ntype double = number\n\ntype NumberType = {\n  /**\n   * @multipleOf 10\n   * @minimum 70\n   * @maximum 90\n   * @exclusiveMinimum 70\n   * @exclusiveMaximum 90\n   */\n  numberMember: number;\n\n  integerMember: integer;\n\n  uint32Member: uint32;\n  int32Member: int32;\n  sint32Member: sint32;\n  fixed32Member: fixed32;\n  sfixed32Member: sfixed32;\n\n  uint64Member: uint64;\n  int64Member: int64;\n  sint64Member: sint64;\n  fixed64Member: fixed64;\n  sfixed64Member: sfixed64;\n\n  floatMember: float;\n  doubleMember: double;\n\n  /**\n   * @title foo\n   * @description bar\n   */\n  titleMember: number;\n}\n\ntype StringType = {\n  /**\n   * @minLength 10\n   * @maxLength 20\n   * @pattern ^[A-z]{3}$\n   */\n  stringMember: string;\n}\n\ntype ArrayType = {\n  /**\n   * @itemMinLength 10\n   * @itemMaxLength 20\n   * @itemPattern ^[A-z]{3}$\n   */\n  arrayType1: string[];\n  /**\n   * @uniqueItems\n   * @minItems 1\n   * @maxItems 10\n   */\n  arrayType2: TypeLiteral[];\n  arrayType3: { literal: number }[];\n  /**\n   * @itemMultipleOf 100\n   * @itemMinimum 100\n   * @itemMaximum 200\n   * @itemExclusiveMinimum 300\n   * @itemExclusiveMaximum 400\n   */\n  arrayType4: uint32[];\n  arrayType5: { literal: number | string }[];\n  arrayType6: { literal: number | null }[];\n  arrayType7: { literal: TypeLiteral | null }[];\n  arrayType8: Array<{ literal: number }>;\n}\n\ntype MapType7 = {\n  foo: string\n  [name: string]: string\n}\n\ntype MapType = {\n  mapType: { [name: string]: number };\n  mapType2: { [name: string]: TypeLiteral };\n  mapType3: { [name: string]: { literal: number } };\n  mapType4: { [name: string]: uint32 };\n  mapType5: { [name: string]: any };\n  mapType6: {\n    foo: number\n    [name: string]: number\n  };\n  mapType7: MapType7\n}\n\ntype ID = any\n\ntype Parameter = {\n  /**\n   * @param {string} name\n   * @param {number} age\n   */\n  member1: string\n  /**\n   * @param {string} [name]\n   */\n  member2: string\n}\n\ntype DefaultValue = {\n  /**\n   * @default foo\n   */\n  stringMember: string\n  /**\n   * @default 123\n   */\n  numberMember: number\n  /**\n   * @default true\n   */\n  booleanMember: boolean\n  /**\n   * @default 'foo bar'\n   */\n  stringMember2: string\n  /**\n   * @default ''\n   */\n  stringMember3: string\n  /**\n   * @default []\n   */\n  arrayMember: any[]\n  /**\n   * @default {}\n   */\n  objectMember: { foo: string }\n  /**\n   * @default 123\n   */\n  numberMember1: integer\n  /**\n   * @default {}\n   */\n  objectMember2: TypeLiteral\n}\n\ntype TypeReferenceMember2 = TypeLiteral\n\ntype ReferenceType = {\n  typeReferenceMember1: TypeLiteral\n  typeReferenceMember2: TypeReferenceMember2\n}\n\n/**\n * @entry cases.json\n * @additionalProperties\n */\nexport type EntryType = {\n  optionalMember?: string;\n  booleanMember: boolean;\n  stringMember: string;\n  numberType: NumberType;\n  arrayType: ArrayType;\n  typeLiteral: { literal: number };\n  referenceType: ReferenceType;\n  interfaceType: Interface;\n  typeUnion: TypeUnion;\n  interfaceExtends: InterfaceExtends;\n  typeIntersection: TypeIntersection;\n  typeUnionAndIntersection: TypeUnionAndIntersection;\n  mapType: MapType;\n  taggedField: TaggedField;\n  enum: Enum;\n  stringNumber: StringType;\n  id: ID;\n  parameter: Parameter;\n  optionalArrayMember?: string[];\n  tupleType: [string, string];\n  defaultType: DefaultValue;\n  anyType: any;\n}\n";function u(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",{staticClass:"app"},[t("textarea",{directives:[{name:"model",rawName:"v-model",value:e.source,expression:"source"}],staticClass:"source",domProps:{value:e.source},on:{input:function(n){n.target.composing||(e.source=n.target.value)}}}),e._v(" "),t("div",{staticClass:"result"},[t("button",{on:{click:function(n){e.generate()}}},[e._v("generate")]),e._v(" "),t("div",{staticClass:"options"},[t("select",{directives:[{name:"model",rawName:"v-model",value:e.selectedOption,expression:"selectedOption"}],on:{change:function(n){var t=Array.prototype.filter.call(n.target.options,function(e){return e.selected}).map(function(e){return"_value"in e?e._value:e.value});e.selectedOption=n.target.multiple?t:t[0]}}},e._l(e.options,function(n){return t("option",{key:n,domProps:{value:n}},[e._v(e._s(n))])}))]),e._v(" "),"protobuf"===e.selectedOption?t("pre",{staticClass:"protobuf"},[e._v(e._s(e.protobuf))]):e._e(),e._v(" "),e.jsonSchema?t("pre",{staticClass:"json-schema"},[e._v(e._s(e.jsonSchema))]):e._e(),e._v(" "),"graphql schema"===e.selectedOption?t("pre",{staticClass:"graphql-schema"},[e._v(e._s(e.graphqlSchema))]):e._e(),e._v(" "),"reason types"===e.selectedOption?t("pre",{staticClass:"reason-types"},[e._v(e._s(e.reasonTypes))]):e._e(),e._v(" "),"ocaml types"===e.selectedOption?t("pre",{staticClass:"ocaml-types"},[e._v(e._s(e.ocamlTypes))]):e._e()])])}var l=[];t.d(n,"App",function(){return c});var d="types-as-schema:source",c=function(e){function n(){var n=null!==e&&e.apply(this,arguments)||this;return n.protobuf="",n.options=["protobuf"],n.selectedOption="protobuf",n.graphqlSchema="",n.reasonTypes="",n.ocamlTypes="",n.innerSource=localStorage.getItem(d)||p,n.jsonSchemas=[],n}return i.__extends(n,e),Object.defineProperty(n.prototype,"source",{get:function(){return this.innerSource},set:function(e){this.innerSource=e,localStorage.setItem(d,e)},enumerable:!0,configurable:!0}),Object.defineProperty(n.prototype,"jsonSchema",{get:function(){var e=this;if(this.selectedOption){var n=this.jsonSchemas.find(function(n){return n.entry===e.selectedOption});if(n)return n.content}return""},enumerable:!0,configurable:!0}),n.prototype.generate=function(){if(this.source){var e=r.createSourceFile("",this.source,r.ScriptTarget.ESNext,!1,r.ScriptKind.TS),n=new s.Generator(e);this.protobuf=n.generateProtobuf(),this.jsonSchemas=n.generateJsonSchemas().map(function(e){return{entry:e.entry,content:JSON.stringify(e.schema,null,"  ")}}),this.graphqlSchema=n.generateGraphqlSchema(),this.reasonTypes=n.generateReasonTypes(),this.ocamlTypes=n.generateOcamlTypes(),this.options=["protobuf"];try{for(var t=i.__values(this.jsonSchemas),m=t.next();!m.done;m=t.next()){var a=m.value;this.options.push(a.entry)}}catch(e){o={error:e}}finally{try{m&&!m.done&&(p=t.return)&&p.call(t)}finally{if(o)throw o.error}}this.options.push("graphql schema"),this.options.push("reason types"),this.options.push("ocaml types")}var o,p},n=i.__decorate([o()({render:u,staticRenderFns:l})],n)}(m.default);new c({el:"#container"})},84:function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});const i=t(41);function r(e,n){let t="";if("array"===n.kind){const m=r(e,n.type);m&&(t=`${i.toLowerCase(m)} list`)}else"enum"===n.kind?t=n.name:"reference"===n.kind?t=function(e,n){const t=e.find(e=>"enum"===e.kind&&e.name===n.name);if(t&&"enum"===t.kind&&"string"===t.type)return"string";return n.name}(e,n):"number"===n.kind?t="number"===n.type||"float"===n.type||"double"===n.type?"float":"int":"string"===n.kind?t="string":"boolean"===n.kind&&(t="bool");return t}n.generateOcamlTypes=function(e){const n=[];for(const t of e)if("object"===t.kind){const m=t.members.map(n=>{const t=r(e,n.type);if(t)return`  ${n.name}: ${n.optional?i.toLowerCase(t)+" option":i.toLowerCase(t)}`});n.push(`type ${i.toLowerCase(t.name)} = {\n${m.filter(e=>e).map(e=>e+";").join("\n")}\n}`)}else if("enum"===t.kind){const e=t.members.map(e=>`  | ${i.toUpperCase(e.name)}`).join("\n");n.push(`type ${i.toLowerCase(t.name)} =\n${e}`)}return n.join("\n\n")+"\n"}},85:function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});const i=t(41);function r(e,n){let t="";if("array"===n.kind){const m=r(e,n.type);m&&(t=`list(${i.toLowerCase(m)})`)}else"enum"===n.kind?t=n.name:"reference"===n.kind?t=function(e,n){const t=e.find(e=>"enum"===e.kind&&e.name===n.name);if(t&&"enum"===t.kind&&"string"===t.type)return"string";return n.name}(e,n):"number"===n.kind?t="number"===n.type||"float"===n.type||"double"===n.type?"float":"int":"string"===n.kind?t="string":"boolean"===n.kind&&(t="bool");return t}n.generateReasonTypes=function(e){const n=[];for(const t of e)if("object"===t.kind){const m=t.members.map(n=>{const t=r(e,n.type);if(t)return`  ${n.name}: ${n.optional?`option(${i.toLowerCase(t)})`:i.toLowerCase(t)}`});n.push(`type ${i.toLowerCase(t.name)} = {\n  .\n${m.filter(e=>e).map(e=>e+",").join("\n")}\n};`)}else if("enum"===t.kind){const e=t.members.map(e=>`  | ${i.toUpperCase(e.name)}`).join("\n");n.push(`type ${i.toLowerCase(t.name)} =\n${e};`)}return n.join("\n\n")+"\n"}},86:function(e,n,t){"use strict";function i(e,n){const t=n.members.map(n=>(function(e,n){const t=r(e,n.type);if(t){let i="";return n.parameters&&(i=function(e,n){const t=[];for(const i of n){const n=r(e,i.type);n&&(i.optional?t.push(`${i.name}: ${n}`):t.push(`${i.name}: ${n}!`))}return`(${t.join(", ")})`}(e,n.parameters)),`  ${n.name}${i}: ${n.optional?t:t+"!"}`}return})(e,n));return`type ${n.name} {\n${t.filter(e=>e).join("\n")}\n}`}function r(e,n){let t="";if("array"===n.kind){const i=r(e,n.type);i&&(t=`[${i}]`)}else"enum"===n.kind?t=n.name:"reference"===n.kind?t=function(e,n){const t=e.find(e=>"enum"===e.kind&&e.name===n.name);if(t&&"enum"===t.kind&&"string"===t.type)return"String";return n.name}(e,n):"number"===n.kind?t="number"===n.type||"float"===n.type||"double"===n.type?"Float":"Int":"string"===n.kind?t="String":"boolean"===n.kind&&(t="Boolean");return t}Object.defineProperty(n,"__esModule",{value:!0}),n.generateGraphqlSchema=function(e){const n=[];for(const t of e)if("object"===t.kind){const r=i(e,t);n.push(r)}else if("enum"===t.kind){const e=t.members.map(e=>`  ${e.name}`);n.push(`enum ${t.name} {\n${e.join("\n")}\n}`)}return n.join("\n\n")+"\n"}},87:function(e,n,t){"use strict";function i(e){return"number"===e.kind?function(e){let n;n="double"===e.type||"float"===e.type?{type:"number",minimum:e.minimum,maximum:e.maximum}:"uint32"===e.type||"fixed32"===e.type?function(e){return{type:"integer",minimum:void 0!==e.minimum?e.minimum:0,maximum:void 0!==e.maximum?e.maximum:4294967295}}(e):"int32"===e.type||"sint32"===e.type||"sfixed32"===e.type?function(e){return{type:"integer",minimum:void 0!==e.minimum?e.minimum:-2147483648,maximum:void 0!==e.maximum?e.maximum:2147483647}}(e):"uint64"===e.type||"fixed64"===e.type?function(e){return{type:"integer",minimum:void 0!==e.minimum?e.minimum:0,maximum:void 0!==e.maximum?e.maximum:0x10000000000000000}}(e):"int64"===e.type||"sint64"===e.type||"sfixed64"===e.type?function(e){return{type:"integer",minimum:void 0!==e.minimum?e.minimum:-0x8000000000000000,maximum:void 0!==e.maximum?e.maximum:0x8000000000000000}}(e):"number"===e.type||"integer"===e.type?{type:e.type,minimum:e.minimum,maximum:e.maximum}:{type:e.kind,minimum:e.minimum,maximum:e.maximum};return Object.assign(n,{multipleOf:e.multipleOf,exclusiveMinimum:e.exclusiveMinimum,exclusiveMaximum:e.exclusiveMaximum,default:e.default,title:e.title,description:e.description}),n}(e):"boolean"===e.kind?{type:"boolean",default:e.default,title:e.title,description:e.description}:"map"===e.kind?{type:"object",additionalProperties:i(e.value)}:"array"===e.kind?{type:"array",items:i(e.type),uniqueItems:e.uniqueItems,minItems:e.minItems,maxItems:e.maxItems,default:e.default,title:e.title,description:e.description}:"enum"===e.kind?1===e.enums.length?{type:void 0,const:e.enums[0]}:{type:void 0,enum:e.enums}:"reference"===e.kind?{type:void 0,$ref:`#/definitions/${e.name}`,default:e.default}:"object"===e.kind?function(e){const n={},t=[];for(const r of e.members)r.optional||t.push(r.name),n[r.name]=i(r.type);let r;r=void 0===e.additionalProperties?void 0!==e.additionalProperties&&void 0:!0===e.additionalProperties||!1===e.additionalProperties?e.additionalProperties:i(e.additionalProperties);return{type:"object",properties:n,required:t,additionalProperties:r,minProperties:e.minProperties>e.members.filter(e=>!e.optional).length?e.minProperties:void 0,maxProperties:e.maxProperties&&e.maxProperties<e.members.length?e.maxProperties:void 0,default:e.default,title:e.title,description:e.description}}(e):"string"===e.kind?function(e){if(e.enums)return 1===e.enums.length?{type:void 0,const:e.enums[0]}:{type:void 0,enum:e.enums};return{type:e.kind,minLength:e.minLength,maxLength:e.maxLength,pattern:e.pattern,default:e.default,title:e.title,description:e.description}}(e):"union"===e.kind?{type:void 0,anyOf:e.members.map(e=>i(e))}:"null"===e.kind?{type:"null"}:{type:e.kind}}function r(e,n){const t={},i="string"==typeof e?n[e]:e;if(void 0===i)return t;if("string"==typeof e&&(t[e]=i),"array"===i.type)Object.assign(t,r(i.items,n));else if("object"===i.type){if(i.properties)for(const e in i.properties)if(i.properties.hasOwnProperty(e)){const m=i.properties[e];Object.assign(t,r(m,n))}}else void 0===i.type&&Object.assign(t,function(e,n){const t={};if(e.$ref){const i=e.$ref.substring("#/definitions/".length);Object.assign(t,r(i,n))}if(e.anyOf)for(const i of e.anyOf)Object.assign(t,r(i,n));return t}(i,n));return t}Object.defineProperty(n,"__esModule",{value:!0}),n.generateJsonSchemas=function(e){const n={};for(const t of e)"object"===t.kind||"array"===t.kind||"union"===t.kind||"string"===t.kind||"number"===t.kind?n[t.name]=i(t):"reference"===t.kind&&(n[t.newName]={type:void 0,$ref:`#/definitions/${t.name}`});return e.filter(e=>("object"===e.kind||"array"===e.kind||"union"===e.kind)&&e.entry).map(e=>({entry:e.entry,schema:{$ref:`#/definitions/${e.name}`,definitions:r(e.name,n)}}))}},88:function(e,n,t){"use strict";function i(e,n){const t=[];let i=n.members.reduce((e,n)=>n.tag?Math.max(e,n.tag):e,0);for(const r of n.members){r.tag||i++;const{modifier:n,propertyType:a}=m(e,r.type);a&&t.push(`    ${n}${a} ${r.name} = ${r.tag?r.tag:i};`)}return`message ${n.name} {\n${t.join("\n")}\n}`}function r(e,n){const t=[];for(const e of n.members)"number"==typeof e.value&&t.push(`    ${e.name} = ${e.value};`);if(t.length>0)return`enum ${n.name} {\n${t.join("\n")}\n}`}function m(e,n){let t="",i="";return"map"===n.kind?i=function(e,n){let t="";"number"===n.value.kind?({propertyType:t}=m(e,n.value)):"reference"===n.value.kind&&(t=n.value.name);if(t)return`map<${n.key.kind}, ${t}>`;return""}(e,n):"array"===n.kind?(t="repeated ",({propertyType:i}=m(e,n.type))):"enum"===n.kind?i="string"===n.type?"string":n.name:"reference"===n.kind?i=function(e,n){const t=e.find(e=>"enum"===e.kind&&e.name===n.name);if(t&&"enum"===t.kind&&"string"===t.type)return"string";return n.name}(e,n):"number"===n.kind?i="number"===n.type?"double":"integer"===n.type?"int32":n.type:"string"===n.kind?i=n.kind:"boolean"===n.kind&&(i="bool"),{modifier:t,propertyType:i}}Object.defineProperty(n,"__esModule",{value:!0}),n.generateProtobuf=function(e){const n=[];for(const t of e)if("object"===t.kind){const r=i(e,t);n.push(r)}else if("enum"===t.kind){const i=r(e,t);i&&n.push(i)}return`syntax = "proto3";\n\n${n.join("\n\n")}\n`}},89:function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});const i=t(21).__importDefault(t(20));n.Parser=class{constructor(e){this.sourceFile=e,this.models=[],i.default.forEachChild(e,e=>{e.kind===i.default.SyntaxKind.EnumDeclaration&&this.preHandleEnumDeclaration(e)}),i.default.forEachChild(e,e=>{this.handleSourceFile(e)})}preHandleEnumDeclaration(e){const n=e.members;if(n.length>0){const t=n[0];if(t.initializer)this.handleEnumDeclarationInitializer(e,n,t.initializer);else{const t={kind:"enum",name:e.name.text,type:"uint32",members:[]};let r=0;for(const e of n){const n=e.name;if(e.initializer&&e.initializer.kind===i.default.SyntaxKind.NumericLiteral){const i=+e.initializer.text;t.members.push({name:n.text,value:i}),r=i+1}else t.members.push({name:n.text,value:r}),r++}this.models.push(t)}}}handleEnumDeclarationInitializer(e,n,t){const r={kind:"enum",name:e.name.text,type:t.kind===i.default.SyntaxKind.StringLiteral?i.default.ClassificationTypeNames.stringLiteral:"uint32",members:[]};for(const e of n)if(e.initializer){const n=e.name;if(e.initializer.kind===i.default.SyntaxKind.StringLiteral){const t=e.initializer;r.members.push({name:n.text,value:t.text})}else if(e.initializer.kind===i.default.SyntaxKind.NumericLiteral){const t=e.initializer;r.members.push({name:n.text,value:+t.text})}}this.models.push(r)}handleSourceFile(e){const n=this.getJsDocs(e),t=n.find(e=>"entry"===e.name);e.kind===i.default.SyntaxKind.TypeAliasDeclaration?this.handleTypeAliasDeclaration(e,n,t):e.kind===i.default.SyntaxKind.InterfaceDeclaration&&this.handleInterfaceDeclaration(e,n,t)}handleInterfaceDeclaration(e,n,t){if(this.models.some(n=>n.name===e.name.text))return;let i,{members:r,minProperties:m,maxProperties:a,additionalProperties:o}=this.getObjectMembers(e.members);({minProperties:m,maxProperties:a,additionalProperties:i}=this.handleHeritageClauses(e,r,m,a)),i&&(o=i);const s={kind:"object",name:e.name.text,members:r,minProperties:m,maxProperties:void 0===o?a:void 0,additionalProperties:o,entry:t?t.comment:void 0};for(const e of n)this.setJsonSchemaObject(e,s);this.models.push(s)}handleHeritageClauses(e,n,t,r){let m;if(e.heritageClauses)for(const a of e.heritageClauses)if(a.kind===i.default.SyntaxKind.HeritageClause)for(const e of a.types)e.kind===i.default.SyntaxKind.ExpressionWithTypeArguments&&({minProperties:t,maxProperties:r,additionalProperties:m}=this.handleExpressionWithTypeArguments(e.expression,n,t,r));return{minProperties:t,maxProperties:r,additionalProperties:m}}handleExpressionWithTypeArguments(e,n,t,i){const r=e.text;let m;this.preHandleType(r);const a=this.models.find(e=>"object"===e.kind&&e.name===r);if(a&&"object"===a.kind){m=a.additionalProperties;for(const e of a.members)n.every(n=>n.name!==e.name)&&(n.push(e),i++,e.optional||t++)}return{minProperties:t,maxProperties:i,additionalProperties:m}}handleTypeAliasDeclaration(e,n,t){if(e.type.kind===i.default.SyntaxKind.ArrayType)this.handleArrayTypeInTypeAliasDeclaration(e.type,e.name,n,t);else if(e.type.kind===i.default.SyntaxKind.TypeLiteral||e.type.kind===i.default.SyntaxKind.UnionType||e.type.kind===i.default.SyntaxKind.IntersectionType)this.handleTypeLiteralOrUnionTypeOrIntersectionType(e.type,e.name,n,t);else if(e.type.kind===i.default.SyntaxKind.TypeReference){const n=e.type,t={kind:"reference",newName:e.name.text,name:n.typeName.text};this.models.push(t)}}handleTypeLiteralOrUnionTypeOrIntersectionType(e,n,t,r){if(e.kind===i.default.SyntaxKind.UnionType){const t=e;if(t.types.every(e=>e.kind===i.default.SyntaxKind.LiteralType||e.kind===i.default.SyntaxKind.NullKeyword))return void this.handleUnionTypeOfLiteralType(t,n);if(t.types.every(e=>e.kind===i.default.SyntaxKind.TypeReference)){const e={kind:"union",name:n.text,members:t.types.map(e=>this.getType(e)),entry:r?r.comment:void 0};return void this.models.push(e)}}const{members:m,minProperties:a,maxProperties:o,additionalProperties:s}=this.getMembersInfo(e),p={kind:"object",name:n.text,members:m,minProperties:a,maxProperties:void 0===s?o:void 0,additionalProperties:s,entry:r?r.comment:void 0};for(const e of t)this.setJsonSchemaObject(e,p);this.models.push(p)}handleUnionTypeOfLiteralType(e,n){let t;const r=[];for(const n of e.types)if(n.kind===i.default.SyntaxKind.LiteralType){const e=n;e.literal.kind===i.default.SyntaxKind.StringLiteral?(t="string",r.push(e.literal.text)):e.literal.kind===i.default.SyntaxKind.NumericLiteral&&(t="number",r.push(+e.literal.text))}else n.kind===i.default.SyntaxKind.NullKeyword&&r.push(null);if(t)if("string"===t){const e={kind:t,name:n.text,enums:r};this.models.push(e)}else{const e={kind:t,type:t,name:n.text,enums:r};this.models.push(e)}}handleArrayTypeInTypeAliasDeclaration(e,n,t,i){const r=this.getType(e.elementType),m={kind:"array",name:n.text,type:r,entry:i?i.comment:void 0};for(const e of t)this.setJsonSchemaArray(e,m);this.models.push(m)}getJsDocs(e){const n=e.jsDoc,t=[];if(n&&n.length>0)for(const e of n)if(e.tags)for(const n of e.tags)t.push(this.getJsDocFromTag(n));return t}getJsDocFromTag(e){let n,t,i;if("param"===e.tagName.text){const r=e.typeExpression;n=this.getType(r.type),t=e.name.text,i=e.isBracketed}return{name:e.tagName.text,type:n,paramName:t,comment:e.comment,optional:i}}getType(e){if(e.kind===i.default.SyntaxKind.StringKeyword)return{kind:"string"};if(e.kind===i.default.SyntaxKind.NumberKeyword)return{kind:"number",type:"number"};if(e.kind===i.default.SyntaxKind.BooleanKeyword)return{kind:"boolean"};if(e.kind===i.default.SyntaxKind.TypeLiteral)return this.getTypeOfTypeLiteral(e);if(e.kind===i.default.SyntaxKind.ArrayType){const n=e;return{kind:"array",type:this.getType(n.elementType)}}if(e.kind===i.default.SyntaxKind.TypeReference)return this.getTypeOfTypeReference(e);if(e.kind===i.default.SyntaxKind.UnionType)return this.getTypeOfUnionType(e);if(e.kind===i.default.SyntaxKind.TupleType){const n=e;let t;for(const e of n.elementTypes)t=this.getType(e);if(t)return{kind:"array",type:t,minItems:n.elementTypes.length,maxItems:n.elementTypes.length}}else{if(e.kind===i.default.SyntaxKind.LiteralType)return this.getTypeOfLiteralType(e);if(e.kind===i.default.SyntaxKind.NullKeyword)return{kind:"null"}}return{kind:void 0}}getTypeOfLiteralType(e){let n;const t=[];return e.literal.kind===i.default.SyntaxKind.StringLiteral?(n="string",t.push(e.literal.text)):e.literal.kind===i.default.SyntaxKind.NumericLiteral&&(n="number",t.push(+e.literal.text)),n?{kind:"enum",type:n,name:n,enums:t}:{kind:void 0}}getTypeOfUnionType(e){if(!e.types.every(e=>e.kind===i.default.SyntaxKind.LiteralType))return{kind:"union",members:e.types.map(e=>this.getType(e))};{let n;const t=[];for(const r of e.types){const e=r;e.literal.kind===i.default.SyntaxKind.StringLiteral?(n="string",t.push(e.literal.text)):e.literal.kind===i.default.SyntaxKind.NumericLiteral&&(n="number",t.push(+e.literal.text))}if(n)return{kind:"enum",type:n,name:n,enums:t}}return{kind:void 0}}getTypeOfArrayTypeReference(e){if(e.typeArguments&&1===e.typeArguments.length){const n=e.typeArguments[0];return{kind:"array",type:this.getType(n)}}return{kind:"array",type:{kind:void 0}}}getTypeOfTypeReference(e){if(e.typeName.kind===i.default.SyntaxKind.Identifier)return r.includes(e.typeName.text)?{kind:"number",type:e.typeName.text}:"Array"===e.typeName.text?this.getTypeOfArrayTypeReference(e):{kind:"reference",name:e.typeName.text};if(e.typeName.kind===i.default.SyntaxKind.QualifiedName){const n=e.typeName.left.text,t=this.models.find(e=>"enum"===e.kind&&e.name===n);if(t)return{kind:"enum",name:t.name,type:t.type,enums:t.members.map(e=>e.value)}}return{kind:void 0}}getTypeOfTypeLiteral(e){if(1!==e.members.length||e.members[0].kind!==i.default.SyntaxKind.IndexSignature){const{members:n,minProperties:t,maxProperties:i,additionalProperties:r}=this.getMembersInfo(e);return{kind:"object",members:n,minProperties:t,maxProperties:void 0===r?i:void 0,additionalProperties:r}}{const n=e.members[0];if(1===n.parameters.length){const e=n.parameters[0].type;if(e&&n.type)return{kind:"map",key:this.getType(e),value:this.getType(n.type)}}}return{kind:void 0}}getMembersInfo(e){if(e.kind===i.default.SyntaxKind.TypeLiteral){const n=e;return this.getObjectMembers(n.members)}return e.kind===i.default.SyntaxKind.UnionType?this.getMembersInfoOfUnionType(e):e.kind===i.default.SyntaxKind.IntersectionType?this.getMembersInfoOfIntersectionType(e):e.kind===i.default.SyntaxKind.ParenthesizedType?this.getMembersInfoOfParenthesizedType(e):e.kind===i.default.SyntaxKind.TypeReference?this.getMembersInfoOfTypeReference(e):{members:[],minProperties:0,maxProperties:0}}getMembersInfoOfUnionType(e){const n=[];let t=1/0,i=0;for(const r of e.types){const e=this.getMembersInfo(r);if(t>e.minProperties&&(t=e.minProperties),i<e.maxProperties&&(i=e.maxProperties),0===n.length){const t=JSON.parse(JSON.stringify(e.members));n.push(...t)}else{const t=e.members;this.setOptionalAndEnumOfUnionType(n,t);for(const e of t)if(n.every(n=>n.name!==e.name)){const t=JSON.parse(JSON.stringify(e));t.optional=!0,n.push(t)}}}return{members:n,minProperties:t,maxProperties:i}}setOptionalAndEnumOfUnionType(e,n){for(const t of e){const e=n.find(e=>e.name===t.name);e?this.setEnumOfUnionType(t,e):t.optional=!0}}setEnumOfUnionType(e,n){if("enum"===n.type.kind&&"enum"===e.type.kind)for(const t of n.type.enums)e.type.enums.every(e=>e!==t)&&e.type.enums.push(t)}getMembersInfoOfIntersectionType(e){const n=[];let t=0,i=0;for(const r of e.types){const e=this.getMembersInfo(r);t+=e.minProperties,i+=e.maxProperties;const m=e.members;for(const e of m)n.every(n=>n.name!==e.name)&&n.push(JSON.parse(JSON.stringify(e)))}return{members:n,minProperties:t,maxProperties:i}}getMembersInfoOfParenthesizedType(e){const n=[],t=this.getMembersInfo(e.type),i=t.minProperties,r=t.maxProperties,m=JSON.parse(JSON.stringify(t.members));for(const e of m)n.push(e);return{members:n,minProperties:i,maxProperties:r}}getMembersInfoOfTypeReference(e){const n=[];let t=0,i=0;const r=e.typeName.text;this.preHandleType(r);const m=this.models.find(e=>"object"===e.kind&&e.name===r);if(m&&"object"===m.kind)for(const e of m.members)n.every(n=>n.name!==e.name)&&(n.push(JSON.parse(JSON.stringify(e))),i++,e.optional||t++);return{members:n,minProperties:t,maxProperties:i}}preHandleType(e){if(this.models.some(n=>n.name===e))return;let n=!1;i.default.forEachChild(this.sourceFile,t=>{n||(t.kind===i.default.SyntaxKind.InterfaceDeclaration?t.name.text===e&&(n=!0,this.handleSourceFile(t)):t.kind===i.default.SyntaxKind.TypeAliasDeclaration&&t.name.text===e&&(n=!0,this.handleSourceFile(t)))})}getObjectMembers(e){const n=[];let t,r=0,m=0;for(const a of e)if(a.kind===i.default.SyntaxKind.PropertySignature){const e=a,t=this.getObjectMemberOfPropertySignature(e);n.push(t),e.questionToken||r++,m++}else if(a.kind===i.default.SyntaxKind.IndexSignature){const e=a;e.type&&(t=this.getType(e.type))}return{members:n,minProperties:r,maxProperties:m,additionalProperties:t}}getObjectMemberOfPropertySignature(e){const n={name:e.name.text,type:{kind:void 0}};e.questionToken&&(n.optional=!0),e.type&&(n.type=this.getType(e.type));const t=this.getJsDocs(e);for(const e of t)"tag"===e.name?this.setJsonSchemaTag(e,n):"mapValueType"===e.name?this.setJsonSchemaMapValue(e,n.type):"type"===e.name?this.overrideType(n.type,e):"param"===e.name?this.setJsonSchemaParam(e,n):"array"===n.type.kind?this.setJsonSchemaArray(e,n.type):"number"===n.type.kind?this.setJsonSchemaNumber(e,n.type):"string"===n.type.kind?this.setJsonSchemaString(e,n.type):"boolean"===n.type.kind?this.setJsonSchemaBoolean(e,n.type):"object"===n.type.kind?this.setJsonSchemaObject(e,n.type):"reference"===n.type.kind&&this.setJsonSchemaReference(e,n.type);return n}setJsonSchemaReference(e,n){e.comment&&(n.default=JSON.parse(this.getJsDocComment(e.comment)))}setJsonSchemaTag(e,n){e.comment&&(n.tag=+e.comment)}setJsonSchemaMapValue(e,n){e.comment&&"map"===n.kind&&"number"===n.value.kind&&(n.value.type=e.comment)}setJsonSchemaParam(e,n){e.paramName&&e.type&&(n.parameters||(n.parameters=[]),n.parameters.push({name:e.paramName,type:e.type,optional:e.optional})),this.overrideType(n.type,e)}setJsonSchemaBoolean(e,n){e.comment&&("default"===e.name?n.default="true"===this.getJsDocComment(e.comment).toLowerCase():"title"===e.name?n.title=e.comment:"description"===e.name&&(n.description=e.comment))}getJsDocComment(e){return e.length>=2&&(e.startsWith("'")&&e.endsWith("'")||e.startsWith('"')&&e.endsWith('"')||e.startsWith("`")&&e.endsWith("`"))?e.substring(1,e.length-1):e}setJsonSchemaString(e,n){e.comment&&("minLength"===e.name?n.minLength=+e.comment:"maxLength"===e.name?n.maxLength=+e.comment:"pattern"===e.name?n.pattern=e.comment:"default"===e.name?n.default=this.getJsDocComment(e.comment):"title"===e.name?n.title=e.comment:"description"===e.name&&(n.description=e.comment))}setJsonSchemaNumber(e,n){e.comment&&("multipleOf"===e.name?n.multipleOf=+e.comment:"maximum"===e.name?n.maximum=+e.comment:"minimum"===e.name?n.minimum=+e.comment:"exclusiveMaximum"===e.name?n.exclusiveMaximum=+e.comment:"exclusiveMinimum"===e.name?n.exclusiveMinimum=+e.comment:"default"===e.name?n.default=+this.getJsDocComment(e.comment):"title"===e.name?n.title=e.comment:"description"===e.name&&(n.description=e.comment))}overrideType(e,n){n&&n.comment&&("number"===e.kind?e.type=n.comment:"array"===e.kind&&"number"===e.type.kind&&(e.type={kind:e.type.kind,type:n.comment}))}setJsonSchemaArray(e,n){e.comment?"minItems"===e.name?n.minItems=+e.comment:"maxItems"===e.name?n.maxItems=+e.comment:"itemType"===e.name?this.overrideType(n,e):"number"===n.type.kind?this.setJsonSchemaNumberArray(e,n.type):"string"===n.type.kind?this.setJsonSchemaStringArray(e,n.type):"boolean"===n.type.kind?"itemDefault"===e.name&&(n.type.default="true"===this.getJsDocComment(e.comment).toLowerCase()):"default"===e.name&&(n.default=JSON.parse(this.getJsDocComment(e.comment))):"uniqueItems"===e.name?n.uniqueItems=!0:"title"===e.name?n.title=e.comment:"description"===e.name&&(n.description=e.comment)}setJsonSchemaNumberArray(e,n){e.comment&&("itemMultipleOf"===e.name?n.multipleOf=+e.comment:"itemMinimum"===e.name?n.minimum=+e.comment:"itemMaximum"===e.name?n.maximum=+e.comment:"itemExclusiveMinimum"===e.name?n.exclusiveMinimum=+e.comment:"itemExclusiveMaximum"===e.name?n.exclusiveMaximum=+e.comment:"itemDefault"===e.name&&(n.default=+this.getJsDocComment(e.comment)))}setJsonSchemaStringArray(e,n){e.comment&&("itemMinLength"===e.name?n.minLength=+e.comment:"itemMaxLength"===e.name?n.maxLength=+e.comment:"itemPattern"===e.name?n.pattern=e.comment:"itemDefault"===e.name&&(n.default=this.getJsDocComment(e.comment)))}setJsonSchemaObject(e,n){e.comment?"minProperties"===e.name?n.minProperties=+e.comment:"maxProperties"===e.name?n.maxProperties=+e.comment:"default"===e.name?n.default=JSON.parse(this.getJsDocComment(e.comment)):"title"===e.name?n.title=e.comment:"description"===e.name&&(n.description=e.comment):"additionalProperties"===e.name&&(n.additionalProperties=!0)}};const r=["double","float","uint32","fixed32","integer","int32","sint32","sfixed32","uint64","fixed64","int64","sint64","sfixed64"]}});