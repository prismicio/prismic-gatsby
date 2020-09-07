import * as gatsby from 'gatsby'

export const getTypeName = (type: gatsby.GatsbyGraphQLType): string =>
  type.config.name
