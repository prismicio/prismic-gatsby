import fs from 'fs'
import path from 'path'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import md5 from 'md5'

import { validatePluginOptions } from './validatePluginOptions'
import { fetchAllDocuments } from './fetchAllDocuments'
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
import { name as pkgName } from '../package.json'

const msg = s => `${pkgName} - ${s}`

export const sourceNodes = async (gatsbyContext, rawPluginOptions) => {
  const {
    schema,
    actions: { createTypes },
    reporter,
  } = gatsbyContext

  const createTypesActivity = reporter.activityTimer(msg('create types'))
  const fetchDocumentsActivity = reporter.activityTimer(msg('fetch documents'))
  const createNodesActivity = reporter.activityTimer(msg('create nodes'))
  const writeTypePathsActivity = reporter.activityTimer(
    msg('write out type paths'),
  )

  /***
   * Validate plugin options. Set default options where necessary. If any
   * plugin options are invalid, stop immediately.
   */

  const {
    error: validationError,
    value: pluginOptions,
  } = validatePluginOptions(rawPluginOptions)

  if (validationError) {
    reporter.error(`${pkg.name} - invalid plugin options`)
    reporter.panic(`${pkg.name} - ${validationError}`)
  }

  /***
   * Create types derived from Prismic custom type schemas.
   */

  createTypesActivity.start()

  const typeVals = R.compose(
    R.values,
    R.mapObjIndexed((json, id) =>
      generateTypeDefsForCustomType(id, json, {
        gatsbyContext,
        pluginOptions,
      }),
    ),
  )(pluginOptions.schemas)

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

  createTypesActivity.end()

  /***
   * Fetch documents from Prismic.
   */

  fetchDocumentsActivity.start()

  const documents = await fetchAllDocuments(gatsbyContext, pluginOptions)

  fetchDocumentsActivity.end()

  /***
   * Create nodes for all documents
   */

  createNodesActivity.start()

  await R.compose(
    RA.allP,
    R.map(doc =>
      documentToNodes(doc, {
        createNode: gatsbyContext.actions.createNode,
        createNodeId: gatsbyContext.createNodeId,
        createContentDigest: gatsbyContext.createContentDigest,
        normalizeImageField,
        normalizeLinkField,
        normalizeSlicesField,
        normalizeStructuredTextField,
        typePaths,
        gatsbyContext,
        pluginOptions,
      }),
    ),
  )(documents)

  createNodesActivity.end()

  /***
   * Write type paths to public for use in Prismic previews.
   */

  writeTypePathsActivity.start()

  const typePathsString = JSON.stringify(typePaths)
  const typePathsDigest = md5(typePathsString)
  const typePathsFilename = path.join(
    'public',
    pluginOptions.typePathsFilenamePrefix + typePathsDigest + '.json',
  )

  fs.writeFileSync(typePathsFilename, typePathsString)

  writeTypePathsActivity.end()
}
