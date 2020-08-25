import { SourceNodesArgs } from 'gatsby'
import mockSchema from './__fixtures__/schema.json'
import { validateSecret, isPrismicUrl, isPrismicWebhook, handleWebhook } from '../src/webhook'
import { PluginOptions, Schema } from '../src/types'
import { testTrigger , mainApiAddition, releaseAddition } from './__fixtures__/webhooks'
import { schemasToTypeDefs } from '../src/schemasToTypeDefs'


describe("validadteSecret", () => {
  it("should return true when secret is not configured on both sides", () => {
    const pluginOptions: PluginOptions = {
      repositoryName: 'repositoryName',
      plugins: [],
      schemas: {},
    }
    expect(validateSecret(pluginOptions, null)).toBe(true)
  })

  it("should return false if secret is configured but not in the webhook", () => {

    const pluginOptions: PluginOptions = {
      repositoryName: 'repositoryName',
      plugins: [],
      schemas: {},
      webhookSecret: "foo"
    }

    expect(validateSecret(pluginOptions, null)).toBe(false)
  })

  it("should return true if secret is configured in the webhook but not in gatsby", () => {
    // maybe change the logic here?
    const pluginOptions: PluginOptions = {
      repositoryName: 'repositoryName',
      plugins: [],
      schemas: {},
    }
    expect(validateSecret(pluginOptions, {secret: "foo"})).toBe(true)
  })

  it("should return fales if secretss do not match", () => {
    const pluginOptions: PluginOptions = {
      repositoryName: 'repositoryName',
      plugins: [],
      schemas: {},
      webhookSecret: "foo"
    }

    expect(validateSecret(pluginOptions, { secret: "bar" })).toBe(false)
  })

  it("should return true if both secrets match", () => {
    const pluginOptions: PluginOptions = {
      repositoryName: 'repositoryName',
      plugins: [],
      schemas: {},
      webhookSecret: "foo"
    }
    expect(validateSecret(pluginOptions, { secret: "foo" })).toBe(true)
  })
})

describe('isPrismicUrl', () => {
  it("should match a prismic api end point", () => {
    const url = "https://test-1234.prismic.io/api";
    expect(isPrismicUrl(url)).toBe(true);
  })

  it("should match a wroom.io endpoint", () => {
    const url = "https://test-1234.wroom.io/api";
    expect(isPrismicUrl(url)).toBe(true);
  })

  it("should match a wroom.test endpoint", () => {
    const url = "http://test-1234.wroom.test/api";
    expect(isPrismicUrl(url)).toBe(true);
  })

  it("should not match other source", () => {
    const url = "https://qwery.example.io/api";
    expect(isPrismicUrl(url)).toBe(false)
  })
})

describe("isPrismicWebhook", () => {

  it("should return false if no webhook is provided", () => {
    expect(isPrismicWebhook(undefined)).toBe(false)
  })

  it("should return false if it's a test webhook", () => {
    expect(isPrismicWebhook(testTrigger)).toBe(false)
  })

  it("should return false if webhook is not from prismic", () => {
    expect(isPrismicWebhook({
      apiUrl: "https://example.com",
    })).toBe(false)
  })

  it("should return true when receiving a webhook from prismic", () => {
    const result = isPrismicWebhook(mainApiAddition)
    expect(result).toBe(true)
  })
})

