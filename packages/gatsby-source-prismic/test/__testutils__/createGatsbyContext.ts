import * as sinon from 'sinon'
import * as gatsby from 'gatsby'
import { PartialDeep } from 'type-fest'

const createCache = () => {
  const cache = new Map()

  return {
    get: (key: string) => Promise.resolve(cache.get(key)),
    set: <T>(key: string, value: T) => Promise.resolve(cache.set(key, value)),
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
      createNode: sinon.stub().callsFake((input: gatsby.NodeInput) =>
        nodeStore.set(input.id, {
          ...input,
          internal: {
            ...input.internal,
            owner: 'gatsby-source-prismic',
          },
        }),
      ),
      deleteNode: sinon.stub().callsFake((id: string) => nodeStore.delete(id)),
      createTypes: sinon.stub(),
      touchNode: sinon.stub(),
    },
    reporter: {
      info: sinon.stub(),
      warn: sinon.stub(),
    },
    cache,
    schema: {
      buildUnionType: sinon
        .stub()
        .callsFake((config) => ({ kind: 'UNION', config })),
      buildObjectType: sinon
        .stub()
        .callsFake((config) => ({ kind: 'OBJECT', config })),
      buildEnumType: sinon
        .stub()
        .callsFake((config) => ({ kind: 'ENUM', config })),
      buildInterfaceType: sinon
        .stub()
        .callsFake((config) => ({ kind: 'INTERFACE', config })),
      buildInputObjectType: sinon.stub().callsFake((config) => ({
        kind: 'INPUT_OBJECT',
        config,
      })),
    },
    getNode: sinon.stub().callsFake((id: string) => nodeStore.get(id)),
    getNodes: sinon.stub().callsFake(() => [...nodeStore.values()]),
    createNodeId: sinon.stub().callsFake((input) => input),
    createContentDigest: sinon.stub().returns('createContentDigest'),
  }
}
