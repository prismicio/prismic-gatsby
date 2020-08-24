import { validateSecret, isPrismicUrl, isPrismicWebhook } from '../src/webhook'
import { PluginOptions } from '../src/types'
import testTrigger from './__fixtures__/webhooks/test-trigger.json'

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
})