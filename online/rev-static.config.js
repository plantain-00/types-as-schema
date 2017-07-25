module.exports = {
  inputFiles: [
    'online/*.bundle.js',
    'online/*.bundle.css',
    'online/index.ejs.html'
  ],
  revisedFiles: [
  ],
  inlinedFiles: [
    'online/index.bundle.css'
  ],
  outputFiles: file => file.replace('.ejs', ''),
  ejsOptions: {
    rmWhitespace: true
  },
  sha: 256,
  customNewFileName: (filePath, fileString, md5String, baseName, extensionName) => baseName + '-' + md5String + extensionName,
  base: 'online',
  fileSize: 'online/file-size.json'
}
