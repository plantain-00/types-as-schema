import { GraphQLResolveInfo } from 'graphql'

import { MutationResult, CreateInput, GetResult } from './cases'

export interface Root {
  create(input: { input: CreateInput }, context: any, info: GraphQLResolveInfo): MutationResult | Promise<MutationResult>
  user(input: { id: string }, context: any, info: GraphQLResolveInfo): GetResult | Promise<GetResult>
  users(input: {}, context: any, info: GraphQLResolveInfo): GetResult | Promise<GetResult>
}

export interface ResolveResult {
  create: MutationResult
  user: GetResult
  users: GetResult
}
