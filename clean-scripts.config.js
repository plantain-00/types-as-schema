const childProcess = require('child_process')
const util = require('util')
const { Service } = require('clean-scripts')

const execAsync = util.promisify(childProcess.exec)

const tsFiles = `"src/**/*.ts" "spec/**/*.ts" "screenshots/**/*.ts" "prerender/**/*.ts" "online/**/*.ts"`
const jsFiles = `"*.config.js" "online/*.config.js"`
const lessFiles = `"online/**/*.less"`

module.exports = {
  build: [
    `rimraf dist/`,
    `tsc -p src`,
    {
      js: [
        `file2variable-cli online/index.template.html demo/cases.ts -o online/variables.ts --html-minify --base online`,
        `tsc -p online`,
        `webpack --display-modules --config online/webpack.config.js`
      ],
      css: [
        `lessc online/index.less > online/index.css`,
        `postcss online/index.css -o online/index.postcss.css`,
        `cleancss -o online/index.bundle.css online/index.postcss.css ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css`
      ],
      clean: `rimraf online/*.bundle-*.js online/*.bundle-*.css`
    },
    `rev-static --config online/rev-static.config.js`,
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
    export: `no-unused-export ${tsFiles} ${lessFiles}`
  },
  test: [
    'tsc -p spec',
    'jasmine',
    async () => {
      const { stdout } = await execAsync('git status -s')
      if (stdout) {
        console.log(stdout)
        throw new Error(`generated files doesn't match.`)
      }
    }
  ],
  fix: {
    ts: `tslint --fix ${tsFiles}`,
    js: `standard --fix ${jsFiles}`,
    less: `stylelint --fix ${lessFiles}`
  },
  release: `clean-release`,
  watch: {
    vue: `file2variable-cli online/index.template.html demo/cases.ts -o online/variables.ts --html-minify --base online --watch`,
    online: `tsc -p online --watch`,
    webpack: `webpack --config demo/webpack.config.js --watch`,
    less: `watch-then-execute "online/index.less" --script "clean-scripts online[0].css"`,
    rev: `rev-static --config online/rev-static.config.js --watch`
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
    `clean-scripts build[2]`,
    `clean-scripts build[3]`
  ]
}
