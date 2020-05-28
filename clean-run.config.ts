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
    `cd "${dir}" && yarn --production`,
    `node ${dir}/dist/index.js demo/cases.ts --json demo/ --debug demo/debug.json --protobuf demo/cases.proto --graphql demo/cases.gql --reason demo/cases.re --ocaml demo/cases.ml --rust demo/cases.rs`
  ]
}
