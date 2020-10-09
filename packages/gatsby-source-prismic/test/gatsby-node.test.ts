import { sourceNodes } from '../src/gatsby-node'
import schemaFixture from './__fixtures__/schema.json'

const gatsbyContext = {
  actions: {
    createNode: jest.fn(),
    createTypes: jest.fn(),
  },
  reporter: {
    info: jest.fn(),
    panic: jest.fn(),
  },
  schema: {
    buildUnionType: jest.fn((config) => ({ kind: 'UNION', config })),
    buildObjectType: jest.fn((config) => ({ kind: 'OBJECT', config })),
    buildEnumType: jest.fn((config) => ({ kind: 'ENUM', config })),
  },
  createNodeId: jest.fn().mockReturnValue('createNodeId'),
  createContentDigest: jest.fn().mockReturnValue('createContentDigest'),
}

const pluginOptions = {
  repositoryName: 'repositoryName',
  typePrefix: 'prefix',
  schemas: {
    page: schemaFixture,
  },
}

describe('sourceNodes', () => {
  test('creates types', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)
    expect(gatsbyContext.actions.createTypes).toMatchSnapshot()
  })

  test('creates nodes', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)
    expect(gatsbyContext.actions.createNode).toMatchSnapshot()
  })
})
