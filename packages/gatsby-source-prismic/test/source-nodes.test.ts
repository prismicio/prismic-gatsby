import Prismic from 'prismic-javascript'

import { sourceNodes } from '../src/source-nodes'
import { gatsbyContext, nodes } from './__fixtures__/gatsbyContext'
import { pluginOptions } from './__fixtures__/pluginOptions'

beforeEach(() => {
  jest.clearAllMocks()
})

test('creates nodes', async () => {
  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  nodes.forEach((node) =>
    expect(gatsbyContext.actions.createNode).toHaveBeenCalledWith(
      expect.objectContaining({ prismicId: node.prismicId }),
    ),
  )
})

test('uses default API endpoint with repository name', async () => {
  const spy = jest.spyOn(Prismic, 'getApi')

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  expect(
    spy,
  ).toHaveBeenCalledWith(
    `https://${pluginOptions.repositoryName}.prismic.io/api/v2`,
    { accessToken: pluginOptions.accessToken },
  )
})

test('uses apiEndpoint plugin option if provided', async () => {
  const options = { ...pluginOptions }
  options.apiEndpoint = 'api-endpoint'

  const spy = jest.spyOn(Prismic, 'getApi')

  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, options)

  expect(spy).toHaveBeenCalledWith(options.apiEndpoint, {
    accessToken: pluginOptions.accessToken,
  })
})
