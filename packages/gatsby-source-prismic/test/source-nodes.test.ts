import nock from 'nock'

import { createSchemaCustomization } from '../src/create-schema-customization'
import { sourceNodes } from '../src/source-nodes'
import { pluginOptions as pluginOptionsOrig } from './__fixtures__/pluginOptions'
import { PluginOptions, PrismicFieldType } from '../src'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { getURLOrigin } from './__testutils__/getURLOrigin'
import { createPrismicAPIQueryResponse } from './__testutils__/createPrismicAPIQueryResponse'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'

beforeEach(() => {
  jest.clearAllMocks()
})

const nockRepositoryEndpoint = (
  pluginOptions: PluginOptions,
  path = '/api/v2',
): void => {
  nock(getURLOrigin(pluginOptions.apiEndpoint))
    .get(path)
    .query({ access_token: pluginOptions.accessToken })
    .reply(200, {
      types: { page: 'Page' },
      refs: [
        {
          id: 'master',
          ref: 'master',
          isMasterRef: true,
        },
        {
          id: 'XyfxIPl3p7YAQ7Mg',
          ref: 'XyghHfl3p3ACRIZH~Xyfw_Pl3p90AQ7J8',
          isMasterRef: false,
        },
      ],
    })
}

test('creates nodes', async () => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const queryResponse = createPrismicAPIQueryResponse()

  nockRepositoryEndpoint(pluginOptions)
  nock(pluginOptions.apiEndpoint)
    .get('/documents/search')
    .query({
      access_token: pluginOptionsOrig.accessToken,
      ref: 'master',
      lang: '*',
      page: 1,
      pageSize: 100,
    })
    .reply(200, queryResponse)

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  queryResponse.results.forEach((doc) =>
    expect(gatsbyContext.actions.createNode).toHaveBeenCalledWith(
      expect.objectContaining({ prismicId: doc.id }),
    ),
  )
})

test('uses apiEndpoint plugin option if provided', async () => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const queryResponse = createPrismicAPIQueryResponse()

  pluginOptions.apiEndpoint = 'https://example.com'

  nockRepositoryEndpoint(pluginOptions, '/')
  nock(pluginOptions.apiEndpoint)
    .get('/documents/search')
    .query({
      access_token: pluginOptionsOrig.accessToken,
      ref: 'master',
      lang: '*',
      page: 1,
      pageSize: 100,
    })
    .reply(200, queryResponse)

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  // We're expecting this to *not* throw.
})

describe('data normalization', () => {
  test('embed fields are normalized to inferred nodes', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()
    const queryResponse = createPrismicAPIQueryResponse([
      createPrismicAPIDocument({
        data: {
          embed: {
            embed_url: 'https://youtube.com',
          },
        },
        type: 'foo',
      }),
    ])

    pluginOptions.schemas = {
      foo: {
        Main: {
          embed: { type: PrismicFieldType.Embed, config: {} },
        },
      },
    }

    nockRepositoryEndpoint(pluginOptions)
    nock(pluginOptions.apiEndpoint)
      .get('/documents/search')
      .query({
        access_token: pluginOptions.accessToken,
        ref: 'master',
        lang: '*',
        page: 1,
        pageSize: 100,
      })
      .reply(200, queryResponse)

    // Need to run `createSchemaCustomization` to populate type paths. It should
    // be safer to run the actual function rather than mock it to ensure changes
    // to `createSchemaCustomization` are still compatible with this
    // functionality.
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    const doc = queryResponse.results[0]

    expect(gatsbyContext.actions.createNode).toHaveBeenCalledWith(
      expect.objectContaining({
        prismicId: doc.id,
        data: expect.objectContaining({
          embed: expect.any(String),
        }),
      }),
    )

    expect(gatsbyContext.actions.createNode).toHaveBeenCalledWith(
      expect.objectContaining({
        ...(doc.data?.embed as Record<string, unknown>),
        internal: expect.objectContaining({
          type: 'PrismicPrefixEmbedType',
        }),
      }),
    )
  })

  test('integration fields are normalized to inferred nodes', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()
    const docWithIntegrationId = createPrismicAPIDocument({
      data: {
        integration: {
          id: 1,
          foo: 'bar',
        },
      },
      type: 'foo',
    })
    const docWithoutIntegrationId = createPrismicAPIDocument({
      data: {
        integration: {
          foo: 'bar',
        },
      },
      type: 'foo',
    })
    const queryResponse = createPrismicAPIQueryResponse([
      docWithIntegrationId,
      docWithoutIntegrationId,
    ])

    pluginOptions.schemas = {
      foo: {
        Main: {
          integration: { type: PrismicFieldType.IntegrationField, config: {} },
        },
      },
    }

    nockRepositoryEndpoint(pluginOptions)
    nock(pluginOptions.apiEndpoint)
      .get('/documents/search')
      .query({
        access_token: pluginOptions.accessToken,
        ref: 'master',
        lang: '*',
        page: 1,
        pageSize: 100,
      })
      .reply(200, queryResponse)

    // Need to run `createSchemaCustomization` to populate type paths. It should
    // be safer to run the actual function rather than mock it to ensure changes
    // to `createSchemaCustomization` are still compatible with this
    // functionality.
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    for (const doc of queryResponse.results) {
      expect(gatsbyContext.actions.createNode).toHaveBeenCalledWith(
        expect.objectContaining({
          prismicId: doc.id,
          data: expect.objectContaining({
            integration: expect.any(String),
          }),
        }),
      )
    }

    // The ID used to generate the node's `id` field should be derived from the
    // integration field's `id` field.
    expect(gatsbyContext.actions.createNode).toHaveBeenCalledWith(
      expect.objectContaining({
        prismicId: docWithIntegrationId.data.integration.id,
        internal: expect.objectContaining({
          type: 'PrismicPrefixFooDataIntegrationIntegrationType',
        }),
      }),
    )

    // If the integration field doesn't have an `id` field, the field's content
    // digest should be used instead.
    expect(gatsbyContext.actions.createNode).toHaveBeenCalledWith(
      expect.objectContaining({
        prismicId: gatsbyContext.createContentDigest?.(
          docWithoutIntegrationId.data.integration,
        ),
        internal: expect.objectContaining({
          type: 'PrismicPrefixFooDataIntegrationIntegrationType',
        }),
      }),
    )
  })
})
