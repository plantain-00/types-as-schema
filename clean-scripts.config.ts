import { executeScriptAsync } from 'clean-scripts'
import { watch } from 'watch-then-execute'

const tsFiles = `"src/**/*.ts" "online/**/*.ts"`
const lessFiles = `"online/**/*.less"`

const templateCommand = `file2variable-cli --config online/file2variable.config.ts`
const tscSrcCommand = `tsc -p src`
const webpackCommand = `webpack --config online/webpack.config.ts`
const revStaticCommand = `rev-static --config online/rev-static.config.ts`
const cssCommand = [
  `lessc online/index.less > online/index.css`,
  `postcss online/index.css -o online/index.postcss.css`,
  `cleancss -o online/index.bundle.css online/index.postcss.css ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css`
]

export default {
  build: [
    `rimraf dist/`,
    tscSrcCommand,
    {
      js: [
        templateCommand,
        webpackCommand
      ],
      css: cssCommand,
      clean: `rimraf online/*.bundle-*.js online/*.bundle-*.css`
    },
    revStaticCommand,
    {
      default: 'node ./dist/cli.js  -p ./types-as-schema.config.ts',
      logTool: 'node ./dist/cli.js demo/log-tool/types.ts --json demo/log-tool/ --debug demo/log-tool/debug.json --protobuf demo/log-tool/protocol.proto',
      matchCalculator: 'node ./dist/cli.js demo/match-calculator/types.ts --json demo/match-calculator/ --debug demo/match-calculator/debug.json',
      baogame: 'node ./dist/cli.js demo/baogame/common.ts --protobuf demo/baogame/protocol.proto --debug demo/baogame/debug.json'
    }
  ],
  lint: {
    ts: `eslint --ext .js,.ts ${tsFiles}`,
    less: `stylelint --custom-syntax postcss-less ${lessFiles}`,
    export: `no-unused-export "src/**/*.ts" ${lessFiles} --strict --need-module tslib`,
    markdown: `markdownlint README.md`,
    typeCoverage: 'type-coverage -p src --strict',
    typeCoverageOnline: 'type-coverage -p online --strict --ignore-files "dist/*" --ignore-files online/variables.ts'
  },
  test: [
    'clean-release --config clean-run.config.ts'
  ],
  fix: {
    ts: `eslint --ext .js,.ts ${tsFiles} --fix`,
    less: `stylelint --custom-syntax postcss-less --fix ${lessFiles}`
  },
  watch: {
    vue: `${templateCommand} --watch`,
    src: `${tscSrcCommand} --watch`,
    webpack: `${webpackCommand} --watch`,
    less: () => watch(['online/**/*.less'], [], () => executeScriptAsync(cssCommand)),
    rev: `${revStaticCommand} --watch`
  }
}
