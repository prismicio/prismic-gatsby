import * as R from 'ramda'

import fetchData from './fetch'
import { normalizeFields } from './normalize'
import { nodeHelpers, createNodeFactory } from './nodeHelpers'
import {
  generateTypeDefsForCustomType,
  generateTypeDefsForLinkType,
  prismicTypeDefs,
} from './generateTypeDefsForCustomType'

export const sourceNodes = async (gatsbyContext, pluginOptions) => {
  const {
    schema,
    actions: { createNode, createTypes },
  } = gatsbyContext

  // Set default plugin options.
  pluginOptions = {
    linkResolver: () => {},
    htmlSerializer: () => {},
    fetchLinks: [],
    schemas: {},
    lang: '*',
    shouldNormalizeImage: () => true,
    ...pluginOptions,
  }

  const {
    repositoryName,
    accessToken,
    fetchLinks,
    lang,
    schemas,
  } = pluginOptions

  const typeDefs = R.pipe(
    R.mapObjIndexed((customTypeJson, customTypeId) =>
      generateTypeDefsForCustomType({
        customTypeId,
        customTypeJson,
        gatsbyContext,
        pluginOptions,
      }),
    ),
    R.values,
    R.flatten,
  )(schemas)
  const linkTypeDefs = generateTypeDefsForLinkType(typeDefs, schema)

  createTypes(prismicTypeDefs)
  createTypes(linkTypeDefs)
  createTypes(typeDefs)

  const { documents } = await fetchData({
    repositoryName,
    accessToken,
    fetchLinks,
    lang,
  })

  const promises = documents.map(async doc => {
    const Node = createNodeFactory(doc.type, async node => {
      node.dataString = JSON.stringify(node.data)
      node.data = await normalizeFields({
        value: node.data,
        node,
        gatsbyContext,
        pluginOptions,
        nodeHelpers,
      })

      return node
    })

    const node = await Node(doc)

    createNode(node)
  })

  await Promise.all(promises)

  return
}
