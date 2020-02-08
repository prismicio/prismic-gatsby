import { SourceNodesArgs, Reporter } from 'gatsby'
import Prismic from 'prismic-javascript'
import PrismicResolvedApi, {
  QueryOptions,
} from 'prismic-javascript/d.ts/ResolvedApi'
import { Document as PrismicDocument } from 'prismic-javascript/d.ts/documents'

import { msg } from './utils'
import { PluginOptions } from './types'

export const createClient = async (
  repositoryName: string,
  accessToken?: string,
) =>
  await Prismic.getApi(`https://${repositoryName}.prismic.io/api/v2`, {
    accessToken,
  })

const pagedGet = async (
  client: PrismicResolvedApi,
  queryOptions: QueryOptions,
  page = 1,
  pageSize = 100,
  documents: PrismicDocument[] = [],
  reporter: Reporter,
): Promise<PrismicDocument[]> => {
  reporter.verbose(msg(`fetching documents page ${page}`))

  const response = await client.query([], { ...queryOptions, page, pageSize })

  for (const doc of response.results) documents.push(doc)

  if (page * pageSize < response.total_results_size)
    return await pagedGet(
      client,
      queryOptions,
      page + 1,
      pageSize,
      documents,
      reporter,
    )

  return documents
}

export const fetchAllDocuments = async (
  pluginOptions: PluginOptions,
  gatsbyContext: SourceNodesArgs,
) => {
  const { repositoryName, accessToken, fetchLinks, lang } = pluginOptions
  const { reporter } = gatsbyContext

  const client = await createClient(repositoryName, accessToken)

  const queryOptions: QueryOptions = {}
  if (fetchLinks) queryOptions.fetchLinks = fetchLinks
  if (lang) queryOptions.lang = lang

  return await pagedGet(
    client,
    queryOptions,
    undefined,
    undefined,
    undefined,
    reporter,
  )
}
