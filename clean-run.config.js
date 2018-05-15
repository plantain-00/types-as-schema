module.exports = {
  include: [
    'bin/*',
    'dist/*.js',
    'package.json',
    'yarn.lock'
  ],
  exclude: [
  ],
  postScript: [
    'cd "[dir]" && yarn --production',
    '[dir]/bin/types-as-schema demo/cases.ts --json demo/ --debug demo/debug.json --protobuf demo/cases.proto --graphql demo/cases.gql --reason demo/cases.re --ocaml demo/cases.ml --rust demo/cases.rs'
  ]
}