describe("handleWebhook", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    if (process.env.GATSBY_ENV) {
      delete process.env.GATSBY_ENV;
    }
  })

  it("should call createNode when passed a webhook for main api addition", async () => {
    const pluginOptions = {
      repositoryName: 'repositoryName',
      plugins: [],
      schemas: { page: mockSchema as Schema },
    }

    const gatsbyContext = createGatsbyContext();
    const { typePaths } = schemasToTypeDefs(
      pluginOptions.schemas,
      gatsbyContext,
    )
    await handleWebhook(pluginOptions, gatsbyContext, typePaths, mainApiAddition)

    expect(gatsbyContext.actions.createNode).toBeCalled()
  })

  it("should not call createNode when passed a webhook for a release addition and the the releaseID is unconfigured", async () => {

    process.env.GATSBY_ENV = 'development';

    const pluginOptions = {
      repositoryName: 'repositoryName',
      plugins: [],
      schemas: { page: mockSchema as Schema },
    }

    const gatsbyContext = createGatsbyContext();
    const { typePaths } = schemasToTypeDefs(
      pluginOptions.schemas,
      gatsbyContext,
    )
    await handleWebhook(pluginOptions, gatsbyContext, typePaths, releaseAddition)

    expect(gatsbyContext.actions.createNode).not.toBeCalled()
  })

  it("should not call createNode when passed a webhook for a release addition and the releaseID does not match the configured id", async () => {

    process.env.GATSBY_ENV = 'development';

    const pluginOptions: PluginOptions = {
      repositoryName: 'repositoryName',
      plugins: [],
      schemas: { page: mockSchema as Schema },
      releaseID: "qwertyuiop"
    }

    const gatsbyContext = createGatsbyContext();
    const { typePaths } = schemasToTypeDefs(
      pluginOptions.schemas,
      gatsbyContext,
    )
    await handleWebhook(pluginOptions, gatsbyContext, typePaths, releaseAddition)

    expect(gatsbyContext.actions.createNode).not.toBeCalled()
  })

  it("should call createNode when passed a webhook for a release addition and the releaseID match", async () => {

    process.env.GATSBY_ENV = "development";

    const pluginOptions: PluginOptions = {
      repositoryName: 'repositoryName',
      plugins: [],
      schemas: { page: mockSchema as Schema },
      releaseID: "XyfxIPl3p7YAQ7Mg"
    }

    const gatsbyContext = createGatsbyContext();
    const { typePaths } = schemasToTypeDefs(
      pluginOptions.schemas,
      gatsbyContext,
    )
    await handleWebhook(pluginOptions, gatsbyContext, typePaths, releaseAddition)

    expect(gatsbyContext.actions.createNode).toBeCalled()
  })

  it("should not call createNode when passed a webhook for a release addition and GATSBY_ENV is not 'development", async () => {
    
    const pluginOptions: PluginOptions = {
      repositoryName: 'repositoryName',
      plugins: [],
      schemas: { page: mockSchema as Schema },
      releaseID: "XyfxIPl3p7YAQ7Mg"
    }

    const gatsbyContext = createGatsbyContext();
    const { typePaths } = schemasToTypeDefs(
      pluginOptions.schemas,
      gatsbyContext,
    )
    await handleWebhook(pluginOptions, gatsbyContext, typePaths, releaseAddition)

    expect(gatsbyContext.actions.createNode).not.toBeCalled()
  })
})


function createGatsbyContext() {
  const PROGRAM_DIRECTORY_PATH = '/__PROGRAM_DIRECTORY__/';
  const mockGatsbyContext: SourceNodesArgs = {
    // @ts-expect-error - partial implementation
    actions: {
      createTypes: jest.fn(),
      createNode: jest.fn(),
    },
    // @ts-expect-error - partial implementation
    store: {
      getState: jest
        .fn()
        .mockReturnValue({ program: { directory: PROGRAM_DIRECTORY_PATH } }),
    },
    // @ts-expect-error - partial implementation
    reporter: {
      activityTimer: jest
        .fn()
        .mockReturnValue({ start: jest.fn(), end: jest.fn() }),
      error: jest.fn(),
      panic: jest.fn<never, any>((msg: string | Error, err?: Error) => {
        throw err ?? msg
      }),
      verbose: jest.fn(),
      info: jest.fn()
    },
    // @ts-expect-error - partial implementation
    schema: {
      buildObjectType: jest
        .fn()
        .mockImplementation((config) => ({ kind: 'OBJECT', config })),
      buildUnionType: jest.fn().mockImplementation((config) => ({
        kind: 'UNION',
        config,
      })),
    },
    createNodeId: jest.fn().mockReturnValue('createNodeId'),
    createContentDigest: jest.fn().mockReturnValue('createContentDigest'),
    // @ts-expect-error - partial implementation
    cache: {
      get: jest.fn(),
    },
  }

  return mockGatsbyContext
}