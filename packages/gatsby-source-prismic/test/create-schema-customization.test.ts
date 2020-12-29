import { createSchemaCustomization } from '../src/gatsby-node'
import { gatsbyContext } from './__fixtures__/gatsbyContext'
import { pluginOptions } from './__fixtures__/pluginOptions'
import pageNode from './__fixtures__/pageNode.json'

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
})

test('creates types', async () => {
  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  expect(gatsbyContext.actions.createTypes).toMatchSnapshot()
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

test('document base fields', async () => {
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

  expect(previewableResolver(pageNode)).toBe(pageNode.prismicId)
})
