type TestType = {
  (functionName: 'getPetById', status: "health" | "sick", tags: string[], pet: Pet, id?: number, sortType?: "asc" | "desc"): string
}
