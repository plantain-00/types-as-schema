type TestType = {
  (functionName: 'getPetById', status: "health" | "sick", tags: string[], pet: Pet, id?: number, sortType?: "asc" | "desc"): string
  (functionName: 'downloadFile'): string
  (functionName: 'returnEmpty'): string
  (functionName: 'uploadFile', file: File): string
  (functionName: ''): string
  (functionName: 'Test1'): string
  (functionName: 'Test2'): string
  (functionName: 'getPetById', status: "health" | "sick", tags: string[], pet: Pet, id?: number, sortType?: "asc" | "desc"): string
  (functionName: 'functionType', props: { a: (b: string) => number, b: React.ReactNode, c: C.D }): string
  (functionName: 'FancyButton', props: unknown, ref: unknown): string
  (functionName: 'FancyButton2', props: unknown): string
  (functionName: 'FancyButton4', props: { a: string }): string
  (functionName: 'FancyButton5', props: { a: Map<string, number> }): string
}
