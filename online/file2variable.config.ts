import { ConfigData } from 'file2variable-cli'

const config: ConfigData = {
  base: 'online',
  files: [
    'online/index.template.html',
    'demo/cases.ts'
  ],
  handler: (file) => {
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

export default config
