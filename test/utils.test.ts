import { buildSchemaTypeName } from '../src/utils'

describe('buildSchemaTypeName', () => {
  test('correctly formats an API ID to a GraphQL type name', () => {
    expect(buildSchemaTypeName('type', '')).toBe('PrismicType')
    expect(buildSchemaTypeName('type-1', '')).toBe('PrismicType1')
    expect(buildSchemaTypeName('type_1', '')).toBe('PrismicType1')
    expect(buildSchemaTypeName('type1', '')).toBe('PrismicType1')
  })
  test('correctly formats API ID with Prefix to a GraphQL type name', () => {
    expect(buildSchemaTypeName('type', 'myPrefix')).toBe('PrismicMyPrefixType')
    expect(buildSchemaTypeName('type-1', 'myPrefix')).toBe('PrismicMyPrefixType1')
    expect(buildSchemaTypeName('type_1', 'myPrefix')).toBe('PrismicMyPrefixType1')
    expect(buildSchemaTypeName('type1', 'myPrefix')).toBe('PrismicMyPrefixType1')
  })
})
