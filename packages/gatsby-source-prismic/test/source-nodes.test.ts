import nock from 'nock'

import { sourceNodes } from '../src/source-nodes'
import { gatsbyContext, nodes } from './__fixtures__/gatsbyContext'
import { pluginOptions } from './__fixtures__/pluginOptions'
import mockDocument from './__fixtures__/document.json'

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

test('creates nodes', async () => {
  nock(origin)
    .get('/api/v2/documents/search')
    .query({
      access_token: pluginOptions.accessToken,
      ref: 'master',
      lang: '*',
      page: 1,
      pageSize: 100,
    })
    .reply(200, {
      total_pages: 1,
      results: nodes.map((node) => ({ ...mockDocument, id: node.prismicId })),
    })

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  nodes.forEach((node) =>
    expect(gatsbyContext.actions.createNode).toHaveBeenCalledWith(
      expect.objectContaining({ prismicId: node.prismicId }),
    ),
  )
})

test('uses apiEndpoint plugin option if provided', async () => {
  const options = { ...pluginOptions }
  options.apiEndpoint = 'https://example.com'

  nock(options.apiEndpoint)
    .get('/')
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

  nock(options.apiEndpoint)
    .get('/documents/search')
    .query({
      access_token: pluginOptions.accessToken,
      ref: 'master',
      lang: '*',
      page: 1,
      pageSize: 100,
    })
    .reply(200, {
      total_pages: 1,
      results: nodes.map((node) => ({ ...mockDocument, id: node.prismicId })),
    })

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, options)

  // We're expecting this to *not* throw.
})
