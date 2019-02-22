import createNodeHelpers from 'gatsby-node-helpers'

export const nodeHelpers = createNodeHelpers({ typePrefix: 'Prismic' })

export const { createNodeFactory, generateTypeName } = nodeHelpers
