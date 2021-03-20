import test from 'ava'
import * as sinon from 'sinon'
import * as msw from 'msw'
import * as mswn from 'msw/node'
import * as prismic from 'ts-prismic'

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
import { nockRepositoryEndpoint } from './__testutils__/nockRepositoryEndpoint'
import { resolveAPIURL } from './__testutils__/resolveURL'

const server = mswn.setupServer()
test.before(() => server.listen({ onUnhandledRequest: 'error' }))
test.after(() => server.close())

test('reports received message', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const queryResponse = createPrismicAPIQueryResponse()
  const webhookBody = createWebhookAPIUpdateDocAddition(queryResponse.results)

  gatsbyContext.webhookBody = webhookBody

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
        req.url.searchParams.get('pageSize') === '100' &&
        req.url.searchParams.get('q') ===
          `[${prismic.predicate.in('document.id', webhookBody.documents)}]`
          ? res(ctx.json(queryResponse))
          : res(ctx.status(401)),
    ),
  )

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.reporter.info as sinon.SinonStub).calledWith(
      sinon.match(/received/i),
    ),
  )
})

test('doc addition creates/updates node', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const queryResponse = createPrismicAPIQueryResponse()
  const webhookBody = createWebhookAPIUpdateDocAddition(queryResponse.results)

  gatsbyContext.webhookBody = webhookBody

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
        req.url.searchParams.get('pageSize') === '100' &&
        req.url.searchParams.get('q') ===
          `[${prismic.predicate.in('document.id', webhookBody.documents)}]`
          ? res(ctx.json(queryResponse))
          : res(ctx.status(401)),
    ),
  )

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.true(
    webhookBody.documents.every((docId) =>
      (gatsbyContext.actions.createNode as sinon.SinonStub).calledWith(
        sinon.match.has('prismicId', docId),
      ),
    ),
  )
})

test('doc deletion deletes node', async (t) => {
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
    nodeHelpers.createNodeFactory(doc.type, { idIsGloballyUnique: true })(doc),
  )
  nodes.forEach((node) => gatsbyContext.actions.createNode?.(node))

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
        req.url.searchParams.get('pageSize') === '100' &&
        req.url.searchParams.get('q') ===
          `[${prismic.predicate.in('document.id', webhookBody.documents)}]`
          ? res(ctx.json(queryResponse))
          : res(ctx.status(401)),
    ),
  )

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.true(
    docs
      .slice(1)
      .every((doc) =>
        (gatsbyContext.actions.deleteNode as sinon.SinonStub).calledWith(
          sinon.match.hasNested('node.prismicId', doc.id),
        ),
      ),
  )
})

test('release doc addition creates/updates node if plugin options release ID matches', async (t) => {
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

  nockRepositoryEndpoint(server, pluginOptions)
  server.use(
    msw.rest.get(
      resolveAPIURL(pluginOptions.apiEndpoint, './documents/search'),
      (req, res, ctx) =>
        req.url.searchParams.get('access_token') ===
          pluginOptions.accessToken &&
        req.url.searchParams.get('ref') === webhookBodyReleaseUpdate.ref &&
        req.url.searchParams.get('lang') === '*' &&
        req.url.searchParams.get('page') === '1' &&
        req.url.searchParams.get('pageSize') === '100' &&
        req.url.searchParams.get('q') ===
          `[${prismic.predicate.in(
            'document.id',
            webhookBodyReleaseUpdate.documents,
          )}]`
          ? res(ctx.json(queryResponse))
          : res(ctx.status(401)),
    ),
  )

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.true(
    webhookBodyReleaseUpdate.documents.every((docId) =>
      (gatsbyContext.actions.createNode as sinon.SinonStub).calledWith(
        sinon.match.has('prismicId', docId),
      ),
    ),
  )
})

test('release doc addition does nothing if plugin options release ID does not match', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const queryResponse = createPrismicAPIQueryResponse([])
  const webhookBody = createWebhookAPIUpdateReleaseDocAddition(
    queryResponse.results,
  )

  gatsbyContext.webhookBody = webhookBody

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
        req.url.searchParams.get('pageSize') === '100' &&
        req.url.searchParams.get('q') ===
          `[${prismic.predicate.in('document.id', [])}]`
          ? res(ctx.json(queryResponse))
          : res(ctx.status(401)),
    ),
  )

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.true((gatsbyContext.actions.createNode as sinon.SinonStub).notCalled)
})

test('release doc deletion deletes node if plugin options release ID matches', async (t) => {
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
    nodeHelpers.createNodeFactory(doc.type, { idIsGloballyUnique: true })(doc),
  )
  nodes.forEach((node) => gatsbyContext.actions.createNode?.(node))

  nockRepositoryEndpoint(server, pluginOptions)
  server.use(
    msw.rest.get(
      resolveAPIURL(pluginOptions.apiEndpoint, './documents/search'),
      (req, res, ctx) =>
        req.url.searchParams.get('access_token') ===
          pluginOptions.accessToken &&
        req.url.searchParams.get('ref') === webhookBodyReleaseDeletion.ref &&
        req.url.searchParams.get('lang') === '*' &&
        req.url.searchParams.get('page') === '1' &&
        req.url.searchParams.get('pageSize') === '100' &&
        req.url.searchParams.get('q') ===
          `[${prismic.predicate.in(
            'document.id',
            webhookBodyReleaseDeletion.documents,
          )}]`
          ? res(ctx.json(queryResponse))
          : res(ctx.status(401)),
    ),
  )

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.true(
    docs
      .slice(1)
      .every((doc) =>
        (gatsbyContext.actions.deleteNode as sinon.SinonStub).calledWith(
          sinon.match.hasNested('node.prismicId', doc.id),
        ),
      ),
  )
})

test('release doc deletion does nothing if plugin options release ID does not match', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const queryResponse = createPrismicAPIQueryResponse([])
  const webhookBody = createWebhookAPIUpdateReleaseDocDeletion(
    queryResponse.results,
  )

  gatsbyContext.webhookBody = webhookBody

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
        req.url.searchParams.get('pageSize') === '100' &&
        req.url.searchParams.get('q') ===
          `[${prismic.predicate.in('document.id', [])}]`
          ? res(ctx.json(queryResponse))
          : res(ctx.status(401)),
    ),
  )

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  t.true((gatsbyContext.actions.deleteNode as sinon.SinonStub).notCalled)
})
