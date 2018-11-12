import { GraphQLResolveInfo } from 'graphql'

import { MutationResult, CreateInput, GetResult } from './cases'

export interface Root<TContext = any> {
  create(input: { input: CreateInput }, context: TContext, info: GraphQLResolveInfo): MutationResult | Promise<MutationResult>
  user(input: { id: string }, context: TContext, info: GraphQLResolveInfo): GetResult | Promise<GetResult>
  users(input: {}, context: TContext, info: GraphQLResolveInfo): GetResult | Promise<GetResult>
}

type ResolveFunctionResult<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? Array<ResolveFunctionResult<U>>
    : T[P] extends (...args: any[]) => infer R
      ? R
      : ResolveFunctionResult<T[P]>
}

export interface ResolveResult {
  create: ResolveFunctionResult<MutationResult>
  user: ResolveFunctionResult<GetResult>
  users: ResolveFunctionResult<GetResult>
}
