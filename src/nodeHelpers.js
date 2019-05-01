import createNodeHelpers from 'gatsby-node-helpers'

const TYPE_PREFIX = 'Prismic'

export const nodeHelpers = createNodeHelpers({ typePrefix: TYPE_PREFIX })
export const { createNodeFactory, generateTypeName } = nodeHelpers

// Internal helpers used for temporary node generation when schema hinting
export const internalNodeHelpers = createNodeHelpers({
  typePrefix: `Internal ${TYPE_PREFIX}`,
})
export const {
  generateTypeName: generateInternalTypeName,
} = internalNodeHelpers
