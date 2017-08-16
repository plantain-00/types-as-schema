import * as ts from "typescript";
import Vue from "vue";
import Component from "vue-class-component";

import { Generator } from "../src/core";
import { indexTemplateHtml, demoCasesTs } from "./variables";

const localStorageKey = "types-as-schema:source";

@Component({
    template: indexTemplateHtml,
})
class App extends Vue {
    protobuf = "";
    options: string[] = ["protobuf"];
    selectedOption = "protobuf";
    private innerSource = localStorage.getItem(localStorageKey) || demoCasesTs;
    private jsonSchemas: { entry: string; content: string }[] = [];

    set source(value: string) {
        this.innerSource = value;
        localStorage.setItem(localStorageKey, value);
    }
    get source() {
        return this.innerSource;
    }
    get jsonSchema() {
        if (this.selectedOption) {
            const schema = this.jsonSchemas.find(s => s.entry === this.selectedOption);
            if (schema) {
                return schema.content;
            }
        }
        return "";
    }

    generate() {
        if (this.source) {
            const sourceFile = ts.createSourceFile("", this.source, ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS);

            const generator = new Generator(sourceFile);

            this.protobuf = generator.generateProtobuf();

            this.jsonSchemas = generator.generateJsonSchemas().map(s => ({
                entry: s.entry,
                content: JSON.stringify(s.schema, null, "  "),
            }));

            this.options = ["protobuf"];
            for (const schema of this.jsonSchemas) {
                this.options.push(schema.entry);
            }
        }
    }
}

new App({ el: "#container" });
