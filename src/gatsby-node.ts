import fs from 'fs'
import path from 'path'
import md5 from 'md5'

import { validatePluginOptions } from './validateOptions'
import { schemasToTypeDefs } from './schemasToTypeDefs'
import { fetchAllDocuments } from './api'
import { documentsToNodes } from './documentsToNodes'
import { createEnvironment } from './environment.node'
import { types, buildPrismicImageTypes } from './gqlTypes'
import { msg } from './utils'

import {
  GatsbyNode,
  SourceNodesArgs,
  GatsbyGraphQLType,
  CreateSchemaCustomizationArgs,
} from 'gatsby'
import { PluginOptions, TypePath, PrismicWebhook } from './types'
import { isPrismicWebhook, validateSecret, handleWebhook } from './webhook'

export const createSchemaCustomization: NonNullable<
  GatsbyNode['createSchemaCustomization']
> = async (
  args: CreateSchemaCustomizationArgs,
  pluginOptions: PluginOptions,
) => {
  const { typeDefs } = schemasToTypeDefs(pluginOptions.schemas, args)

  createPrismicTypes(pluginOptions, args, typeDefs)
}

const createPrismicTypes = (
  pluginOptions: PluginOptions,
  gatsbyContext: CreateSchemaCustomizationArgs,
  typeDefs: GatsbyGraphQLType[],
) => {
  /**
   * Create types derived from Prismic custom type schemas.
   */
  const { actions, reporter, schema, cache } = gatsbyContext
  const { createTypes } = actions

  const createTypesActivity = reporter.activityTimer(msg('create types'))

  createTypesActivity.start()
  reporter.verbose(msg('starting to create types'))

  const [imgixImageTypes, imageTypes] = buildPrismicImageTypes({
    schema,
    cache,
    defaultImgixParams: pluginOptions.imageImgixParams,
    defaultPlaceholderImgixParams: pluginOptions.imagePlaceholderImgixParams,
  })
  createTypes(typeDefs)
  createTypes(imgixImageTypes)
  createTypes(imageTypes)
  createTypes(types)

  createTypesActivity.end()
}

const buildAll = async (
  pluginOptions: PluginOptions,
  gatsbyContext: SourceNodesArgs,
  typePaths: TypePath[],
) => {
  const { reporter } = gatsbyContext

  const fetchDocumentsActivity = reporter.activityTimer(msg('fetch documents'))
  const createNodesActivity = reporter.activityTimer(msg('create nodes'))

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
}

const writeTypePaths = (
  pluginOptions: PluginOptions,
  gatsbyContext: SourceNodesArgs,
  typePaths: TypePath[],
  program: any,
) => {
  /**
   * Write type paths to public for use in Prismic previews.
   */
  const { reporter } = gatsbyContext

  const writeTypePathsActivity = reporter.activityTimer(
    msg('write out type paths'),
  )

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
  fs.writeFileSync(typePathsFilename, JSON.stringify(typePaths))

  writeTypePathsActivity.end()
}

export const sourceNodes: NonNullable<GatsbyNode['sourceNodes']> = async (
  gatsbyContext: SourceNodesArgs,
  pluginOptions: PluginOptions,
) => {
  const {
    reporter,
    store,
    webhookBody,
    getNodes,
    actions: { touchNode },
  } = gatsbyContext
  const { program } = store.getState()

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

  const { typePaths } = schemasToTypeDefs(
    pluginOptions.schemas,
    (gatsbyContext as unknown) as CreateSchemaCustomizationArgs,
  )

  if (!webhookBody || JSON.stringify(webhookBody) === '{}') {
    /** Initial build or rebuild everything */
    await buildAll(pluginOptions, gatsbyContext, typePaths)
    writeTypePaths(pluginOptions, gatsbyContext, typePaths, program)
  } else if (
    isPrismicWebhook(webhookBody) &&
    validateSecret(pluginOptions, webhookBody)
  ) {
    /** Respond to the webhook here */

    // touch nodes to prevent garbage collection
    getNodes().forEach((node) => touchNode({ nodeId: node.id }))

    const prismicWebhook = webhookBody as PrismicWebhook
    await handleWebhook(pluginOptions, gatsbyContext, typePaths, prismicWebhook)
  } else {
    /**
     * Webhook destined for another plugin,
     * touch nodes to prevent garbage collection
     */
    getNodes().forEach((node) => touchNode({ nodeId: node.id }))
  }
}

export const onPreExtractQueries: NonNullable<
  GatsbyNode['onPreExtractQueries']
> = (gatsbyContext) => {
  const { store } = gatsbyContext
  const { program } = store.getState()

  // Add fragments for GatsbyPrismicImage to .cache/fragments.
  fs.copyFileSync(
    path.resolve(__dirname, '../fragments.js'),
    path.resolve(
      program.directory,
      '.cache/fragments/gatsby-source-prismic-fragments.js',
    ),
  )
}
