import nock from 'nock'

import { sourceNodes } from '../src/source-nodes'
import {
  gatsbyContext as gatsbyContextOrig,
  nodes,
} from './__fixtures__/gatsbyContext'
import { pluginOptions as pluginOptionsOrig } from './__fixtures__/pluginOptions'
import * as webhooks from './__fixtures__/webhooks'
import mockDocument from './__fixtures__/document.json'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createNodeHelpers } from './__testutils__/createNodeHelpers'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'

const testTriggerCtx = {
  ...gatsbyContextOrig,
  webhookBody: webhooks.testTrigger,
}

const url = new URL(pluginOptionsOrig.apiEndpoint)
const origin = url.origin

beforeEach(() => {
  jest.clearAllMocks()

  nock(origin)
    .get('/api/v2')
    .query({ access_token: pluginOptionsOrig.accessToken })
    .reply(200, {
      types: { kitchen_sink: 'Kitchen Sink' },
      refs: [
        { id: 'master', ref: 'master', isMasterRef: true },
        {
          id: 'XyfxIPl3p7YAQ7Mg',
          ref: 'XyghHfl3p3ACRIZH~Xyfw_Pl3p90AQ7J8',
          isMasterRef: false,
        },
      ],
    })
})

describe('any webhook', () => {
  test('touches all nodes to prevent garbage collection', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()
    const nodeHelpers = createNodeHelpers(gatsbyContext, pluginOptions)

    gatsbyContext.webhookBody = webhooks.unknown

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

    gatsbyContext.webhookBody = webhooks.unknown

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    expect(gatsbyContext.reporter.info).not.toHaveBeenCalled()
    expect(gatsbyContext.reporter.warn).not.toHaveBeenCalled()
  })

  test('accepts webhooks without a secret if plugin options does not include a secret', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    gatsbyContext.webhookBody = {
      ...webhooks.testTrigger,
      secret: undefined,
    }

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

    gatsbyContext.webhookBody = {
      ...webhooks.testTrigger,
      secret: 'invalid-secret',
    }

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

    gatsbyContext.webhookBody = webhooks.testTrigger

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(gatsbyContext, pluginOptions)

    expect(gatsbyContext.reporter.info).toHaveBeenCalledWith(
      expect.stringMatching(/success/i),
    )
  })
})

