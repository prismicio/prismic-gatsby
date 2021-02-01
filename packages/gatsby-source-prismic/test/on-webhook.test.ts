import nock from 'nock'

import { sourceNodes } from '../src/source-nodes'
import { gatsbyContext, nodes } from './__fixtures__/gatsbyContext'
import { pluginOptions } from './__fixtures__/pluginOptions'
import * as webhooks from './__fixtures__/webhooks'
import mockDocument from './__fixtures__/document.json'

const testTriggerCtx = {
  ...gatsbyContext,
  webhookBody: webhooks.testTrigger,
}

const url = new URL(pluginOptions.apiEndpoint)
const origin = url.origin

beforeEach(() => {
  jest.clearAllMocks()

  nock(origin)
    .get('/api/v2')
    .query({ access_token: pluginOptions.accessToken })
    .reply(200, {
      types: { page: 'Page' },
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
  const unknownCtx = {
    ...gatsbyContext,
    webhookBody: webhooks.unknown,
  }

  test('touches all nodes to prevent garbage collection', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(unknownCtx, pluginOptions)

    expect(gatsbyContext.actions.touchNode).toHaveBeenCalledTimes(nodes.length)
  })

  test('ignores unknown webhooks', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(unknownCtx, pluginOptions)

    expect(gatsbyContext.reporter.info).not.toHaveBeenCalled()
    expect(gatsbyContext.reporter.warn).not.toHaveBeenCalled()
  })

  test('accepts webhooks without a secret if plugin options does not include a secret', async () => {
    const ctx = {
      ...testTriggerCtx,
      webhookBody: { ...testTriggerCtx.webhookBody },
    }
    ctx.webhookBody.secret = null

    const options = { ...pluginOptions }
    delete options.webhookSecret

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(ctx, options)

    const matcher = expect.stringMatching(/success/i)
    expect(gatsbyContext.reporter.info).toHaveBeenCalledWith(matcher)
  })

  test('rejects webhooks with an invalid secret', async () => {
    const ctx = {
      ...testTriggerCtx,
      webhookBody: { ...testTriggerCtx.webhookBody },
    }
    ctx.webhookBody.secret = 'invalid-secret'

    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(ctx, pluginOptions)

    const matcher = expect.stringMatching(/secret did not match/i)
    expect(gatsbyContext.reporter.warn).toHaveBeenCalledWith(matcher)
  })
})

describe('test-trigger', () => {
  test('reports success message', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(testTriggerCtx, pluginOptions)

    const matcher = expect.stringMatching(/success/i)
    expect(gatsbyContext.reporter.info).toHaveBeenCalledWith(matcher)
  })
})

describe('api-update', () => {
  const apiUpdateDocAdditionCtx = {
    ...gatsbyContext,
    webhookBody: webhooks.apiUpdateDocAddition,
  }

  const apiUpdateDocDeletionCtx = {
    ...gatsbyContext,
    webhookBody: webhooks.apiUpdateDocDeletion,
  }

  const apiUpdateReleaseDocAdditionCtx = {
    ...gatsbyContext,
    webhookBody: webhooks.apiUpdateReleaseDocAddition,
  }

  const apiUpdateReleaseDocDeletionCtx = {
    ...gatsbyContext,
    webhookBody: webhooks.apiUpdateReleaseDocDeletion,
  }

  test('reports received message', async () => {
    nock(origin)
      .get('/api/v2/documents/search')
      .query({
        access_token: pluginOptions.accessToken,
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
    await sourceNodes(apiUpdateDocAdditionCtx, pluginOptions)

    const matcher = expect.stringMatching(/received/i)
    expect(gatsbyContext.reporter.info).toHaveBeenCalledWith(matcher)
  })

  test('doc addition creates/updates node', async () => {
    nock(origin)
      .get('/api/v2/documents/search')
      .query({
        access_token: pluginOptions.accessToken,
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
    await sourceNodes(apiUpdateDocAdditionCtx, pluginOptions)

    expect(gatsbyContext.actions.createNode).toHaveBeenCalledWith(
      expect.objectContaining({
        prismicId: webhooks.apiUpdateDocAddition.documents[0],
      }),
    )
  })

  test('doc deletion deletes node', async () => {
    nock(origin)
      .get('/api/v2/documents/search')
      .query({
        access_token: pluginOptions.accessToken,
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
    await sourceNodes(apiUpdateDocDeletionCtx, pluginOptions)

    expect(gatsbyContext.actions.deleteNode).toHaveBeenCalledWith(
      expect.objectContaining({ node: nodes[0] }),
    )
  })

  test('release doc addition creates/updates node if plugin options release ID matches', async () => {
    const options = { ...pluginOptions }
    options.releaseID =
      webhooks.apiUpdateReleaseDocAddition.releases.update?.[0]?.id

    nock(origin)
      .get('/api/v2/documents/search')
      .query({
        access_token: pluginOptions.accessToken,
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

    expect(gatsbyContext.actions.createNode).toHaveBeenCalledWith(
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
        access_token: pluginOptions.accessToken,
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
    await sourceNodes(apiUpdateReleaseDocAdditionCtx, pluginOptions)

    expect(gatsbyContext.actions.createNode).not.toHaveBeenCalled()
  })

  test('release doc deletion deletes node if plugin options release ID matches', async () => {
    const options = { ...pluginOptions }
    options.releaseID =
      webhooks.apiUpdateReleaseDocDeletion.releases.update?.[0]?.id

    nock(origin)
      .get('/api/v2/documents/search')
      .query({
        access_token: pluginOptions.accessToken,
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

    expect(gatsbyContext.actions.deleteNode).toHaveBeenCalledWith(
      expect.objectContaining({ node: nodes[0] }),
    )
  })

  test('release doc deletion does nothing if plugin options release ID does not match', async () => {
    nock(origin)
      .get('/api/v2/documents/search')
      .query({
        access_token: pluginOptions.accessToken,
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
    await sourceNodes(apiUpdateReleaseDocDeletionCtx, pluginOptions)

    expect(gatsbyContext.actions.deleteNode).not.toHaveBeenCalled()
  })
})
