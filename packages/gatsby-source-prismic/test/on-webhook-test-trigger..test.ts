import test from 'ava'
import * as sinon from 'sinon'

import { sourceNodes } from '../src/source-nodes'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createWebhookTestTrigger } from './__testutils__/createWebhookTestTrigger'

test('reports success message', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const webhookBody = createWebhookTestTrigger()

  gatsbyContext.webhookBody = webhookBody

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.reporter.info as sinon.SinonStub).calledWith(
      sinon.match(/success/i),
    ),
  )
})
