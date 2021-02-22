import * as prismic from 'ts-prismic'
import nock from 'nock'

import { sourceNodes } from '../src/source-nodes'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createNodeHelpers } from './__testutils__/createNodeHelpers'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'
import { createPrismicAPIQueryResponse } from './__testutils__/createPrismicAPIQueryResponse'
import { createWebhookAPIUpdateDocAddition } from './__testutils__/createWebhookAPIUpdateDocAddition'
import { createWebhookAPIUpdateDocDeletion } from './__testutils__/createWebhookAPIUpdateDocDeletion'
import { createWebhookAPIUpdateReleaseDocAddition } from './__testutils__/createWebhookAPIUpdateReleaseDocAddition'
import { createWebhookAPIUpdateReleaseDocDeletion } from './__testutils__/createWebhookAPIUpdateReleaseDocDeletion'
import { createWebhookTestTrigger } from './__testutils__/createWebhookTestTrigger'
import { createWebhookUnknown } from './__testutils__/createWebhookUnknown'
import { nockRepositoryEndpoint } from './__testutils__/nockRepositoryEndpoint'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('any webhook', () => {
  test('touches all nodes to prevent garbage collection', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()
    const webhookBody = createWebhookUnknown()
    const nodeHelpers = createNodeHelpers(gatsbyContext, pluginOptions)

    gatsbyContext.webhookBody = webhookBody

    // Populate the node store with some nodes.
    const docs = [createPrismicAPIDocument(), createPrismicAPIDocument()]
    const nodes = docs.map((doc) =>
      nodeHelpers.createNodeFactory(doc.type)(doc),
    )
    nodes.forEach((node) => gatsbyContext.actions.createNode?.(node))

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    for (const node of nodes) {
      expect(gatsbyContext.actions.touchNode).toHaveBeenCalledWith({
        nodeId: node.id,
      })
    }
  })

  test('ignores unknown webhooks', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()
    const webhookBody = createWebhookUnknown()

    gatsbyContext.webhookBody = webhookBody

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    expect(gatsbyContext.reporter.info).not.toHaveBeenCalled()
    expect(gatsbyContext.reporter.warn).not.toHaveBeenCalled()
  })

  test('accepts webhooks without a secret if plugin options does not include a secret', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()
    const webhookBody = createWebhookTestTrigger()

    gatsbyContext.webhookBody = { ...webhookBody, secret: undefined }
    delete pluginOptions.webhookSecret

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    expect(gatsbyContext.reporter.info).toHaveBeenCalledWith(
      expect.stringMatching(/success/i),
    )
  })

  test('rejects webhooks with an invalid secret', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()
    const webhookBody = createWebhookTestTrigger()

    gatsbyContext.webhookBody = { ...webhookBody, secret: 'invalid-secret' }

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    expect(gatsbyContext.reporter.warn).toHaveBeenCalledWith(
      expect.stringMatching(/secret did not match/i),
    )
  })
})

describe('test-trigger', () => {
  test('reports success message', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()
    const webhookBody = createWebhookTestTrigger()

    gatsbyContext.webhookBody = webhookBody

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    expect(gatsbyContext.reporter.info).toHaveBeenCalledWith(
      expect.stringMatching(/success/i),
    )
  })
})

