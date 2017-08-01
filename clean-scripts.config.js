module.exports = {
  build: [
    `rimraf dist/`,
    `tsc -p src`
  ],
  lint: [
    `tslint "src/**/*.ts" "online/**/*.ts"`,
    `standard "**/*.config.js"`,
    `stylelint "online/**/*.less"`
  ],
  test: [
    'tsc -p spec',
    'jasmine'
  ],
  fix: [
    `standard --fix "**/*.config.js"`
  ],
  release: [
    `clean-release`
  ],
  online: [
    `rimraf online/*.bundle-*.js online/*.bundle-*.css`,
    `file2variable-cli online/index.template.html demo/cases.ts -o online/variables.ts --html-minify --base online`,
    `tsc -p online`,
    `lessc online/index.less > online/index.css`,
    `cleancss -o online/index.bundle.css online/index.css ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css`,
    `webpack --display-modules --config online/webpack.config.js`,
    `rev-static --config online/rev-static.config.js`
  ],
  'demo:all': [
    'npm run demo',
    'npm run demo:log-tool',
    'npm run demo:match-calculator',
    'npm run demo:baogame'
  ]
}
