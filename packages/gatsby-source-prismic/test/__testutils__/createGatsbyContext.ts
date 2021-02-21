import * as gatsby from 'gatsby'
import { PartialDeep } from 'type-fest'

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

export const createGatsbyContext = (): PartialDeep<gatsby.NodePluginArgs> & {
  // These properties are listed here to appease tests that expect them to be
  // present. Add other properties only as needed.
  actions: Partial<gatsby.NodePluginArgs['actions']>
  reporter: Partial<gatsby.NodePluginArgs['reporter']>
} => {
  const nodeStore = new Map()
  const cache = createCache()

  return {
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
    cache,
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
}
