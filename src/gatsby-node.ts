import { GatsbyNode, SourceNodesArgs } from 'gatsby'

import { schemasToTypeDefs } from './schemasToTypeDefs'
import { msg } from './utils'
import { PluginOptions } from './types'

export const sourceNodes: GatsbyNode['sourceNodes'] = async (
  gatsbyContext: SourceNodesArgs,
  pluginOptions: PluginOptions,
) => {
  const { actions, reporter } = gatsbyContext
  const { createTypes } = actions

  const createTypesActivity = reporter.activityTimer(msg('create types'))
  // const fetchDocumentsActivity = reporter.activityTimer(msg('fetch documents'))
  // const createNodesActivity = reporter.activityTimer(msg('create nodes'))
  // const writeTypePathsActivity = reporter.activityTimer(
  //   msg('write out type paths'),
  // )

  /**
   * Create types derived from Prismic custom type schemas.
   */
  createTypesActivity.start()
  reporter.verbose(msg('starting to create types'))

  const typeDefs = schemasToTypeDefs(pluginOptions.schemas, gatsbyContext)
  createTypes(typeDefs)

  createTypesActivity.end()
}
