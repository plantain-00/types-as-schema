import { MutationResult, CreateInput, GetResult } from './cases'

export interface Root {
  create(input: { input: CreateInput }): MutationResult | Promise<MutationResult>
  user(input: { id: string }): GetResult | Promise<GetResult>
  users(): GetResult | Promise<GetResult>
}
