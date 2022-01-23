type TestType = {
  (functionName: 'getPetById', status: "health" | "sick", tags: string[], pet: Pet, id?: number, sortType?: "asc" | "desc"): string
  (functionName: 'downloadFile'): string
  (functionName: 'returnEmpty'): string
  (functionName: 'uploadFile', file: File): string
  (functionName: ''): string
}
