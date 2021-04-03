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
        embed_url: 'https://youtube.com/1',
      },
      group: [
        {
          embed: {
            embed_url: 'https://youtube.com/2',
          },
        },
      ],
      slices: [
        {
          slice_type: 'embed',
          primary: {
            embed: {
              embed_url: 'https://youtube.com/3',
            },
          },
          items: [
            {
              embed: {
                embed_url: 'https://youtube.com/4',
              },
            },
          ],
        },
      ],
    },
  })
  const queryResponse = createPrismicAPIQueryResponse([doc])

  pluginOptions.schemas = {
    type: {
      Main: {
        embed: { type: PrismicFieldType.Embed, config: {} },
        group: {
          type: PrismicFieldType.Group,
          config: {
            fields: {
              embed: { type: PrismicFieldType.Embed, config: {} },
            },
          },
        },
        slices: {
          type: PrismicFieldType.Slices,
          config: {
            choices: {
              embed: {
                type: PrismicFieldType.Slice,
                repeat: {
                  embed: { type: PrismicFieldType.Embed, config: {} },
                },
                'non-repeat': {
                  embed: { type: PrismicFieldType.Embed, config: {} },
                },
              },
            },
          },
        },
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
          group: [{ embed: sinon.match.string }],
          slices: [
            sinon.match({
              slice_type: 'embed',
              primary: { embed: sinon.match.string },
              items: [{ embed: sinon.match.string }],
            }),
          ],
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

  t.true(
    createNodeStub.calledWith(
      sinon.match({
        embed_url: doc.data.group[0].embed.embed_url,
        internal: sinon.match({
          type: 'PrismicPrefixEmbedType',
        }),
      }),
    ),
  )

  t.true(
    createNodeStub.calledWith(
      sinon.match({
        embed_url: doc.data.slices[0].primary.embed.embed_url,
        internal: sinon.match({
          type: 'PrismicPrefixEmbedType',
        }),
      }),
    ),
  )

  t.true(
    createNodeStub.calledWith(
      sinon.match({
        embed_url: doc.data.slices[0].items[0].embed.embed_url,
        internal: sinon.match({
          type: 'PrismicPrefixEmbedType',
        }),
      }),
    ),
  )
})

test.only('integration fields are normalized to inferred nodes', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const docWithIntegrationId = createPrismicAPIDocument({
    data: {
      integration: {
        id: 1,
        foo: 'bar',
      },
      group: [
        {
          integration: {
            id: 2,
            foo: 'bar',
          },
        },
      ],
      slices: [
        {
          slice_type: 'integration',
          primary: {
            integration: {
              id: 3,
              foo: 'bar',
            },
          },
          items: [
            {
              integration: {
                id: 4,
                foo: 'bar',
              },
            },
          ],
        },
      ],
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
        group: {
          type: PrismicFieldType.Group,
          config: {
            fields: {
              integration: {
                type: PrismicFieldType.IntegrationFields,
                config: {},
              },
            },
          },
        },
        slices: {
          type: PrismicFieldType.Slices,
          config: {
            choices: {
              integration: {
                type: PrismicFieldType.Slice,
                repeat: {
                  integration: {
                    type: PrismicFieldType.IntegrationFields,
                    config: {},
                  },
                },
                'non-repeat': {
                  integration: {
                    type: PrismicFieldType.IntegrationFields,
                    config: {},
                  },
                },
              },
            },
          },
        },
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
        prismicId: docWithIntegrationId.id,
        data: sinon.match({
          integration: sinon.match.string,
          group: [{ integration: sinon.match.string }],
          slices: [
            sinon.match({
              slice_type: 'integration',
              primary: { integration: sinon.match.string },
              items: [{ integration: sinon.match.string }],
            }),
          ],
        }),
      }),
    ),
  )

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
        prismicId: docWithIntegrationId.data.group[0].integration.id,
        internal: sinon.match({
          type: 'PrismicPrefixFooDataGroupIntegrationIntegrationType',
        }),
      }),
    ),
  )

  t.true(
    createNodeStub.calledWith(
      sinon.match({
        prismicId: docWithIntegrationId.data.slices[0].primary.integration.id,
        internal: sinon.match({
          type:
            'PrismicPrefixFooDataSlicesIntegrationPrimaryIntegrationIntegrationType',
        }),
      }),
    ),
  )

  t.true(
    createNodeStub.calledWith(
      sinon.match({
        prismicId: docWithIntegrationId.data.slices[0].items[0].integration.id,
        internal: sinon.match({
          type:
            'PrismicPrefixFooDataSlicesIntegrationItemsIntegrationIntegrationType',
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
