import { pluginOptions } from './pluginOptions'

export const nodes = [
  { id: `Prismic ${pluginOptions.typePrefix} 1`, prismicId: '1' },
  { id: `Prismic ${pluginOptions.typePrefix} 2`, prismicId: '2' },
  { id: `Prismic ${pluginOptions.typePrefix} 3`, prismicId: '3' },
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

export const gatsbyContext = {
  actions: {
    createNode: jest.fn(),
    deleteNode: jest.fn(),
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
  getNode: jest
    .fn()
    .mockImplementation((id) => nodes.find((node) => node.id === id)),
  getNodes: jest.fn().mockReturnValue(nodes),
  createNodeId: jest.fn().mockImplementation((x) => x),
  createContentDigest: jest.fn().mockReturnValue('createContentDigest'),
}
