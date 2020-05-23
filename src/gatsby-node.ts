import { writeFileSync, copyFileSync } from 'fs-extra'
import path from 'path'
import md5 from 'md5'

import { validatePluginOptions } from './validateOptions'
import { schemasToTypeDefs } from './schemasToTypeDefs'
import { fetchAllDocuments } from './api'
import { documentsToNodes } from './documentsToNodes'
import { createEnvironment } from './environment.node'
import { resolvers as gatsbyImageResolvers } from './gatsbyImage'
import { msg } from './utils'
import { types, buildPrismicImageTypes } from './gqlTypes'

import { GatsbyNode, SourceNodesArgs, CreateResolversArgs } from 'gatsby'
import { PluginOptions } from './types'

export const sourceNodes: GatsbyNode['sourceNodes'] = async (
  gatsbyContext: SourceNodesArgs,
  pluginOptions: PluginOptions,
) => {
  const { actions, reporter, store, schema, cache } = gatsbyContext
  const { createTypes } = actions
  const { program } = store.getState()

  const createTypesActivity = reporter.activityTimer(msg('create types'))
  const fetchDocumentsActivity = reporter.activityTimer(msg('fetch documents'))
  const createNodesActivity = reporter.activityTimer(msg('create nodes'))
  const writeTypePathsActivity = reporter.activityTimer(
    msg('write out type paths'),
  )

  /**
   * Validate plugin options. Set default options where necessary. If any
   * plugin options are invalid, stop immediately.
   */
  try {
    pluginOptions = validatePluginOptions(pluginOptions)
  } catch (error) {
    reporter.error(msg('invalid plugin options'))
    reporter.panic(error)
  }

  /**
   * Create types derived from Prismic custom type schemas.
   */
  createTypesActivity.start()
  reporter.verbose(msg('starting to create types'))

  const { typeDefs, typePaths } = schemasToTypeDefs(
    pluginOptions.schemas,
    gatsbyContext,
  )
  const imageTypes = buildPrismicImageTypes({ schema, cache })
  createTypes(typeDefs)
  createTypes(imageTypes)
  createTypes(types)

  createTypesActivity.end()

  /**
   * Fetch documents from Prismic.
   */
  fetchDocumentsActivity.start()
  reporter.verbose(msg('starting to fetch documents'))

  const documents = await fetchAllDocuments(pluginOptions, gatsbyContext)

  reporter.verbose(msg(`fetched ${documents.length} documents`))
  fetchDocumentsActivity.end()

  /**
   * Create nodes for all documents.
   */
  createNodesActivity.start()
  reporter.verbose(msg('starting to create nodes'))

  const env = createEnvironment(pluginOptions, gatsbyContext, typePaths)
  // TODO: Implement queue like `schemasToTypeDefs` and create nodes here.
  await documentsToNodes(documents, env)

  createNodesActivity.end()

  /**
   * Write type paths to public for use in Prismic previews.
   */
  writeTypePathsActivity.start()
  reporter.verbose(msg('starting to write out type paths'))

  const schemasDigest = md5(JSON.stringify(pluginOptions.schemas))
  const typePathsFilename = path.resolve(
    program.directory,
    'public',
    [pluginOptions.typePathsFilenamePrefix, schemasDigest, '.json']
      .filter((part) => part !== undefined && part !== null)
      .join(''),
  )

  reporter.verbose(msg(`writing out type paths to : ${typePathsFilename}`))
  writeFileSync(typePathsFilename, JSON.stringify(typePaths))

  writeTypePathsActivity.end()
}

export const createResolvers: GatsbyNode['createResolvers'] = async (
  gatsbyContext: CreateResolversArgs,
  _pluginOptions: PluginOptions,
) => {
  const { createResolvers } = gatsbyContext
  createResolvers(gatsbyImageResolvers)
}

export const onPreExtractQueries: GatsbyNode['onPreExtractQueries'] = (
  gatsbyContext,
) => {
  const { store } = gatsbyContext
  const { program } = store.getState()

  // Add fragments for GatsbyPrismicImage to .cache/fragments.
  copyFileSync(
    path.resolve(__dirname, '../fragments.js'),
    path.resolve(
      program.directory,
      '.cache/fragments/gatsby-source-prismic-fragments.js',
    ),
  )
}
