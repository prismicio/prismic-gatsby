import createNodeHelpers from 'gatsby-node-helpers'

const { createNodeFactory } = createNodeHelpers({
  typePrefix: `Prismic`
})

const DOCUMENT_TYPE = `Document`

export const DocumentNode = createNodeFactory(DOCUMENT_TYPE)
