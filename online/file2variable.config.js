module.exports = {
  base: 'online',
  files: [
    'online/index.template.html',
    'demo/cases.ts'
  ],
  /**
   * @argument {string} file
   */
  handler: file => {
    if (file.endsWith('index.template.html')) {
      return {
        type: 'vue',
        name: 'App',
        path: './index'
      }
    }
    return { type: 'text' }
  },
  out: 'online/variables.ts'
}
