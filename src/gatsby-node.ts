import path from 'path'
import fsExtra from 'fs-extra'
import md5 from 'md5'
import { GatsbyNode, SourceNodesArgs, CreateResolversArgs } from 'gatsby'

import { schemasToTypeDefs } from './schemasToTypeDefs'
import { fetchAllDocuments } from './fetchAllDocuments'
import { documentsToNodes } from './documentsToNodes'
import { createEnvironment } from './environment.node'
import { resolvers as gatsbyImageResolvers } from './gatsbyImage'
import { msg } from './utils'
import { PluginOptions } from './types'

export const sourceNodes: GatsbyNode['sourceNodes'] = async (
  gatsbyContext: SourceNodesArgs,
  pluginOptions: PluginOptions,
) => {
  const { actions, reporter } = gatsbyContext
  const { createTypes } = actions

  const createTypesActivity = reporter.activityTimer(msg('create types'))
  const fetchDocumentsActivity = reporter.activityTimer(msg('fetch documents'))
  const createNodesActivity = reporter.activityTimer(msg('create nodes'))
  const writeTypePathsActivity = reporter.activityTimer(
    msg('write out type paths'),
  )

  /**
   * Create types derived from Prismic custom type schemas.
   */
  createTypesActivity.start()
  reporter.verbose(msg('starting to create types'))

  const { typeDefs, typePaths } = schemasToTypeDefs(
    pluginOptions.schemas,
    gatsbyContext,
  )
  createTypes(typeDefs)

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
  documentsToNodes(documents, env)

  createNodesActivity.end()

  /**
   * Write type paths to public for use in Prismic previews.
   */
  writeTypePathsActivity.start()
  reporter.verbose(msg('starting to write out type paths'))

  const schemasDigest = md5(JSON.stringify(pluginOptions.schemas))
  const typePathsFilename = path.resolve(
    'public',
    [pluginOptions.typePathsFilenamePrefix, schemasDigest, '.json']
      .filter(part => part !== undefined && part !== null)
      .join(''),
  )

  reporter.verbose(msg(`writing out type paths to : ${typePathsFilename}`))
  fsExtra.writeFileSync(typePathsFilename, JSON.stringify(typePaths))

  writeTypePathsActivity.end()
}

export const createResolvers: GatsbyNode['createResolvers'] = async (
  gatsbyContext: CreateResolversArgs,
  _pluginOptions: PluginOptions,
) => {
  const { createResolvers } = gatsbyContext
  createResolvers(gatsbyImageResolvers)
}

export const onPreExtractQueries: GatsbyNode['onPreExtractQueries'] = gatsbyContext => {
  const { store } = gatsbyContext

  const program = store.getState().program

  // Add fragments for GatsbyPrismicImage to .cache/fragments.
  fsExtra.copySync(
    path.join(__dirname, '../src/fragments.ts'),
    `${program.directory}/.cache/fragments/gatsby-source-prismic-fragments.js`,
  )
}
