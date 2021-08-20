export const jsonFilter = <T>(input: T): T => JSON.parse(JSON.stringify(input))
