import md5 from 'tiny-hashes/md5'

import { PrismicTypePathType } from './types'

const serializePath = (path: string[]): string =>
  process.env.NODE_ENV === 'production' ? md5(path.toString()) : path.join('.')

type InternalTypePathsStore = Record<string, PrismicTypePathType>

export interface TypePathsStoreInstance {
  get(path: string[]): PrismicTypePathType | undefined
  set(path: string[], type: PrismicTypePathType): void
  serialize(): string
}

export const createTypePathsStore = (
  initialStore: InternalTypePathsStore = {},
): TypePathsStoreInstance => {
  const store = { ...initialStore } as InternalTypePathsStore

  const get = (path: string[]): PrismicTypePathType | undefined =>
    store[serializePath(path)]

  const set = (path: string[], type: PrismicTypePathType): void =>
    void (store[serializePath(path)] = type)

  const serialize = (): string => JSON.stringify(store)

  return { get, set, serialize }
}

export const deserializeTypePathsStore = (
  serializedStore: string,
): TypePathsStoreInstance => createTypePathsStore(JSON.parse(serializedStore))
