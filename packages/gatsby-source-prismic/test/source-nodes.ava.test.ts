import test from 'ava'
import * as msw from 'msw'
import * as mswNode from 'msw/node'

import { PrismicFieldType } from '../src'
import { createSchemaCustomization } from '../src/create-schema-customization'
import { sourceNodes } from '../src/source-nodes'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'
import { createPrismicAPIQueryResponse } from './__testutils__/createPrismicAPIQueryResponse'
import { nockRepositoryEndpoint } from './__testutils__/nockRepositoryEndpoint'
import { resolveAPIURL } from './__testutils__/resolveURL'

const server = mswNode.setupServer()
test.before(() => server.listen({ onUnhandledRequest: 'error' }))
test.after(() => server.close())

test('creates nodes', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const queryResponse = createPrismicAPIQueryResponse()

  nockRepositoryEndpoint(server, pluginOptions)
  server.use(
    msw.rest.get(
      resolveAPIURL(pluginOptions.apiEndpoint, './documents/search'),
      (req, res, ctx) =>
        req.url.searchParams.get('access_token') ===
          pluginOptions.accessToken &&
        req.url.searchParams.get('ref') === 'master' &&
        req.url.searchParams.get('lang') === '*' &&
        req.url.searchParams.get('page') === '1' &&
        req.url.searchParams.get('pageSize') === '100'
          ? res(ctx.json(queryResponse))
          : res(ctx.status(401)),
    ),
  )

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  const createdNodes = gatsbyContext.getNodes?.() ?? []

  t.true(
    queryResponse.results.every((doc) =>
      createdNodes.some((node) => node.prismicId === doc.id),
    ),
  )
})

test('uses apiEndpoint plugin option if provided', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const queryResponse = createPrismicAPIQueryResponse()

  pluginOptions.apiEndpoint = 'https://example.com'

  nockRepositoryEndpoint(server, pluginOptions, '/')
  server.use(
    msw.rest.get(
      resolveAPIURL(pluginOptions.apiEndpoint, './documents/search'),
      (req, res, ctx) =>
        req.url.searchParams.get('access_token') ===
          pluginOptions.accessToken &&
        req.url.searchParams.get('ref') === 'master' &&
        req.url.searchParams.get('lang') === '*' &&
        req.url.searchParams.get('page') === '1' &&
        req.url.searchParams.get('pageSize') === '100'
          ? res(ctx.json(queryResponse))
          : res(ctx.status(401)),
    ),
  )

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.pass()
})

test('embed fields are normalized to inferred nodes', async (t) => {
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

  nockRepositoryEndpoint(server, pluginOptions)
  server.use(
    msw.rest.get(
      resolveAPIURL(pluginOptions.apiEndpoint, './documents/search'),
      (req, res, ctx) =>
        req.url.searchParams.get('access_token') ===
          pluginOptions.accessToken &&
        req.url.searchParams.get('ref') === 'master' &&
        req.url.searchParams.get('lang') === '*' &&
        req.url.searchParams.get('page') === '1' &&
        req.url.searchParams.get('pageSize') === '100'
          ? res(ctx.json(queryResponse))
          : res(ctx.status(401)),
    ),
  )

  // Need to run `createSchemaCustomization` to populate type paths. It should
  // be safer to run the actual function rather than mock it to ensure changes
  // to `createSchemaCustomization` are still compatible with this
  // functionality.
  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  const doc = queryResponse.results[0]
  const nodes = gatsbyContext.getNodes?.() ?? []

  t.true(
    nodes.some(
      (node) =>
        node.prismicId === doc.id &&
        typeof (node.data as Record<string, unknown>).embed === 'string',
    ),
  )

  t.true(
    nodes.some(
      (node) =>
        (node.data as Record<string, unknown>)?.embed_url ===
          doc.data.embed_url && node.internal.type === 'PrismicPrefixEmbedType',
    ),
  )
})

test('integration fields are normalized to inferred nodes', async (t) => {
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
        integration: { type: PrismicFieldType.IntegrationFields, config: {} },
      },
    },
  }

  nockRepositoryEndpoint(server, pluginOptions)
  server.use(
    msw.rest.get(
      resolveAPIURL(pluginOptions.apiEndpoint, './documents/search'),
      (req, res, ctx) =>
        req.url.searchParams.get('access_token') ===
          pluginOptions.accessToken &&
        req.url.searchParams.get('ref') === 'master' &&
        req.url.searchParams.get('lang') === '*' &&
        req.url.searchParams.get('page') === '1' &&
        req.url.searchParams.get('pageSize') === '100'
          ? res(ctx.json(queryResponse))
          : res(ctx.status(401)),
    ),
  )

  // Need to run `createSchemaCustomization` to populate type paths. It should
  // be safer to run the actual function rather than mock it to ensure changes
  // to `createSchemaCustomization` are still compatible with this
  // functionality.
  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  const nodes = gatsbyContext.getNodes?.() ?? []

  t.true(
    queryResponse.results.every((doc) =>
      nodes.some(
        (node) =>
          node.prismicId === doc.id &&
          typeof (node.data as Record<string, unknown>)?.integration ===
            'string',
      ),
    ),
  )

  // The ID used to generate the node's `id` field should be derived from the
  // integration field's `id` field.
  t.true(
    nodes.some(
      (node) =>
        node.prismicId === docWithIntegrationId.data.integration.id &&
        node.internal.type === 'PrismicPrefixFooDataIntegrationIntegrationType',
    ),
  )

  // If the integration field doesn't have an `id` field, the field's content
  // digest should be used instead.
  t.true(
    nodes.some(
      (node) =>
        node.prismicId ===
          gatsbyContext.createContentDigest?.(
            docWithoutIntegrationId.data.integration,
          ) &&
        node.internal.type === 'PrismicPrefixFooDataIntegrationIntegrationType',
    ),
  )
})
