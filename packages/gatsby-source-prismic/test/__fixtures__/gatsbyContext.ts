import * as gatsby from 'gatsby'

import { pluginOptions } from './pluginOptions'

export const nodes = [
  { id: `Prismic ${pluginOptions.typePrefix} 1`, prismicId: '1' },
]

const createCache = () => {
  const cache = new Map()

  return {
    get: jest
      .fn()
      .mockImplementation((key: string) => Promise.resolve(cache.get(key))),
    set: jest
      .fn()
      .mockImplementation(<T>(key: string, value: T) =>
        Promise.resolve(cache.set(key, value)),
      ),
    clear: () => cache.clear(),
  }
}

const nodeStore = new Map()

export const gatsbyContext = {
  actions: {
    createNode: jest
      .fn()
      .mockImplementation((input: gatsby.NodeInput) =>
        nodeStore.set(input.id, input),
      ),
    deleteNode: jest
      .fn()
      .mockImplementation((id: string) => nodeStore.delete(id)),
    createTypes: jest.fn(),
    touchNode: jest.fn(),
  },
  reporter: {
    info: jest.fn(),
    warn: jest.fn(),
  },
  cache: createCache(),
  schema: {
    buildUnionType: jest.fn((config) => ({ kind: 'UNION', config })),
    buildObjectType: jest.fn((config) => ({ kind: 'OBJECT', config })),
    buildEnumType: jest.fn((config) => ({ kind: 'ENUM', config })),
    buildInterfaceType: jest.fn((config) => ({ kind: 'INTERFACE', config })),
    buildInputObjectType: jest.fn((config) => ({
      kind: 'INPUT_OBJECT',
      config,
    })),
  },
  getNode: jest.fn().mockImplementation((id: string) => nodeStore.get(id)),
  getNodes: jest.fn().mockImplementation(() => [...nodeStore.values()]),
  createNodeId: jest.fn().mockImplementation((x) => x),
  createContentDigest: jest.fn().mockReturnValue('createContentDigest'),
}
