<template>
  <div class="app">
    <textarea class="source" v-model="source"></textarea>
    <div class="result">
      <button @click="generate()">generate</button>
      <div class="options">
        <select v-model="selectedOption">
          <option v-for="option in options" :value="option" :key="option">{{option}}</option>
        </select>
      </div>
      <pre class="protobuf" v-if="selectedOption === 'protobuf'">{{protobuf}}</pre>
      <pre class="json-schema" v-if="jsonSchema">{{jsonSchema}}</pre>
      <pre class="graphql-schema" v-if="selectedOption === 'graphql schema'">{{graphqlSchema}}</pre>
      <pre class="reason-types" v-if="selectedOption === 'reason types'">{{reasonTypes}}</pre>
      <pre class="ocaml-types" v-if="selectedOption === 'ocaml types'">{{ocamlTypes}}</pre>
      <pre class="rust-types" v-if="selectedOption === 'rust types'">{{rustTypes}}</pre>
      <pre class="mongoose-schema" v-if="selectedOption === 'mongoose schema'">{{mongooseSchema}}</pre>
      <pre class="graphql-root-type" v-if="selectedOption === 'graphql root type'">{{graphqlRootType}}</pre>
      <pre class="swagger-doc" v-if="selectedOption === 'swagger doc'">{{swaggerDoc}}</pre>
      <pre class="custom" v-if="selectedOption === 'custom'">{{custom}}</pre>
      <pre class="typescript" v-if="selectedOption === 'typescript'">{{typescript}}</pre>
      <pre class="markdown" v-if="selectedOption === 'markdown'">{{markdown}}</pre>
    </div>
  </div>
</template>
<script lang="ts">
import ts from "typescript";
import { defineComponent } from "vue";

import { Generator } from "../dist/core";
import { demoCasesTs } from "./variables";
import { TypeDeclaration } from "../dist/utils";
import { generateTypescriptOfFunctionParameter } from "../dist/typescript-generator";

const localStorageKey = "types-as-schema:source";

const App = defineComponent({
  data() {
    return {
      protobuf: "",
      options: ["protobuf"],
      selectedOption: "protobuf",
      graphqlSchema: "",
      reasonTypes: "",
      ocamlTypes: "",
      rustTypes: "",
      mongooseSchema: "",
      graphqlRootType: "",
      swaggerDoc: "",
      custom: "",
      typescript: "",
      markdown: "",
      innerSource: localStorage.getItem(localStorageKey) || demoCasesTs,
      jsonSchemas: [] as { entry: string; content: string }[],
    };
  },
  computed: {
    source: {
      get(): string {
        return this.innerSource;
      },
      set(value: string) {
        this.innerSource = value;
        localStorage.setItem(localStorageKey, value);
      },
    },
    jsonSchema(): string {
      if (this.selectedOption) {
        const schema = this.jsonSchemas.find(
          (s) => s.entry === this.selectedOption
        );
        if (schema) {
          return schema.content;
        }
      }
      return "";
    },
  },
  methods: {
    generate() {
      if (this.source) {
        const sourceFile = ts.createSourceFile(
          "",
          this.source,
          ts.ScriptTarget.ESNext,
          false,
          ts.ScriptKind.TS
        );

        const generator = new Generator([sourceFile], false);

        this.protobuf = generator.generateProtobuf();
        this.options = ["protobuf"];

        this.jsonSchemas = generator.generateJsonSchemas().map((s) => ({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          entry: s.entry!,
          content: JSON.stringify(s.schema, null, "  "),
        }));
        for (const schema of this.jsonSchemas) {
          this.options.push(schema.entry);
        }

        this.graphqlSchema = generator.generateGraphqlSchema();
        this.options.push("graphql schema");

        this.reasonTypes = generator.generateReasonTypes();
        this.options.push("reason types");

        this.ocamlTypes = generator.generateOcamlTypes();
        this.options.push("ocaml types");

        this.rustTypes = generator.generateRustTypes();
        this.options.push("rust types");

        this.mongooseSchema = generator.generateMongooseSchema();
        this.options.push("mongoose schema");

        this.graphqlRootType = generator.generateGraphqlRootType(".");
        this.options.push("graphql root type");

        this.swaggerDoc = generator.generateSwaggerDoc();
        this.options.push("swagger doc");

        this.custom = customHandler(generator.declarations);
        this.options.push("custom");

        this.typescript = generator.generateTypescript();
        this.options.push("typescript");

        this.markdown = generator.generateMarkdownDoc();
        this.options.push("markdown");
      }
    },
  },
});

export default App;

const customHandler = (typeDeclarations: TypeDeclaration[]) => {
  const result: string[] = [];
  for (const declaration of typeDeclarations) {
    if (declaration.kind === "function") {
      const parameters = [
        `functionName: '${declaration.name}'`,
        ...declaration.parameters.map((m) =>
          generateTypescriptOfFunctionParameter(m)
        ),
      ];
      result.push(`  (${parameters.join(", ")}): string`);
    }
  }
  return `type TestType = {
${result.join("\n")}
}
`;
};
</script>
