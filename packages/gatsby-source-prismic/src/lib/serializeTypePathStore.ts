import { TypePathsStore } from '../types'

export const serializeTypePathsStore = (store: TypePathsStore): string =>
  JSON.stringify(store)
