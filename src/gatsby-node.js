import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import fetchData from './fetch'
import {
  generateTypeDefsForCustomType,
  generateTypeDefForLinkType,
} from './generateTypeDefsForCustomType'
import { documentToNodes } from './documentToNodes'
import {
  normalizeImageField,
  normalizeLinkField,
  normalizeSlicesField,
  normalizeStructuredTextField,
} from './normalizers/node'
import standardTypes from './standardTypes.graphql'

export const sourceNodes = async (gatsbyContext, pluginOptions) => {
  const {
    schema,
    actions: { createNode, createTypes },
    createNodeId,
    createContentDigest,
  } = gatsbyContext

  // Set default plugin options.
  pluginOptions = {
    linkResolver: RA.noop,
    htmlSerializer: RA.noop,
    fetchLinks: [],
    schemas: {},
    lang: '*',
    shouldNormalizeImage: R.always(true),
    ...pluginOptions,
  }

  const {
    repositoryName,
    accessToken,
    fetchLinks,
    lang,
    schemas,
  } = pluginOptions

  const typeVals = R.compose(
    R.values,
    R.mapObjIndexed((json, id) =>
      generateTypeDefsForCustomType(id, json, {
        gatsbyContext,
        pluginOptions,
      }),
    ),
  )(schemas)

  const typeDefs = R.compose(
    R.flatten,
    R.map(R.prop('typeDefs')),
  )(typeVals)

  const typePaths = R.compose(
    R.flatten,
    R.map(R.prop('typePaths')),
  )(typeVals)

  const linkTypeDef = generateTypeDefForLinkType(typeDefs, schema)

  createTypes(standardTypes)
  createTypes(linkTypeDef)
  createTypes(typeDefs)

  const { documents } = await fetchData({
    repositoryName,
    accessToken,
    fetchLinks,
    lang,
  })

  await R.compose(
    RA.allP,
    R.map(doc =>
      documentToNodes(doc, {
        typePaths,
        gatsbyContext,
        createNode,
        createNodeId,
        createContentDigest,
        pluginOptions,
        normalizeImageField,
        normalizeLinkField,
        normalizeSlicesField,
        normalizeStructuredTextField,
      }),
    ),
  )(documents)
}