describe('api-update', () => {
  const apiUpdateDocAdditionCtx = {
    ...gatsbyContextOrig,
    webhookBody: webhooks.apiUpdateDocAddition,
  }

  const apiUpdateDocDeletionCtx = {
    ...gatsbyContextOrig,
    webhookBody: webhooks.apiUpdateDocDeletion,
  }

  const apiUpdateReleaseDocAdditionCtx = {
    ...gatsbyContextOrig,
    webhookBody: webhooks.apiUpdateReleaseDocAddition,
  }

  const apiUpdateReleaseDocDeletionCtx = {
    ...gatsbyContextOrig,
    webhookBody: webhooks.apiUpdateReleaseDocDeletion,
  }

  // TODO: Continue refactoring these tests to use the create* helpers.
  // Will also need to update nock calls to use getURLOrigin and ts-prismic.
  // See the sourcesNodes tests
  test('reports received message', async () => {
    nock(origin)
      .get('/api/v2/documents/search')
      .query({
        access_token: pluginOptionsOrig.accessToken,
        ref: 'master',
        lang: '*',
        page: 1,
        pageSize: 100,
        q: '[[in(document.id, ["1"])]]',
      })
      .reply(200, {
        total_pages: 1,
        results: nodes.map((node) => ({ ...mockDocument, id: node.prismicId })),
      })

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(apiUpdateDocAdditionCtx, pluginOptionsOrig)

    const matcher = expect.stringMatching(/received/i)
    expect(gatsbyContextOrig.reporter.info).toHaveBeenCalledWith(matcher)
  })

  test('doc addition creates/updates node', async () => {
    nock(origin)
      .get('/api/v2/documents/search')
      .query({
        access_token: pluginOptionsOrig.accessToken,
        ref: 'master',
        lang: '*',
        page: 1,
        pageSize: 100,
        q: '[[in(document.id, ["1"])]]',
      })
      .reply(200, {
        total_pages: 1,
        results: nodes.map((node) => ({ ...mockDocument, id: node.prismicId })),
      })

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(apiUpdateDocAdditionCtx, pluginOptionsOrig)

    expect(gatsbyContextOrig.actions.createNode).toHaveBeenCalledWith(
      expect.objectContaining({
        prismicId: webhooks.apiUpdateDocAddition.documents[0],
      }),
    )
  })

  test('doc deletion deletes node', async () => {
    nock(origin)
      .get('/api/v2/documents/search')
      .query({
        access_token: pluginOptionsOrig.accessToken,
        ref: 'master',
        lang: '*',
        page: 1,
        pageSize: 100,
        q: '[[in(document.id, ["1"])]]',
      })
      .reply(200, {
        total_pages: 1,
        results: [],
      })

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(apiUpdateDocDeletionCtx, pluginOptionsOrig)

    expect(gatsbyContextOrig.actions.deleteNode).toHaveBeenCalledWith(
      expect.objectContaining({ node: nodes[0] }),
    )
  })

  test('release doc addition creates/updates node if plugin options release ID matches', async () => {
    const options = { ...pluginOptionsOrig }
    options.releaseID =
      webhooks.apiUpdateReleaseDocAddition.releases.update?.[0]?.id

    nock(origin)
      .get('/api/v2/documents/search')
      .query({
        access_token: pluginOptionsOrig.accessToken,
        ref: 'XyghHfl3p3ACRIZH~Xyfw_Pl3p90AQ7J8',
        lang: '*',
        page: 1,
        pageSize: 100,
        q: '[[in(document.id, ["1"])]]',
      })
      .reply(200, {
        total_pages: 1,
        results: nodes.map((node) => ({ ...mockDocument, id: node.prismicId })),
      })

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(apiUpdateReleaseDocAdditionCtx, options)

    expect(gatsbyContextOrig.actions.createNode).toHaveBeenCalledWith(
      expect.objectContaining({
        prismicId:
          webhooks.apiUpdateReleaseDocAddition.releases.update?.[0]
            ?.documents[0],
      }),
    )
  })

  test('release doc addition does nothing if plugin options release ID does not match', async () => {
    nock(origin)
      .get('/api/v2/documents/search')
      .query({
        access_token: pluginOptionsOrig.accessToken,
        ref: 'master',
        lang: '*',
        page: 1,
        pageSize: 100,
        q: '[[in(document.id, [])]]',
      })
      .reply(200, {
        total_pages: 1,
        results: [],
      })

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(apiUpdateReleaseDocAdditionCtx, pluginOptionsOrig)

    expect(gatsbyContextOrig.actions.createNode).not.toHaveBeenCalled()
  })

  test('release doc deletion deletes node if plugin options release ID matches', async () => {
    const options = { ...pluginOptionsOrig }
    options.releaseID =
      webhooks.apiUpdateReleaseDocDeletion.releases.update?.[0]?.id

    nock(origin)
      .get('/api/v2/documents/search')
      .query({
        access_token: pluginOptionsOrig.accessToken,
        ref: 'XyghHfl3p3ACRIZH~Xyfw_Pl3p90AQ7J8',
        lang: '*',
        page: 1,
        pageSize: 100,
        q: '[[in(document.id, ["1"])]]',
      })
      .reply(200, {
        total_pages: 1,
        results: [],
      })

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(apiUpdateReleaseDocDeletionCtx, options)

    expect(gatsbyContextOrig.actions.deleteNode).toHaveBeenCalledWith(
      expect.objectContaining({ node: nodes[0] }),
    )
  })

  test('release doc deletion does nothing if plugin options release ID does not match', async () => {
    nock(origin)
      .get('/api/v2/documents/search')
      .query({
        access_token: pluginOptionsOrig.accessToken,
        ref: 'master',
        lang: '*',
        page: 1,
        pageSize: 100,
        q: '[[in(document.id, [])]]',
      })
      .reply(200, {
        total_pages: 1,
        results: [],
      })

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(apiUpdateReleaseDocDeletionCtx, pluginOptionsOrig)

    expect(gatsbyContextOrig.actions.deleteNode).not.toHaveBeenCalled()
  })
})
