import * as ts from "typescript";
import Vue from "vue";
import Component from "vue-class-component";

import { Generator } from "../src/core";
import { indexTemplateHtml } from "./variables";

@Component({
    template: indexTemplateHtml,
})
class App extends Vue {
    generate() {
        const sourceFile = ts.createSourceFile("", `type TypeLiteral = {
    typeLiteralMember1: number;
    typeLiteralMember2: string;
};`, ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS);

        const generator = new Generator(sourceFile);

        console.log(generator.models);
    }
}

// tslint:disable-next-line:no-unused-expression
new App({ el: "#container" });
