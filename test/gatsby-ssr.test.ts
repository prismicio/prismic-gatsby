import { RenderBodyArgs } from 'gatsby'

import { onRenderBody } from '../src/gatsby-ssr'

import mockSchema from './__fixtures__/schema.json'

const pluginOptions = {
  repositoryName: 'repositoryName',
  plugins: [],
  schemas: { page: mockSchema },
}

describe('onRenderBody', () => {
  beforeEach(() => jest.clearAllMocks())

  // @ts-expect-error - partial implementation
  const mockGatsbyContext: RenderBodyArgs = {
    setPostBodyComponents: jest.fn(),
  }

  test('expect Prismic Toolbar script not to be included by default', async () => {
    await onRenderBody(mockGatsbyContext, pluginOptions)

    expect(mockGatsbyContext.setPostBodyComponents).not.toHaveBeenCalled()
  })

  test('expect Prismic Toolbar script to be included if `prismicToolbar` is set to `true`', async () => {
    await onRenderBody(mockGatsbyContext, {
      ...pluginOptions,
      prismicToolbar: true,
    })

    expect(mockGatsbyContext.setPostBodyComponents).toHaveBeenCalledTimes(1)

    expect(
      (mockGatsbyContext.setPostBodyComponents as jest.Mock).mock.calls[0][0][0]
        .props.src,
    ).toBe(
      `//static.cdn.prismic.io/prismic.js?repo=${pluginOptions.repositoryName}&new=true`,
    )
  })

  test('expect Prismic Toolbar script to use the legacy URL if the `legacy` option is provided', async () => {
    await onRenderBody(mockGatsbyContext, {
      ...pluginOptions,
      prismicToolbar: 'legacy',
    })

    expect(
      (mockGatsbyContext.setPostBodyComponents as jest.Mock).mock.calls[0][0][0]
        .props.src,
    ).toBe(
      `//static.cdn.prismic.io/prismic.js?repo=${pluginOptions.repositoryName}`,
    )
  })
})
