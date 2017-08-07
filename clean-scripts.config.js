module.exports = {
  build: [
    `rimraf dist/`,
    `tsc -p src`
  ],
  lint: {
    ts: `tslint "src/**/*.ts" "online/**/*.ts"`,
    js: `standard "**/*.config.js"`,
    less: `stylelint "online/**/*.less"`
  },
  test: [
    'tsc -p spec',
    'jasmine'
  ],
  fix: {
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
  'demo:all': [
    'npm run demo',
    'npm run demo:log-tool',
    'npm run demo:match-calculator',
    'npm run demo:baogame'
  ]
}
