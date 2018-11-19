import { GraphQLResolveInfo } from 'graphql'

import { MutationResult, CreateInput, GetResult } from './cases'

type DeepPromisifyReturnType<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? Array<DeepPromisifyReturnType<U>>
    : T[P] extends (...args: infer P) => infer R
      ? (...args: P) => R | Promise<R>
      : DeepPromisifyReturnType<T[P]>
}

export interface Root<TContext = any> {
  create(input: { input: CreateInput }, context: TContext, info: GraphQLResolveInfo): DeepPromisifyReturnType<MutationResult> | Promise<DeepPromisifyReturnType<MutationResult>>
  user(input: { id: string }, context: TContext, info: GraphQLResolveInfo): DeepPromisifyReturnType<GetResult> | Promise<DeepPromisifyReturnType<GetResult>>
  users(input: {}, context: TContext, info: GraphQLResolveInfo): DeepPromisifyReturnType<GetResult> | Promise<DeepPromisifyReturnType<GetResult>>
}

type DeepReturnType<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? Array<DeepReturnType<U>>
    : T[P] extends (...args: any[]) => infer R
      ? R
      : DeepReturnType<T[P]>
}

export interface ResolveResult {
  create: DeepReturnType<MutationResult>
  user: DeepReturnType<GetResult>
  users: DeepReturnType<GetResult>
}
