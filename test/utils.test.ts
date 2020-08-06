import { buildSchemaTypeName, isPrismicUrl } from '../src/utils'

describe('buildSchemaTypeName', () => {
  test('correctly formats an API ID to a GraphQL type name', () => {
    expect(buildSchemaTypeName('type')).toBe('PrismicType')
    expect(buildSchemaTypeName('type-1')).toBe('PrismicType1')
    expect(buildSchemaTypeName('type_1')).toBe('PrismicType1')
    expect(buildSchemaTypeName('type1')).toBe('PrismicType1')
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