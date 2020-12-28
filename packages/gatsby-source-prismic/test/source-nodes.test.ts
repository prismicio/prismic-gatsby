import { sourceNodes } from '../src/source-nodes'
import { gatsbyContext, pluginOptions, nodes } from './__fixtures__/gatsby'

const unknownCtx = {
  ...gatsbyContext,
  webhookBody: {
    foo: 'bar',
  },
}

const testTriggerCtx = {
  ...gatsbyContext,
  webhookBody: {
    type: 'test-trigger',
    domain: 'repositoryName',
    apiUrl: 'https://repositoryName.wroom.test/api',
    secret: pluginOptions.webhookSecret,
  },
}

// const apiUpdateCtx = {
//   ...gatsbyContext,
//   webhookBody: {
//     type: 'api-update',
//     domain: 'repositoryName',
//     apiUrl: 'https://repositoryName.wroom.test/api',
//     secret: pluginOptions.webhookSecret,
//   },
// }

beforeEach(() => {
  jest.clearAllMocks()
})

test('creates nodes', async () => {
  // @ts-expect-error - Partial gatsbyContext provided
  await sourceNodes(gatsbyContext, pluginOptions)

  expect(gatsbyContext.actions.createNode).toMatchSnapshot()
})

describe('webhook behavior', () => {
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
    delete ctx.webhookBody.secret

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

describe('webhook test-trigger', () => {
  test('reports success message', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await sourceNodes(testTriggerCtx, pluginOptions)

    const matcher = expect.stringMatching(/success/i)
    expect(gatsbyContext.reporter.info).toHaveBeenCalledWith(matcher)
  })
})

describe('webhook api-update', () => {
  // TODO
})
