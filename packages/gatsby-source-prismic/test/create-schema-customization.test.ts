import { createNodeHelpers } from 'gatsby-node-helpers'

import { createSchemaCustomization } from '../src/gatsby-node'
import { gatsbyContext } from './__fixtures__/gatsbyContext'
import { pluginOptions } from './__fixtures__/pluginOptions'
import documentFixture from './__fixtures__/document.json'

const nodeHelpers = createNodeHelpers({
  typePrefix: `Prismic ${pluginOptions.typePrefix}`,
  fieldPrefix: 'Prismic',
  createNodeId: gatsbyContext.createNodeId,
  createContentDigest: gatsbyContext.createContentDigest,
})

const findCreateTypesCall = (
  name: string,
  gatsbyCtx: typeof gatsbyContext = gatsbyContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any =>
  gatsbyCtx.actions.createTypes.mock.calls.find(
    (call) => call[0].config.name === name,
  )[0]

beforeEach(() => {
  jest.clearAllMocks()
  gatsbyContext.cache.clear()
})

test('creates types', async () => {
  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  expect(gatsbyContext.actions.createTypes).toMatchSnapshot()
})

test('writes type paths to cache', async () => {
  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const cacheKey = `type-paths ${pluginOptions.repositoryName}`
  const cacheValue = gatsbyContext.cache.get(cacheKey)

  expect(cacheValue).toMatchSnapshot()
})

describe('shared global types', () => {
  test.skip('creates link_types type', async () => {
    // TODO
  })

  test.skip('creates image dimensions type', async () => {
    // TODO
  })

  test.skip('creates geopoint type', async () => {
    // TODO
  })
})

describe('shared local types', () => {
  test.skip('creates Link type', async () => {
    // TODO
  })

  test.skip('creates StructuredText type', async () => {
    // TODO
  })

  test.skip('creates Image type', async () => {
    // TODO
  })
})

describe('document', () => {
  test('includes base fields', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const pageCall = findCreateTypesCall('PrismicPrefixPage')

    expect(pageCall).not.toBeUndefined()
    expect(pageCall).toMatchObject({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixPage',
        fields: {
          uid: 'String',
          prismicId: 'ID!',
          data: 'PrismicPrefixPageDataType',
          dataRaw: { type: 'JSON!' },
          first_publication_date: {
            type: 'Date!',
            extensions: { dateformat: {} },
          },
          href: 'String!',
          lang: 'String!',
          last_publication_date: {
            type: 'Date!',
            extensions: { dateformat: {} },
          },
          tags: '[String!]!',
          type: 'String!',
          url: { type: 'String' },
          _previewable: { type: 'ID!' },
        },
        interfaces: ['Node'],
        extensions: { infer: false },
      },
    })
  })

  test('_previewable field resolves to Prismic ID', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const pageCall = findCreateTypesCall('PrismicPrefixPage')
    const previewableResolver = pageCall.config.fields._previewable.resolve

    const node = nodeHelpers.createNodeFactory(documentFixture.type)(
      documentFixture,
    )

    expect(previewableResolver(node)).toBe(node.prismicId)
  })
})
