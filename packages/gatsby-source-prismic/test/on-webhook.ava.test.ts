import test from 'ava'
import * as sinon from 'sinon'

import { sourceNodes } from '../src/source-nodes'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createNodeHelpers } from './__testutils__/createNodeHelpers'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'
import { createWebhookTestTrigger } from './__testutils__/createWebhookTestTrigger'
import { createWebhookUnknown } from './__testutils__/createWebhookUnknown'

test('touches all nodes to prevent garbage collection', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const webhookBody = createWebhookUnknown()
  const nodeHelpers = createNodeHelpers(gatsbyContext, pluginOptions)

  gatsbyContext.webhookBody = webhookBody

  // Populate the node store with some nodes.
  const docs = [createPrismicAPIDocument(), createPrismicAPIDocument()]
  const nodes = docs.map((doc) => nodeHelpers.createNodeFactory(doc.type)(doc))
  nodes.forEach((node) => gatsbyContext.actions.createNode?.(node))

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.true(
    nodes.every((node) =>
      (gatsbyContext.actions.touchNode as sinon.SinonStub).calledWith(node),
    ),
  )
})

test('ignores unknown webhooks', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const webhookBody = createWebhookUnknown()

  gatsbyContext.webhookBody = webhookBody

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.true((gatsbyContext.reporter.info as sinon.SinonStub).notCalled)
  t.true((gatsbyContext.reporter.warn as sinon.SinonStub).notCalled)
})

test('accepts webhooks without a secret if plugin options does not include a secret', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const webhookBody = createWebhookTestTrigger()

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
  const pluginOptions = createPluginOptions()
  const webhookBody = createWebhookTestTrigger()

  gatsbyContext.webhookBody = { ...webhookBody, secret: 'invalid-secret' }

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.reporter.warn as sinon.SinonStub).calledWith(
      sinon.match(/secret did not match/i),
    ),
  )
})
