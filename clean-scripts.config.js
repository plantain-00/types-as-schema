const childProcess = require('child_process')

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
    'jasmine',
    {
      default: 'node ./dist/index.js demo/cases.ts --json demo/ --debug demo/debug.json --protobuf demo/cases.proto',
      logTool: 'node ./dist/index.js demo/log-tool/types.ts --json demo/log-tool/ --debug demo/log-tool/debug.json --protobuf demo/log-tool/protocol.proto',
      matchCalculator: 'node ./dist/index.js demo/match-calculator/types.ts --json demo/match-calculator/ --debug demo/match-calculator/debug.json',
      baogame: 'node ./dist/index.js demo/baogame/common.ts --protobuf demo/baogame/protocol.proto --debug demo/baogame/debug.json'
    },
    'git checkout online/screenshot.png',
    () => new Promise((resolve, reject) => {
      childProcess.exec('git status -s', (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          if (stdout) {
            reject(new Error(`generated files doesn't match.`))
          } else {
            resolve()
          }
        }
      }).stdout.pipe(process.stdout)
    })
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
    `rev-static --config online/rev-static.config.js`,
    async () => {
      const { createServer } = require('http-server')
      const puppeteer = require('puppeteer')
      const server = createServer()
      server.listen(8000)
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.goto(`http://localhost:8000/online`)
      await page.screenshot({ path: `online/screenshot.png`, fullPage: true })
      server.close()
      browser.close()
    }
  ],
  watch: {
    vue: `file2variable-cli online/index.template.html demo/cases.ts -o online/variables.ts --html-minify --base online --watch`,
    online: `tsc -p online --watch`,
    webpack: `webpack --config demo/webpack.config.js --watch`,
    less: `watch-then-execute "online/index.less" --script "clean-scripts online[0].css"`,
    rev: `rev-static --config online/rev-static.config.js --watch`
  },
  prerender: [
    async () => {
      const { createServer } = require('http-server')
      const { prerender } = require('prerender-js')
      const server = createServer()
      server.listen(8000)
      await prerender('http://localhost:8000/online', '#prerender-container', 'online/prerender.html')
      server.close()
    },
    `clean-scripts online[1]`
  ]
}
