module.exports = {
  build: [
    `rimraf dist/`,
    `tsc -p src`
  ],
  lint: {
    ts: `tslint "src/**/*.ts" "online/**/*.ts"`,
    js: `standard "**/*.config.js"`,
    less: `stylelint "online/**/*.less"`,
    export: `no-unused-export "src/**/*.ts" "online/**/*.ts"`
  },
  test: [
    'tsc -p spec',
    'jasmine'
  ],
  fix: {
    ts: `tslint --fix "src/**/*.ts" "online/**/*.ts"`,
    js: `standard --fix "**/*.config.js"`,
    less: `stylelint --fix "online/**/*.less"`
  },
  release: `clean-release`,
  online: [
    {
      js: [
        `file2variable-cli online/index.template.html demo/cases.ts -o online/variables.ts --html-minify --base online`,
        `tsc -p online`,
        `webpack --display-modules --config online/webpack.config.js`
      ],
      css: [
        `lessc online/index.less > online/index.css`,
        `cleancss -o online/index.bundle.css online/index.css ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css`
      ],
      clean: `rimraf online/*.bundle-*.js online/*.bundle-*.css`
    },
    `rev-static --config online/rev-static.config.js`
  ],
  demo: {
    default: 'node ./dist/index.js demo/cases.ts --json demo/ --debug demo/debug.json --protobuf demo/cases.proto',
    logTool: 'node ./dist/index.js demo/log-tool/types.ts --json demo/log-tool/ --debug demo/log-tool/debug.json --protobuf demo/log-tool/protocol.proto',
    matchCalculator: 'node ./dist/index.js demo/match-calculator/types.ts --json demo/match-calculator/ --debug demo/match-calculator/debug.json',
    baogame: 'node ./dist/index.js demo/baogame/common.ts --protobuf demo/baogame/protocol.proto --debug demo/baogame/debug.json'
  }
}
