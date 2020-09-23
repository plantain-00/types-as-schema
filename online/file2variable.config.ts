import { Configuration } from 'file2variable-cli'

const config: Configuration = {
  base: 'online',
  files: [
    'online/index.template.html',
    'demo/cases.ts'
  ],
  handler: (file) => {
    if (file.endsWith('index.template.html')) {
      return {
        type: 'html-minify',
      }
    }
    return { type: 'text' }
  },
  out: 'online/variables.ts'
}

export default config
