import { pluginOptions } from './pluginOptions'

export const nodes = [
  { id: `Prismic ${pluginOptions.typePrefix} 1`, prismicId: '1' },
  { id: `Prismic ${pluginOptions.typePrefix} 2`, prismicId: '2' },
  { id: `Prismic ${pluginOptions.typePrefix} 3`, prismicId: '3' },
]

export const gatsbyContext = {
  actions: {
    createNode: jest.fn(),
    deleteNode: jest.fn(),
    createTypes: jest.fn(),
    touchNode: jest.fn(),
  },
  reporter: {
    info: jest.fn(),
    // .mockImplementation((args) => console.log(args)),
    warn: jest.fn(),
    // .mockImplementation((args) => console.warn(args)),
  },
  schema: {
    buildUnionType: jest.fn((config) => ({ kind: 'UNION', config })),
    buildObjectType: jest.fn((config) => ({ kind: 'OBJECT', config })),
    buildEnumType: jest.fn((config) => ({ kind: 'ENUM', config })),
  },
  getNode: jest
    .fn()
    .mockImplementation((id) => nodes.find((node) => node.id === id)),
  getNodes: jest.fn().mockReturnValue(nodes),
  createNodeId: jest.fn().mockImplementation((x) => x),
  createContentDigest: jest.fn().mockReturnValue('createContentDigest'),
}
