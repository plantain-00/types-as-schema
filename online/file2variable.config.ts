import { Configuration } from 'file2variable-cli'

const config: Configuration = {
  base: 'online',
  files: [
    'demo/cases.ts'
  ],
  handler: () => {
    return { type: 'text' }
  },
  out: 'online/variables.ts'
}

export default config
