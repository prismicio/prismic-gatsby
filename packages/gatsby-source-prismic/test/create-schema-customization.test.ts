import { createSchemaCustomization } from '../src/gatsby-node'
import { gatsbyContext, pluginOptions } from './__fixtures__/gatsby'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('createSchemaCustomization', () => {
  test('creates types', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toMatchSnapshot()
  })
})
