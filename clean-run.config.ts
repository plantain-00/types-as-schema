export default {
  include: [
    'bin/*',
    'dist/*.js',
    'package.json',
    'yarn.lock'
  ],
  exclude: [
  ],
  postScript: ({ dir }) => [
    `cd "${dir}" && yarn --production && yarn add typescript -D`,
    `node ${dir}/dist/index.js demo/cases.ts demo/case2.ts --json demo/ --debug demo/debug.json --protobuf demo/cases.proto`
  ]
}
