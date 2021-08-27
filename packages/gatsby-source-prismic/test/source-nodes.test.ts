import test from 'ava'
import * as sinon from 'sinon'
import * as mswNode from 'msw/node'
import * as prismicM from '@prismicio/mock'

import { createAPIQueryMockedRequest } from './__testutils__/createAPIQueryMockedRequest'
import { createAPIRepositoryMockedRequest } from './__testutils__/createAPIRepositoryMockedRequest'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createMockCustomTypeModelWithFields } from './__testutils__/createMockCustomTypeModelWithFields'
import { createPluginOptions } from './__testutils__/createPluginOptions'

import { createSchemaCustomization, sourceNodes } from '../src/gatsby-node'

const server = mswNode.setupServer()
test.before(() => server.listen({ onUnhandledRequest: 'error' }))
test.after(() => server.close())

test('creates nodes', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const repositoryResponse = prismicM.api.repository({ seed: t.title })
  const queryResponse = prismicM.api.query({
    seed: t.title,
    documents: [
      prismicM.value.document({ seed: t.title }),
      prismicM.value.document({ seed: t.title }),
    ],
  })

  server.use(
    createAPIRepositoryMockedRequest({
      pluginOptions,
      repositoryResponse,
    }),
  )
  server.use(
    createAPIQueryMockedRequest({
      pluginOptions,
      repositoryResponse,
      queryResponse,
    }),
  )

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

test('field names are normalized using transformFieldName option', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  const customTypeModel = createMockCustomTypeModelWithFields(t, {
    'dash-boolean': prismicM.model.boolean({ seed: t.title }),
    group: {
      ...prismicM.model.group({ seed: t.title }),
      config: {
        label: 'Group',
        fields: {
          'dash-boolean': prismicM.model.boolean({ seed: t.title }),
        },
      },
    },
    sliceZone: {
      ...prismicM.model.sliceZone({ seed: t.title }),
      config: {
        labels: {},
        choices: {
          'dash-slice': {
            ...prismicM.model.slice({ seed: t.title }),
            'non-repeat': {
              'dash-boolean': prismicM.model.boolean({ seed: t.title }),
            },
            repeat: {
              'dash-boolean': prismicM.model.boolean({ seed: t.title }),
            },
          },
        },
      },
    },
  })
  const document = prismicM.value.document({
    seed: t.title,
    model: customTypeModel,
  })
  const repositoryResponse = prismicM.api.repository({ seed: t.title })
  const queryResponse = prismicM.api.query({
    seed: t.title,
    documents: [document],
  })

  pluginOptions.customTypeModels = [customTypeModel]

  server.use(
    createAPIRepositoryMockedRequest({
      pluginOptions,
      repositoryResponse,
    }),
  )
  server.use(
    createAPIQueryMockedRequest({
      pluginOptions,
      queryResponse,
      repositoryResponse,
    }),
  )

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)
  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.actions.createNode as sinon.SinonStub).calledWith(
      sinon.match({
        prismicId: document.id,
        data: {
          dash_boolean: sinon.match.bool,
          group: sinon.match.every(
            sinon.match({ dash_boolean: sinon.match.bool }),
          ),
          sliceZone: sinon.match.every(
            sinon.match({
              slice_type: 'dash-slice',
              primary: { dash_boolean: sinon.match.bool },
              items: sinon.match.every(
                sinon.match({ dash_boolean: sinon.match.bool }),
              ),
            }),
          ),
        },
      }),
    ),
  )
})

test('uses apiEndpoint plugin option if provided', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const repositoryResponse = prismicM.api.repository({ seed: t.title })
  const queryResponse = prismicM.api.query({ seed: t.title })

  pluginOptions.apiEndpoint = 'https://example.com'

  server.use(
    createAPIRepositoryMockedRequest({
      pluginOptions,
      repositoryResponse,
    }),
  )
  server.use(
    createAPIQueryMockedRequest({
      pluginOptions,
      repositoryResponse,
      queryResponse,
    }),
  )

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.pass()
})

test('embed fields are normalized to inferred nodes', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  const customTypeModel = createMockCustomTypeModelWithFields(t, {
    embed: prismicM.model.embed({ seed: t.title }),
  })
  const document = prismicM.value.document({
    seed: t.title,
    model: customTypeModel,
  })
  const repositoryResponse = prismicM.api.repository({ seed: t.title })
  const queryResponse = prismicM.api.query({
    seed: t.title,
    documents: [document],
  })

  pluginOptions.customTypeModels = [customTypeModel]

  server.use(
    createAPIRepositoryMockedRequest({
      pluginOptions,
      repositoryResponse,
    }),
  )
  server.use(
    createAPIQueryMockedRequest({
      pluginOptions,
      repositoryResponse,
      queryResponse,
    }),
  )

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)
  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  const createNodeStub = gatsbyContext.actions.createNode as sinon.SinonStub

  t.true(
    createNodeStub.calledWith(
      sinon.match({
        prismicId: document.id,
        data: {
          embed: sinon.match.string,
        },
      }),
    ),
  )

  t.true(
    createNodeStub.calledWith(
      sinon.match({
        embed_url: document.data.embed.embed_url,
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

  const customTypeModel = createMockCustomTypeModelWithFields(t, {
    integrationFields: prismicM.model.integrationFields({ seed: t.title }),
  })
  // A known ID is needed to test the type name later in the test.
  customTypeModel.id = 'foo'
  const document = prismicM.value.document({
    seed: t.title,
    model: customTypeModel,
  })
  const repositoryResponse = prismicM.api.repository({ seed: t.title })
  const queryResponse = prismicM.api.query({
    seed: t.title,
    documents: [document],
  })

  pluginOptions.customTypeModels = [customTypeModel]

  server.use(
    createAPIRepositoryMockedRequest({
      pluginOptions,
      repositoryResponse,
    }),
  )
  server.use(
    createAPIQueryMockedRequest({
      pluginOptions,
      repositoryResponse,
      queryResponse,
    }),
  )

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
            integrationFields: sinon.match.string,
          }),
        }),
      ),
    )
  }

  t.true(
    createNodeStub.calledWith(
      sinon.match({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        prismicId: document.data.integrationFields!.id,
        internal: sinon.match({
          type: 'PrismicPrefixFooDataIntegrationFieldsIntegrationType',
        }),
      }),
    ),
  )
})
