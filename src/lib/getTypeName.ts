import * as gatsby from 'gatsby'

/**
 * Returns the name of a GraphQL object type created by `graphql-compose`.
 *
 * @param type GraphQL object type created by `graphql-compose`.
 *
 * @return Name of the type.
 */
export const getTypeName = (type: gatsby.GatsbyGraphQLType): string =>
  type.config.name
