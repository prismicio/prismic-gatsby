import * as gatsby from 'gatsby'

export const isGatsbyGraphQLType = (
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  value: any,
): value is gatsby.GatsbyGraphQLType => 'type' in value && 'config' in value
