import { TypePathsStore } from '../types'

export const deserializeTypePathsStore = (
  serializedStore: string,
): TypePathsStore => JSON.parse(serializedStore)
