type TestType = {
  (name: 'getPetById', id: number, status: 'health' | 'sick', tags: Array<string>, pet: Pet): string
}
