import test from 'ava'
import * as sinon from 'sinon'
import * as mswNode from 'msw/node'

import { createAPIQueryMockedRequest } from './__testutils__/createAPIQueryMockedRequest'
import { createAPIRepositoryMockedRequest } from './__testutils__/createAPIRepositoryMockedRequest'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPrismicAPIQueryResponse } from './__testutils__/createPrismicAPIQueryResponse'
import { createWebhookTestTrigger } from './__testutils__/createWebhookTestTrigger'
import { createWebhookUnknown } from './__testutils__/createWebhookUnknown'

import { sourceNodes } from '../src/source-nodes'

const server = mswNode.setupServer()
test.before(() => server.listen({ onUnhandledRequest: 'error' }))
test.after(() => server.close())

test('touches all nodes to prevent garbage collection', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const queryResponse = createPrismicAPIQueryResponse()
  const webhookBody = createWebhookUnknown()

  server.use(createAPIRepositoryMockedRequest(pluginOptions))
  server.use(createAPIQueryMockedRequest(pluginOptions, queryResponse))

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  gatsbyContext.webhookBody = webhookBody

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  for (const doc of queryResponse.results) {
    t.true(
      (gatsbyContext.actions.touchNode as sinon.SinonStub).calledWith(
        sinon.match({ prismicId: doc.id }),
      ),
    )
  }
})

test('ignores unknown webhooks', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const webhookBody = createWebhookUnknown()

  gatsbyContext.webhookBody = webhookBody

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.true((gatsbyContext.reporter.info as sinon.SinonStub).notCalled)
  t.true((gatsbyContext.reporter.warn as sinon.SinonStub).notCalled)
})

test('accepts webhooks without a secret if plugin options does not include a secret', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const webhookBody = createWebhookTestTrigger(pluginOptions)

  gatsbyContext.webhookBody = { ...webhookBody, secret: undefined }
  delete pluginOptions.webhookSecret

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.reporter.info as sinon.SinonStub).calledWith(
      sinon.match(/success/i),
    ),
  )
})

test('rejects webhooks with an invalid secret', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const webhookBody = createWebhookTestTrigger(pluginOptions)
  webhookBody.secret = 'invalid-secret'

  gatsbyContext.webhookBody = webhookBody

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.reporter.warn as sinon.SinonStub).calledWith(
      sinon.match(/secret did not match/i),
    ),
  )
})
