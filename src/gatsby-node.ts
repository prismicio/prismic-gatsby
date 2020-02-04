import { GatsbyNode, SourceNodesArgs } from 'gatsby'

import { schemasToTypeDefs } from './schemasToTypeDefs'
import { fetchAllDocuments } from './fetchAllDocuments'
import { documentsToNodes } from './documentsToNodes'
import { createEnvironment } from './nodeEnvironment'
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
  // const writeTypePathsActivity = reporter.activityTimer(
  //   msg('write out type paths'),
  // )

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
  reporter.verbose(msg(`starting to fetch documents`))

  const documents = await fetchAllDocuments(pluginOptions, gatsbyContext)

  reporter.verbose(msg(`fetched ${documents.length} documents`))
  fetchDocumentsActivity.end()

  /**
   * Create nodes for all documents.
   */
  createNodesActivity.start()
  reporter.verbose(msg('starting to create nodes'))

  const env = createEnvironment(pluginOptions, gatsbyContext, typePaths)
  documentsToNodes(documents, env)

  createNodesActivity.end()
}
