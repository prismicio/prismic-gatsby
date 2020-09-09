import { toPrismicUrl } from '../src/api'

describe("toPrismicUrl", () => {
  it("should return a prismic url from a repository name", () => {
    const result = toPrismicUrl("qwerty")
    expect(result).toBe("https://qwerty.prismic.io/api/v2")
  })

  it("should return a prismic api endpoint from a parismic domain", () => {
    expect(toPrismicUrl("https://qwerty.prismic.io")).toBe("https://qwerty.prismic.io/api/v2")
    expect(toPrismicUrl("https://qwerty.prismic.io/api/v2")).toBe("https://qwerty.prismic.io/api/v2")
    expect(toPrismicUrl("https://qwerty.wroom.io")).toBe("https://qwerty.wroom.io/api/v2")
    expect(toPrismicUrl("https://qwerty.wroom.test")).toBe("https://qwerty.wroom.test/api/v2")
  })
})