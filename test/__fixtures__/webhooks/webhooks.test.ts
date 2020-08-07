import { validateSecret } from '../../../src/webhook'

describe("validadteSecret", () => {
  it("should return true when secret is not configured on both sides", () => {
    expect(validateSecret(undefined, null)).toBe(true)
  })

  it("should return false if secret is configured but not in the webhook", () => {
    expect(validateSecret("foo", null)).toBe(false)
  })

  it("should return false if secret iss configured in the webhook but not in gatsby", () => {
    expect(validateSecret("", "foo")).toBe(false)
  })

  it("should return fales if secretss do not match", () => {
    expect(validateSecret("foo", "bar")).toBe(false)
  })

  it("should return true if both secrets match", () => {
    expect(validateSecret("foo", "foo")).toBe(true)
  })
})
