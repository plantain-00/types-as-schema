webpackJsonp([0],{166:function(e,n,t){"use strict";t.d(n,"a",function(){return m});var r=t(39),i=t(25),m=(t.n(i),function(){function e(e){var n=this;this.sourceFile=e,this.models=[],this.numberTypes=["double","float","uint32","fixed32","integer","int32","sint32","sfixed32","uint64","fixed64","int64","sint64","sfixed64"],i.forEachChild(e,function(e){if(e.kind===i.SyntaxKind.EnumDeclaration){var t=e,m=t.members;if(m.length>0){var a=m[0];if(a.initializer){var o={kind:"enum",name:t.name.text,type:a.initializer.kind===i.SyntaxKind.StringLiteral?i.ClassificationTypeNames.stringLiteral:"uint32",members:[]};try{for(var u=r.d(m),s=u.next();!s.done;s=u.next()){var p=s.value;if(p.initializer){var y=p.name;if(p.initializer.kind===i.SyntaxKind.StringLiteral){var l=p.initializer;o.members.push({name:y.text,value:l.text})}else if(p.initializer.kind===i.SyntaxKind.NumericLiteral){var l=p.initializer;o.members.push({name:y.text,value:+l.text})}}}}catch(e){x={error:e}}finally{try{s&&!s.done&&(h=u.return)&&h.call(u)}finally{if(x)throw x.error}}n.models.push(o)}else{var o={kind:"enum",name:t.name.text,type:"uint32",members:[]},c=0;try{for(var f=r.d(m),d=f.next();!d.done;d=f.next()){var p=d.value,b=p.name;if(p.initializer&&p.initializer.kind===i.SyntaxKind.NumericLiteral){var l=p.initializer,v=+l.text;o.members.push({name:b.text,value:v}),c=v+1}else o.members.push({name:b.text,value:c}),c++}}catch(e){g={error:e}}finally{try{d&&!d.done&&(k=f.return)&&k.call(f)}finally{if(g)throw g.error}}n.models.push(o)}}}var x,h,g,k}),i.forEachChild(e,function(e){n.handleSourceFile(e)})}return e.prototype.generateProtobuf=function(){var e=[];try{for(var n=r.d(this.models),t=n.next();!t.done;t=n.next()){var i=t.value;if("object"===i.kind){var m=[],a=i.members.reduce(function(e,n){return n.tag?Math.max(e,n.tag):e},0);try{for(var o=r.d(i.members),u=o.next();!u.done;u=o.next()){var s=u.value;s.tag||a++;var p=this.getProtobufProperty(s.type),y=p.modifier,l=p.propertyType;l&&m.push("    "+y+l+" "+s.name+" = "+(s.tag?s.tag:a)+";")}}catch(e){v={error:e}}finally{try{u&&!u.done&&(x=o.return)&&x.call(o)}finally{if(v)throw v.error}}e.push("message "+i.name+" {\n"+m.join("\n")+"\n}")}else if("enum"===i.kind){var m=[];try{for(var c=r.d(i.members),f=c.next();!f.done;f=c.next()){var s=f.value;"number"==typeof s.value&&m.push("    "+s.name+" = "+s.value+";")}}catch(e){h={error:e}}finally{try{f&&!f.done&&(g=c.return)&&g.call(c)}finally{if(h)throw h.error}}m.length>0&&e.push("enum "+i.name+" {\n"+m.join("\n")+"\n}")}}}catch(e){d={error:e}}finally{try{t&&!t.done&&(b=n.return)&&b.call(n)}finally{if(d)throw d.error}}return'syntax = "proto3";\n\n'+e.join("\n\n")+"\n";var d,b,v,x,h,g},e.prototype.generateJsonSchemas=function(){var e=this,n={};try{for(var t=r.d(this.models),i=t.next();!i.done;i=t.next()){var m=i.value;"object"!==m.kind&&"array"!==m.kind||(n[m.name]=this.getJsonSchemaProperty(m))}}catch(e){a={error:e}}finally{try{i&&!i.done&&(o=t.return)&&o.call(t)}finally{if(a)throw a.error}}return this.models.filter(function(e){return("object"===e.kind||"array"===e.kind)&&e.entry}).map(function(t){return{entry:t.entry,schema:{$ref:"#/definitions/"+t.name,definitions:e.getReferencedDefinitions(t.name,n)}}});var a,o},e.prototype.handleSourceFile=function(e){var n=this.getJsDocs(e),t=n.find(function(e){return"entry"===e.name});if(e.kind===i.SyntaxKind.TypeAliasDeclaration){var m=e;if(m.type.kind===i.SyntaxKind.ArrayType){var a=m.type,o=this.getType(a.elementType),u={kind:"array",name:m.name.text,type:o,entry:t?t.comment:void 0};try{for(var s=r.d(n),p=s.next();!p.done;p=s.next()){var y=p.value;this.setJsonSchemaArray(y,u)}}catch(e){N={error:e}}finally{try{p&&!p.done&&(K=s.return)&&K.call(s)}finally{if(N)throw N.error}}this.models.push(u)}else if(m.type.kind===i.SyntaxKind.TypeLiteral||m.type.kind===i.SyntaxKind.UnionType||m.type.kind===i.SyntaxKind.IntersectionType){var l=this.getMembersInfo(m.type),c=l.members,f=l.minProperties,d=l.maxProperties,u={kind:"object",name:m.name.text,members:c,minProperties:f,maxProperties:d,entry:t?t.comment:void 0};try{for(var b=r.d(n),v=b.next();!v.done;v=b.next()){var y=v.value;this.setJsonSchemaObject(y,u)}}catch(e){E={error:e}}finally{try{v&&!v.done&&(L=b.return)&&L.call(b)}finally{if(E)throw E.error}}this.models.push(u)}}else if(e.kind===i.SyntaxKind.InterfaceDeclaration){var x=e;if(this.models.some(function(e){return e.name===x.name.text}))return;var h=this.getObjectMembers(x.members),c=h.members,g=h.minProperties,k=h.maxProperties,f=g,d=k;if(x.heritageClauses)try{for(var M=r.d(x.heritageClauses),S=M.next();!S.done;S=M.next()){var T=S.value;if(T.kind===i.SyntaxKind.HeritageClause){var P=this;try{for(var I=r.d(T.types),j=I.next();!j.done;j=I.next()){var o=j.value;!function(e){if(e.kind===i.SyntaxKind.ExpressionWithTypeArguments){var n=e.expression.text;P.preHandleType(n);var t=P.models.find(function(e){return"object"===e.kind&&e.name===n});if(t&&"object"===t.kind){try{for(var m=r.d(t.members),a=m.next();!a.done;a=m.next()){var o=a.value;!function(e){c.every(function(n){return n.name!==e.name})&&(c.push(e),d++,e.optional||f++)}(o)}}catch(e){u={error:e}}finally{try{a&&!a.done&&(s=m.return)&&s.call(m)}finally{if(u)throw u.error}}}}var u,s}(o)}}catch(e){A={error:e}}finally{try{j&&!j.done&&(D=I.return)&&D.call(I)}finally{if(A)throw A.error}}}}}catch(e){J={error:e}}finally{try{S&&!S.done&&(U=M.return)&&U.call(M)}finally{if(J)throw J.error}}var u={kind:"object",name:x.name.text,members:c,minProperties:f,maxProperties:d,entry:t?t.comment:void 0};try{for(var O=r.d(n),w=O.next();!w.done;w=O.next()){var y=w.value;this.setJsonSchemaObject(y,u)}}catch(e){z={error:e}}finally{try{w&&!w.done&&(F=O.return)&&F.call(O)}finally{if(z)throw z.error}}this.models.push(u)}var N,K,E,L,J,U,A,D,z,F},e.prototype.preHandleType=function(e){var n=this;if(!this.models.some(function(n){return n.name===e})){var t=!1;i.forEachChild(this.sourceFile,function(r){if(!t)if(r.kind===i.SyntaxKind.InterfaceDeclaration){var m=r;m.name.text===e&&(t=!0,n.handleSourceFile(r))}else if(r.kind===i.SyntaxKind.TypeAliasDeclaration){var m=r;m.name.text===e&&(t=!0,n.handleSourceFile(r))}})}},e.prototype.overrideType=function(e,n){n&&n.comment&&("number"===e.kind?e.type=n.comment:"array"===e.kind&&"number"===e.type.kind&&(e.type={kind:e.type.kind,type:n.comment}))},e.prototype.getMembersInfo=function(e){var n=[],t=0,m=0;if(e.kind===i.SyntaxKind.TypeLiteral){var a=e;return this.getObjectMembers(a.members)}if(e.kind===i.SyntaxKind.UnionType){var o=e;t=1/0;try{for(var u=r.d(o.types),s=u.next();!s.done;s=u.next()){var p=s.value,y=this.getMembersInfo(p);if(t>y.minProperties&&(t=y.minProperties),m<y.maxProperties&&(m=y.maxProperties),0===n.length){var l=JSON.parse(JSON.stringify(y.members));n.push.apply(n,r.c(l))}else{var l=y.members;try{for(var c=r.d(n),f=c.next();!f.done;f=c.next()){var d=f.value;!function(e){l.every(function(n){return n.name!==e.name})&&(e.optional=!0)}(d)}}catch(e){E={error:e}}finally{try{f&&!f.done&&(L=c.return)&&L.call(c)}finally{if(E)throw E.error}}try{for(var b=r.d(l),v=b.next();!v.done;v=b.next()){var d=v.value;!function(e){if(n.every(function(n){return n.name!==e.name})){var t=JSON.parse(JSON.stringify(e));t.optional=!0,n.push(t)}}(d)}}catch(e){J={error:e}}finally{try{v&&!v.done&&(U=b.return)&&U.call(b)}finally{if(J)throw J.error}}}}}catch(e){N={error:e}}finally{try{s&&!s.done&&(K=u.return)&&K.call(u)}finally{if(N)throw N.error}}}else if(e.kind===i.SyntaxKind.IntersectionType){var x=e;try{for(var h=r.d(x.types),g=h.next();!g.done;g=h.next()){var p=g.value,y=this.getMembersInfo(p);t+=y.minProperties,m+=y.maxProperties;var l=y.members;try{for(var k=r.d(l),M=k.next();!M.done;M=k.next()){var d=M.value;!function(e){n.every(function(n){return n.name!==e.name})&&n.push(JSON.parse(JSON.stringify(e)))}(d)}}catch(e){z={error:e}}finally{try{M&&!M.done&&(F=k.return)&&F.call(k)}finally{if(z)throw z.error}}}}catch(e){A={error:e}}finally{try{g&&!g.done&&(D=h.return)&&D.call(h)}finally{if(A)throw A.error}}}else if(e.kind===i.SyntaxKind.ParenthesizedType){var S=e,y=this.getMembersInfo(S.type);t=y.minProperties,m=y.maxProperties;var l=JSON.parse(JSON.stringify(y.members));try{for(var T=r.d(l),P=T.next();!P.done;P=T.next()){var d=P.value;n.push(d)}}catch(e){R={error:e}}finally{try{P&&!P.done&&(_=T.return)&&_.call(T)}finally{if(R)throw R.error}}}else if(e.kind===i.SyntaxKind.TypeReference){var I=e.typeName.text;this.preHandleType(I);var j=this.models.find(function(e){return"object"===e.kind&&e.name===I});if(j&&"object"===j.kind){try{for(var O=r.d(j.members),w=O.next();!w.done;w=O.next()){var d=w.value;!function(e){n.every(function(n){return n.name!==e.name})&&(n.push(JSON.parse(JSON.stringify(e))),m++,e.optional||t++)}(d)}}catch(e){q={error:e}}finally{try{w&&!w.done&&(C=O.return)&&C.call(O)}finally{if(q)throw q.error}}}}return{members:n,minProperties:t,maxProperties:m};var N,K,E,L,J,U,A,D,z,F,R,_,q,C},e.prototype.getObjectMembers=function(e){var n=[],t=0,m=0;try{for(var a=r.d(e),o=a.next();!o.done;o=a.next()){var u=o.value;if(u.kind===i.SyntaxKind.PropertySignature){var s=u,p=s.name,y={name:p.text,type:{kind:"unknown"}};n.push(y),s.questionToken?y.optional=!0:t++,m++,s.type&&(y.type=this.getType(s.type));var l=this.getJsDocs(s);try{for(var c=r.d(l),f=c.next();!f.done;f=c.next()){var d=f.value;"tag"===d.name?d.comment&&(y.tag=+d.comment):"mapValueType"===d.name?d.comment&&"map"===y.type.kind&&"number"===y.type.value.kind&&(y.type.value.type=d.comment):"type"===d.name?this.overrideType(y.type,d):"array"===y.type.kind?this.setJsonSchemaArray(d,y.type):"number"===y.type.kind?d.comment&&("multipleOf"===d.name?y.type.multipleOf=+d.comment:"maximum"===d.name?y.type.maximum=+d.comment:"minimum"===d.name?y.type.minimum=+d.comment:"exclusiveMaximum"===d.name?y.type.exclusiveMaximum=+d.comment:"exclusiveMinimum"===d.name&&(y.type.exclusiveMinimum=+d.comment)):"string"===y.type.kind?d.comment&&("minLength"===d.name?y.type.minLength=+d.comment:"maxLength"===d.name?y.type.maxLength=+d.comment:"pattern"===d.name&&(y.type.pattern=d.comment)):"object"===y.type.kind&&this.setJsonSchemaObject(d,y.type)}}catch(e){x={error:e}}finally{try{f&&!f.done&&(h=c.return)&&h.call(c)}finally{if(x)throw x.error}}}}}catch(e){b={error:e}}finally{try{o&&!o.done&&(v=a.return)&&v.call(a)}finally{if(b)throw b.error}}return{members:n,minProperties:t,maxProperties:m};var b,v,x,h},e.prototype.setJsonSchemaArray=function(e,n){e.comment?"minItems"===e.name?n.minItems=+e.comment:"maxItems"===e.name?n.maxItems=+e.comment:"itemType"===e.name?this.overrideType(n,e):"number"===n.type.kind?"itemMultipleOf"===e.name?n.type.multipleOf=+e.comment:"itemMinimum"===e.name?n.type.minimum=+e.comment:"itemMaximum"===e.name?n.type.maximum=+e.comment:"itemExclusiveMinimum"===e.name?n.type.exclusiveMinimum=+e.comment:"itemExclusiveMaximum"===e.name&&(n.type.exclusiveMaximum=+e.comment):"string"===n.type.kind&&("itemMinLength"===e.name?n.type.minLength=+e.comment:"itemMaxLength"===e.name?n.type.maxLength=+e.comment:"itemPattern"===e.name&&(n.type.pattern=e.comment)):"uniqueItems"===e.name&&(n.uniqueItems=!0)},e.prototype.setJsonSchemaObject=function(e,n){e.comment?"minProperties"===e.name?n.minProperties=+e.comment:"maxProperties"===e.name&&(n.maxProperties=+e.comment):"additionalProperties"===e.name&&(n.additionalProperties=!0)},e.prototype.getType=function(e){if(e.kind===i.SyntaxKind.StringKeyword)return{kind:"string"};if(e.kind===i.SyntaxKind.NumberKeyword)return{kind:"number",type:"number"};if(e.kind===i.SyntaxKind.BooleanKeyword)return{kind:"boolean"};if(e.kind===i.SyntaxKind.TypeLiteral){var n=e;if(1!==n.members.length||n.members[0].kind!==i.SyntaxKind.IndexSignature){var t=this.getMembersInfo(n);return{kind:"object",members:t.members,minProperties:t.minProperties,maxProperties:t.maxProperties}}var r=n.members[0];if(1===r.parameters.length){var m=r.parameters[0].type;if(m&&r.type)return{kind:"map",key:this.getType(m),value:this.getType(r.type)}}}else{if(e.kind===i.SyntaxKind.ArrayType){var a=e;return{kind:"array",type:this.getType(a.elementType)}}if(e.kind===i.SyntaxKind.TypeReference){var o=e;if(o.typeName.kind===i.SyntaxKind.Identifier){var u=o.typeName;return this.numberTypes.includes(u.text)?{kind:"number",type:u.text}:{kind:"reference",name:u.text}}if(o.typeName.kind===i.SyntaxKind.QualifiedName){var s=o.typeName,p=s.left.text,y=this.models.find(function(e){return"enum"===e.kind&&e.name===p});if(y)return{kind:"enum",name:y.name,type:y.type,enums:y.members.map(function(e){return e.value})}}}}return{kind:"unknown"}},e.prototype.getJsDocs=function(e){var n=e.jsDoc,t=[];if(n&&n.length>0)try{for(var i=r.d(n),m=i.next();!m.done;m=i.next()){var a=m.value;if(a.tags)try{for(var o=r.d(a.tags),u=o.next();!u.done;u=o.next()){var s=u.value;t.push({name:s.tagName.text,comment:s.comment})}}catch(e){l={error:e}}finally{try{u&&!u.done&&(c=o.return)&&c.call(o)}finally{if(l)throw l.error}}}}catch(e){p={error:e}}finally{try{m&&!m.done&&(y=i.return)&&y.call(i)}finally{if(p)throw p.error}}return t;var p,y,l,c},e.prototype.getProtobufProperty=function(e){var n="",t="";if("map"===e.kind){var r="";if("number"===e.value.kind){r=this.getProtobufProperty(e.value).propertyType}else"reference"===e.value.kind&&(r=e.value.name);r&&(t="map<"+e.key.kind+", "+r+">")}else if("array"===e.kind){n="repeated ";var i=this.getProtobufProperty(e.type).propertyType;t=i}else if("enum"===e.kind)t="string"===e.type?"string":e.name;else if("reference"===e.kind){var m=this.models.find(function(n){return"enum"===n.kind&&n.name===e.name});t=m&&"enum"===m.kind&&"string"===m.type?"string":e.name}else"number"===e.kind?t="number"===e.type?"double":"integer"===e.type?"int32":e.type:"string"===e.kind?t=e.kind:"boolean"===e.kind&&(t="bool");return{modifier:n,propertyType:t}},e.prototype.getReferencedDefinitions=function(e,n){var t={},r=n[e];if(void 0===r)return t;if(t[e]=r,"array"===r.type){if(void 0===r.items.type){var i=r.items.$ref.substring("#/definitions/".length);Object.assign(t,this.getReferencedDefinitions(i,n))}}else if("object"===r.type&&r.properties)for(var m in r.properties)if(r.properties.hasOwnProperty(m)){var a=r.properties[m];if(void 0===a.type){var i=a.$ref.substring("#/definitions/".length);Object.assign(t,this.getReferencedDefinitions(i,n))}else if("array"===a.type&&void 0===a.items.type){var i=a.items.$ref.substring("#/definitions/".length);Object.assign(t,this.getReferencedDefinitions(i,n))}}return t},e.prototype.getNumberType=function(e){var n;return n="double"===e.type||"float"===e.type?{type:"number",minimum:e.minimum,maximum:e.maximum}:"uint32"===e.type||"fixed32"===e.type?{type:"integer",minimum:void 0!==e.minimum?e.minimum:0,maximum:void 0!==e.maximum?e.maximum:4294967295}:"int32"===e.type||"sint32"===e.type||"sfixed32"===e.type?{type:"integer",minimum:void 0!==e.minimum?e.minimum:-2147483648,maximum:void 0!==e.maximum?e.maximum:2147483647}:"uint64"===e.type||"fixed64"===e.type?{type:"integer",minimum:void 0!==e.minimum?e.minimum:0,maximum:void 0!==e.maximum?e.maximum:0x10000000000000000}:"int64"===e.type||"sint64"===e.type||"sfixed64"===e.type?{type:"integer",minimum:void 0!==e.minimum?e.minimum:-0x8000000000000000,maximum:void 0!==e.maximum?e.maximum:0x8000000000000000}:"number"===e.type||"integer"===e.type?{type:e.type,minimum:e.minimum,maximum:e.maximum}:{type:e.kind,minimum:e.minimum,maximum:e.maximum},Object.assign(n,{multipleOf:e.multipleOf,exclusiveMinimum:e.exclusiveMinimum,exclusiveMaximum:e.exclusiveMaximum}),n},e.prototype.getJsonSchemaProperty=function(e){if("number"===e.kind)return this.getNumberType(e);if("boolean"===e.kind)return{type:"boolean"};if("map"===e.kind)return{type:"object",additionalProperties:this.getJsonSchemaProperty(e.value)};if("array"===e.kind)return{type:"array",items:this.getJsonSchemaProperty(e.type),uniqueItems:e.uniqueItems,minItems:e.minItems,maxItems:e.maxItems};if("enum"===e.kind){if("string"===e.type)return{type:"string",enum:e.enums};var n=this.getNumberType({kind:"number",type:e.type});return Object.assign(n,{enum:e.enums,minimum:void 0,maximum:void 0}),n}if("reference"===e.kind)return{type:void 0,$ref:"#/definitions/"+e.name};if("object"===e.kind){var t={},i=[];try{for(var m=r.d(e.members),a=m.next();!a.done;a=m.next()){var o=a.value;o.optional||i.push(o.name),t[o.name]=this.getJsonSchemaProperty(o.type)}}catch(e){u={error:e}}finally{try{a&&!a.done&&(s=m.return)&&s.call(m)}finally{if(u)throw u.error}}return{type:"object",properties:t,required:i,additionalProperties:void 0!==e.additionalProperties&&void 0,minProperties:e.minProperties>e.members.filter(function(e){return!e.optional}).length?e.minProperties:void 0,maxProperties:e.maxProperties<e.members.length?e.maxProperties:void 0}}return"string"===e.kind?{type:e.kind,minLength:e.minLength,maxLength:e.maxLength,pattern:e.pattern}:{type:e.kind};var u,s},e}())},167:function(e,n,t){"use strict";t.d(n,"a",function(){return r}),t.d(n,"b",function(){return i});var r='type TypeLiteral = {\n    typeLiteralMember1: number;\n    typeLiteralMember2: string;\n};\n\n/**\n * @minProperties 1\n * @maxProperties 1\n * @additionalProperties\n */\ninterface Interface {\n    interfaceMember1?: number;\n    interfaceMember2?: string;\n}\n\ntype TypeUnion1 = TypeLiteral | {\n    typeUnionMember1: number;\n    typeUnionMember2: string;\n};\ntype TypeUnion2 =\n    {\n        kind: StringEnum.enumMember1;\n        typeUnionMember1: string;\n    } | {\n        kind: StringEnum.enumMember2;\n        typeUnionMember2: string;\n    };\ntype TypeUnion3 =\n    {\n        kind: NumberEnum.enumMember1;\n        typeUnionMember1: string;\n    } | {\n        kind: NumberEnum.enumMember2;\n        typeUnionMember2: string;\n    };\ntype TypeUnion = {\n    typeUnionMember1: TypeUnion1;\n    typeUnionMember2: TypeUnion2;\n    typeUnionMember3: TypeUnion3;\n};\n\ninterface InterfaceExtends extends Interface {\n    interfaceExtendsMember1: number;\n    interfaceExtendsMember2: string;\n}\n\ntype TypeIntersection1 = Interface & {\n    typeIntersectionMember1: number;\n    typeIntersectionMember2: string;\n};\ntype TypeIntersection2 =\n    {\n        typeIntersectionMember1: number;\n        typeIntersectionMember2: string;\n    } & {\n        typeIntersectionMember3: number;\n        typeIntersectionMember4: string;\n    };\n\ntype TypeIntersection = {\n    typeIntersectionMember1: TypeIntersection1;\n    typeIntersectionMember2: TypeIntersection2;\n};\n\ntype TypeUnionAndIntersection =\n    {\n        typeIntersectionMember1: number;\n    } & (\n        {\n            kind: NumberEnum.enumMember1;\n            typeUnionMember1: string;\n        } | {\n            kind: NumberEnum.enumMember2;\n            typeUnionMember2: string;\n        }\n    );\n\nexport type TaggedField = {\n    /**\n     * @tag 2\n     */\n    taggedFieldMember1: number;\n    /**\n     * @tag 3\n     */\n    taggedFieldMember2: string;\n};\n\nexport const enum StringEnum {\n    enumMember1 = "enum member 1",\n    enumMember2 = "enum member 2",\n}\nexport const enum NumberEnum {\n    enumMember1,\n    enumMember2,\n}\nexport const enum NumberEnum2 {\n    enumMember1 = 3,\n    enumMember2 = 4,\n}\nexport type Enum = {\n    stringEnum: StringEnum;\n    numberEnum: NumberEnum;\n    numberEnum2: NumberEnum2;\n};\n\ntype integer = number;\ntype uint32 = number;\ntype int32 = number;\ntype sint32 = number;\ntype fixed32 = number;\ntype sfixed32 = number;\ntype uint64 = number;\ntype int64 = number;\ntype sint64 = number;\ntype fixed64 = number;\ntype sfixed64 = number;\ntype float = number;\ntype double = number;\n\ntype NumberType = {\n    /**\n     * @multipleOf 10\n     * @minimum 70\n     * @maximum 90\n     * @exclusiveMinimum 70\n     * @exclusiveMaximum 90\n     */\n    numberMember: number;\n\n    integerMember: integer;\n\n    uint32Member: uint32;\n    int32Member: int32;\n    sint32Member: sint32;\n    fixed32Member: fixed32;\n    sfixed32Member: sfixed32;\n\n    uint64Member: uint64;\n    int64Member: int64;\n    sint64Member: sint64;\n    fixed64Member: fixed64;\n    sfixed64Member: sfixed64;\n\n    floatMember: float;\n    doubleMember: double;\n};\n\ntype StringType = {\n    /**\n     * @minLength 10\n     * @maxLength 20\n     * @pattern ^[A-z]{3}$\n     */\n    stringMember: string;\n};\n\ntype ArrayType = {\n    /**\n     * @itemMinLength 10\n     * @itemMaxLength 20\n     * @itemPattern ^[A-z]{3}$\n     */\n    arrayType1: string[];\n    /**\n     * @uniqueItems\n     * @minItems 1\n     * @maxItems 10\n     */\n    arrayType2: TypeLiteral[];\n    arrayType3: { literal: number }[];\n    /**\n     * @itemType uint32\n     * @itemMultipleOf 100\n     * @itemMinimum 100\n     * @itemMaximum 200\n     * @itemExclusiveMinimum 300\n     * @itemExclusiveMaximum 400\n     */\n    arrayType4: number[];\n};\n\ntype MapType = {\n    mapType: { [name: string]: number };\n    mapType2: { [name: string]: TypeLiteral };\n    mapType3: { [name: string]: { literal: number } };\n    mapType4: { [name: string]: uint32 };\n};\n\n/**\n * @entry cases.json\n */\nexport type EntryType = {\n    optionalMember?: string;\n    booleanMember: boolean;\n    stringMember: string;\n    numberType: NumberType;\n    arrayType: ArrayType;\n    typeLiteral: { literal: number };\n    referenceType: TypeLiteral;\n    interfaceType: Interface;\n    typeUnion: TypeUnion;\n    interfaceExtends: InterfaceExtends;\n    typeIntersection: TypeIntersection;\n    typeUnionAndIntersection: TypeUnionAndIntersection;\n    mapType: MapType;\n    taggedField: TaggedField;\n    enum: Enum;\n    stringNumber: StringType;\n};\n',i='<div class="app"><textarea class="source" v-model="source"></textarea><div class="result"><button @click="generate()">generate</button><div class="options"><select v-model="selectedOption"><option v-for="option in options" :value="option">{{option}}</option></select></div><pre class="protobuf" v-if="selectedOption === \'protobuf\'">{{protobuf}}</pre><pre class="json-schema" v-if="jsonSchema">{{jsonSchema}}</pre></div></div>'},39:function(e,n,t){"use strict";function r(e,n){function t(){this.constructor=e}u(e,n),e.prototype=null===n?Object.create(n):(t.prototype=n.prototype,new t)}function i(e,n,t,r){var i,m=arguments.length,a=m<3?n:null===r?r=Object.getOwnPropertyDescriptor(n,t):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,n,t,r);else for(var o=e.length-1;o>=0;o--)(i=e[o])&&(a=(m<3?i(a):m>3?i(n,t,a):i(n,t))||a);return m>3&&a&&Object.defineProperty(n,t,a),a}function m(e){var n="function"==typeof Symbol&&e[Symbol.iterator],t=0;return n?n.call(e):{next:function(){return e&&t>=e.length&&(e=void 0),{value:e&&e[t++],done:!e}}}}function a(e,n){var t="function"==typeof Symbol&&e[Symbol.iterator];if(!t)return e;var r,i,m=t.call(e),a=[];try{for(;(void 0===n||n-- >0)&&!(r=m.next()).done;)a.push(r.value)}catch(e){i={error:e}}finally{try{r&&!r.done&&(t=m.return)&&t.call(m)}finally{if(i)throw i.error}}return a}function o(){for(var e=[],n=0;n<arguments.length;n++)e=e.concat(a(arguments[n]));return e}n.b=r,n.a=i,n.d=m,n.c=o;var u=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,n){e.__proto__=n}||function(e,n){for(var t in n)n.hasOwnProperty(t)&&(e[t]=n[t])};Object.assign},73:function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r=t(39),i=t(25),m=(t.n(i),t(38)),a=t.n(m),o=t(72),u=t.n(o),s=t(166),p=t(167),y="types-as-schema:source";new(function(e){function n(){var n=null!==e&&e.apply(this,arguments)||this;return n.protobuf="",n.options=["protobuf"],n.selectedOption="protobuf",n.innerSource=localStorage.getItem(y)||p.a,n.jsonSchemas=[],n}return r.b(n,e),Object.defineProperty(n.prototype,"source",{get:function(){return this.innerSource},set:function(e){this.innerSource=e,localStorage.setItem(y,e)},enumerable:!0,configurable:!0}),Object.defineProperty(n.prototype,"jsonSchema",{get:function(){var e=this;if(this.selectedOption){var n=this.jsonSchemas.find(function(n){return n.entry===e.selectedOption});if(n)return n.content}return""},enumerable:!0,configurable:!0}),n.prototype.generate=function(){if(this.source){var e=i.createSourceFile("",this.source,i.ScriptTarget.ESNext,!1,i.ScriptKind.TS),n=new s.a(e);this.protobuf=n.generateProtobuf(),this.jsonSchemas=n.generateJsonSchemas().map(function(e){return{entry:e.entry,content:JSON.stringify(e.schema,null,"  ")}}),this.options=["protobuf"];try{for(var t=r.d(this.jsonSchemas),m=t.next();!m.done;m=t.next()){var a=m.value;this.options.push(a.entry)}}catch(e){o={error:e}}finally{try{m&&!m.done&&(u=t.return)&&u.call(t)}finally{if(o)throw o.error}}}var o,u},n=r.a([u()({template:p.b})],n)}(a.a))({el:"#container"})}},[73]);