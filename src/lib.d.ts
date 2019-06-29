declare module '*.json' {
    export const version: string
}

declare module 'lodash.snakecase' {
  const snakeCase: (name: string) => string
  export = snakeCase
}
