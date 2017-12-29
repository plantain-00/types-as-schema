module.exports = {
  include: [
    'bin/*',
    'dist/*.js',
    'LICENSE',
    'package.json',
    'README.md'
  ],
  exclude: [
  ],
  askVersion: true,
  changesGitStaged: true,
  postScript: [
    'npm publish "[dir]" --access public',
    'git add package.json',
    'git commit -m "feat: publish v[version]"',
    'git tag v[version]',
    'git push',
    'git push origin v[version]'
  ]
}
