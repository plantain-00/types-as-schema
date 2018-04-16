const { Service, executeScriptAsync } = require('clean-scripts')
const { watch } = require('watch-then-execute')

const tsFiles = `"src/**/*.ts" "spec/**/*.ts" "screenshots/**/*.ts" "prerender/**/*.ts" "online/**/*.ts"`
const jsFiles = `"*.config.js" "online/*.config.js"`
const lessFiles = `"online/**/*.less"`

const templateCommand = `file2variable-cli --config online/file2variable.config.js`
const tscSrcCommand = `tsc -p src`
const tscOnlineCommand = `tsc -p online`
const webpackCommand = `webpack --config online/webpack.config.js`
const revStaticCommand = `rev-static --config online/rev-static.config.js`
const cssCommand = [
  `lessc online/index.less > online/index.css`,
  `postcss online/index.css -o online/index.postcss.css`,
  `cleancss -o online/index.bundle.css online/index.postcss.css ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css`
]

module.exports = {
  build: [
    `rimraf dist/`,
    tscSrcCommand,
    {
      js: [
        templateCommand,
        tscOnlineCommand,
        webpackCommand
      ],
      css: cssCommand,
      clean: `rimraf online/*.bundle-*.js online/*.bundle-*.css`
    },
    revStaticCommand,
    {
      default: 'node ./dist/index.js demo/cases.ts --json demo/ --debug demo/debug.json --protobuf demo/cases.proto',
      logTool: 'node ./dist/index.js demo/log-tool/types.ts --json demo/log-tool/ --debug demo/log-tool/debug.json --protobuf demo/log-tool/protocol.proto',
      matchCalculator: 'node ./dist/index.js demo/match-calculator/types.ts --json demo/match-calculator/ --debug demo/match-calculator/debug.json',
      baogame: 'node ./dist/index.js demo/baogame/common.ts --protobuf demo/baogame/protocol.proto --debug demo/baogame/debug.json'
    }
  ],
  lint: {
    ts: `tslint ${tsFiles}`,
    js: `standard ${jsFiles}`,
    less: `stylelint ${lessFiles}`,
    export: `no-unused-export ${tsFiles} ${lessFiles}`,
    commit: `commitlint --from=HEAD~1`,
    markdown: `markdownlint README.md`
  },
  test: [
    'tsc -p spec',
    'jasmine'
  ],
  fix: {
    ts: `tslint --fix ${tsFiles}`,
    js: `standard --fix ${jsFiles}`,
    less: `stylelint --fix ${lessFiles}`
  },
  watch: {
    vue: `${templateCommand} --watch`,
    src: `${tscSrcCommand} --watch`,
    online: `${tscOnlineCommand} --watch`,
    webpack: `${webpackCommand} --watch`,
    less: () => watch(['online/**/*.less'], [], () => executeScriptAsync(cssCommand)),
    rev: `${revStaticCommand} --watch`
  },
  screenshot: [
    new Service(`http-server -p 8000`),
    `tsc -p screenshots`,
    `node screenshots/index.js`
  ],
  prerender: [
    new Service(`http-server -p 8000`),
    `tsc -p prerender`,
    `node prerender/index.js`,
    revStaticCommand
  ]
}
