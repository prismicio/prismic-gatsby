import test from 'ava'
import * as sinon from 'sinon'
import * as mswNode from 'msw/node'

import { createAPIQueryMockedRequest } from './__testutils__/createAPIQueryMockedRequest'
import { createAPIRepositoryMockedRequest } from './__testutils__/createAPIRepositoryMockedRequest'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'
import { createPrismicAPIQueryResponse } from './__testutils__/createPrismicAPIQueryResponse'

import { PrismicFieldType } from '../src'
import { createSchemaCustomization, sourceNodes } from '../src/gatsby-node'

const server = mswNode.setupServer()
test.before(() => server.listen({ onUnhandledRequest: 'error' }))
test.after(() => server.close())

test('creates nodes', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const queryResponse = createPrismicAPIQueryResponse()

  server.use(createAPIRepositoryMockedRequest(pluginOptions))
  server.use(createAPIQueryMockedRequest(pluginOptions, queryResponse))

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  for (const doc of queryResponse.results) {
    t.true(
      (gatsbyContext.actions.createNode as sinon.SinonStub).calledWith(
        sinon.match({ prismicId: doc.id }),
      ),
    )
  }
})

test('uses apiEndpoint plugin option if provided', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const queryResponse = createPrismicAPIQueryResponse()

  pluginOptions.apiEndpoint = 'https://example.com'

  server.use(createAPIRepositoryMockedRequest(pluginOptions))
  server.use(createAPIQueryMockedRequest(pluginOptions, queryResponse))

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.pass()
})

test('embed fields are normalized to inferred nodes', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const doc = createPrismicAPIDocument({
    data: {
      embed: {
        embed_url: 'https://youtube.com',
      },
    },
  })
  const queryResponse = createPrismicAPIQueryResponse([doc])

  pluginOptions.schemas = {
    type: {
      Main: {
        embed: { type: PrismicFieldType.Embed, config: {} },
      },
    },
  }

  server.use(createAPIRepositoryMockedRequest(pluginOptions))
  server.use(createAPIQueryMockedRequest(pluginOptions, queryResponse))

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  const createNodeStub = gatsbyContext.actions.createNode as sinon.SinonStub

  t.true(
    createNodeStub.calledWith(
      sinon.match({
        prismicId: doc.id,
        data: {
          embed: sinon.match.string,
        },
      }),
    ),
  )

  t.true(
    createNodeStub.calledWith(
      sinon.match({
        embed_url: doc.data.embed.embed_url,
        internal: sinon.match({
          type: 'PrismicPrefixEmbedType',
        }),
      }),
    ),
  )
})

test('integration fields are normalized to inferred nodes', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
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

  server.use(createAPIRepositoryMockedRequest(pluginOptions))
  server.use(createAPIQueryMockedRequest(pluginOptions, queryResponse))

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  const createNodeStub = gatsbyContext.actions.createNode as sinon.SinonStub

  for (const doc of queryResponse.results) {
    t.true(
      createNodeStub.calledWith(
        sinon.match({
          prismicId: doc.id,
          data: sinon.match({
            integration: sinon.match.string,
          }),
        }),
      ),
    )
  }

  t.true(
    createNodeStub.calledWith(
      sinon.match({
        prismicId: docWithIntegrationId.data.integration.id,
        internal: sinon.match({
          type: 'PrismicPrefixFooDataIntegrationIntegrationType',
        }),
      }),
    ),
  )

  t.true(
    createNodeStub.calledWith(
      sinon.match({
        prismicId: gatsbyContext.createContentDigest?.(
          docWithoutIntegrationId.data.integration,
        ),
        internal: sinon.match({
          type: 'PrismicPrefixFooDataIntegrationIntegrationType',
        }),
      }),
    ),
  )
})
