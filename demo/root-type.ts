import { GraphQLResolveInfo } from 'graphql'

import { MutationResult, CreateInput, GetResult } from './cases'

export interface Root<TContext = any> {
  create(input: { input: CreateInput }, context: TContext, info: GraphQLResolveInfo): MutationResult | Promise<MutationResult>
  user(input: { id: string }, context: TContext, info: GraphQLResolveInfo): GetResult | Promise<GetResult>
  users(input: {}, context: TContext, info: GraphQLResolveInfo): GetResult | Promise<GetResult>
}

export interface ResolveResult {
  create: MutationResult
  user: GetResult
  users: GetResult
}