describe('api-update', () => {
  test('reports received message', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()
    const queryResponse = createPrismicAPIQueryResponse()
    const webhookBody = createWebhookAPIUpdateDocAddition(queryResponse.results)

    gatsbyContext.webhookBody = webhookBody

    nockRepositoryEndpoint(pluginOptions)
    nock(pluginOptions.apiEndpoint)
      .get('/documents/search')
      .query({
        access_token: pluginOptions.accessToken,
        ref: 'master',
        lang: '*',
        page: 1,
        pageSize: 100,
        q: `[${prismic.predicate.in('document.id', webhookBody.documents)}]`,
      })
      .reply(200, queryResponse)

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    expect(gatsbyContext.reporter.info).toHaveBeenCalledWith(
      expect.stringMatching(/received/i),
    )
  })

  test('doc addition creates/updates node', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()
    const queryResponse = createPrismicAPIQueryResponse()
    const webhookBody = createWebhookAPIUpdateDocAddition(queryResponse.results)

    gatsbyContext.webhookBody = webhookBody

    nockRepositoryEndpoint(pluginOptions).persist()
    nock(pluginOptions.apiEndpoint)
      .get('/documents/search')
      .query({
        access_token: pluginOptions.accessToken,
        ref: 'master',
        lang: '*',
        page: 1,
        pageSize: 100,
        q: `[${prismic.predicate.in('document.id', webhookBody.documents)}]`,
      })
      .reply(200, queryResponse)

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    for (const docId of webhookBody.documents) {
      expect(gatsbyContext.actions.createNode).toHaveBeenCalledWith(
        expect.objectContaining({
          prismicId: docId,
        }),
      )
    }
  })

  test('doc deletion deletes node', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()
    const docs = [createPrismicAPIDocument(), createPrismicAPIDocument()]
    // The query response only includes the first document of `docs`.
    // But the webhook body includes both docs.
    // This signals that the second doc has been deleted.
    const queryResponse = createPrismicAPIQueryResponse(docs.slice(0, 1))
    const webhookBody = createWebhookAPIUpdateDocDeletion(docs)
    const nodeHelpers = createNodeHelpers(gatsbyContext, pluginOptions)

    gatsbyContext.webhookBody = webhookBody

    // Populate the node store with some nodes.
    const nodes = docs.map((doc) =>
      nodeHelpers.createNodeFactory(doc.type, { idIsGloballyUnique: true })(
        doc,
      ),
    )
    nodes.forEach((node) => gatsbyContext.actions.createNode?.(node))

    nockRepositoryEndpoint(pluginOptions)
    nock(pluginOptions.apiEndpoint)
      .get('/documents/search')
      .query({
        access_token: pluginOptions.accessToken,
        ref: 'master',
        lang: '*',
        page: 1,
        pageSize: 100,
        q: `[${prismic.predicate.in('document.id', webhookBody.documents)}]`,
      })
      .reply(200, queryResponse)

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    for (const doc of docs.slice(1)) {
      expect(gatsbyContext.actions.deleteNode).toHaveBeenCalledWith({
        node: expect.objectContaining({ prismicId: doc.id }),
      })
    }
  })

  test('release doc addition creates/updates node if plugin options release ID matches', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()
    const queryResponse = createPrismicAPIQueryResponse()
    const webhookBody = createWebhookAPIUpdateReleaseDocAddition(
      queryResponse.results,
    )
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const webhookBodyReleaseUpdate = webhookBody.releases.update![0]

    gatsbyContext.webhookBody = webhookBody
    pluginOptions.releaseID = webhookBodyReleaseUpdate.id

    nockRepositoryEndpoint(pluginOptions)
    nock(pluginOptions.apiEndpoint)
      .get('/documents/search')
      .query({
        access_token: pluginOptions.accessToken,
        ref: webhookBodyReleaseUpdate.ref,
        lang: '*',
        page: 1,
        pageSize: 100,
        q: `[${prismic.predicate.in(
          'document.id',
          webhookBodyReleaseUpdate.documents,
        )}]`,
      })
      .reply(200, queryResponse)

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    for (const docId of webhookBodyReleaseUpdate.documents) {
      expect(gatsbyContext.actions.createNode).toHaveBeenCalledWith(
        expect.objectContaining({
          prismicId: docId,
        }),
      )
    }
  })

  test('release doc addition does nothing if plugin options release ID does not match', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()
    const queryResponse = createPrismicAPIQueryResponse([])
    const webhookBody = createWebhookAPIUpdateReleaseDocAddition(
      queryResponse.results,
    )

    gatsbyContext.webhookBody = webhookBody

    nockRepositoryEndpoint(pluginOptions)
    nock(pluginOptions.apiEndpoint)
      .get('/documents/search')
      .query({
        access_token: pluginOptions.accessToken,
        ref: 'master',
        lang: '*',
        page: 1,
        pageSize: 100,
        q: `[${prismic.predicate.in('document.id', [])}]`,
      })
      .reply(200, queryResponse)

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createNode).not.toHaveBeenCalled()
  })

  test('release doc deletion deletes node if plugin options release ID matches', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()
    const docs = [createPrismicAPIDocument(), createPrismicAPIDocument()]
    // The query response only includes the first document of `docs`.
    // But the webhook body includes both docs.
    // This signals that the second doc has been deleted.
    const queryResponse = createPrismicAPIQueryResponse(docs.slice(0, 1))
    const webhookBody = createWebhookAPIUpdateReleaseDocDeletion(docs)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const webhookBodyReleaseDeletion = webhookBody.releases.deletion![0]
    const nodeHelpers = createNodeHelpers(gatsbyContext, pluginOptions)

    gatsbyContext.webhookBody = webhookBody
    pluginOptions.releaseID = webhookBodyReleaseDeletion.id

    // Populate the node store with some nodes.
    const nodes = docs.map((doc) =>
      nodeHelpers.createNodeFactory(doc.type, { idIsGloballyUnique: true })(
        doc,
      ),
    )
    nodes.forEach((node) => gatsbyContext.actions.createNode?.(node))

    nockRepositoryEndpoint(pluginOptions)
    nock(pluginOptions.apiEndpoint)
      .get('/documents/search')
      .query({
        access_token: pluginOptions.accessToken,
        ref: webhookBodyReleaseDeletion.ref,
        lang: '*',
        page: 1,
        pageSize: 100,
        q: `[${prismic.predicate.in(
          'document.id',
          webhookBodyReleaseDeletion.documents,
        )}]`,
      })
      .reply(200, queryResponse)

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    for (const doc of docs.slice(1)) {
      expect(gatsbyContext.actions.deleteNode).toHaveBeenCalledWith({
        node: expect.objectContaining({ prismicId: doc.id }),
      })
    }
  })

  test('release doc deletion does nothing if plugin options release ID does not match', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()
    const queryResponse = createPrismicAPIQueryResponse([])
    const webhookBody = createWebhookAPIUpdateReleaseDocDeletion(
      queryResponse.results,
    )

    gatsbyContext.webhookBody = webhookBody

    nockRepositoryEndpoint(pluginOptions)
    nock(pluginOptions.apiEndpoint)
      .get('/documents/search')
      .query({
        access_token: pluginOptions.accessToken,
        ref: 'master',
        lang: '*',
        page: 1,
        pageSize: 100,
        q: `[${prismic.predicate.in('document.id', [])}]`,
      })
      .reply(200, queryResponse)

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.deleteNode).not.toHaveBeenCalled()
  })
})
