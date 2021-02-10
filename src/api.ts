import { getApi } from 'prismic-javascript'

import { msg, chunk } from './utils'
import { API_PAGE_SIZE } from './constants'

import { SourceNodesArgs, Reporter } from 'gatsby'
import PrismicResolvedApi, {
  QueryOptions,
} from 'prismic-javascript/d.ts/ResolvedApi'
import { Document as PrismicDocument } from 'prismic-javascript/d.ts/documents'
import { PluginOptions, Schema, Schemas } from './types'
import ApiSearchResponse from 'prismic-javascript/d.ts/ApiSearchResponse'

import {get} from 'https'

function parsePrismicUrl(maybeUrl: string): null | Array<string> {
  const urlRegex = /^https?:\/\/([^.]+)\.(wroom\.(?:test|io)|prismic\.io)/
  return maybeUrl.match(urlRegex)
}

export function toPrismicUrl(nameOrUrl: string) {
  
  const addr = parsePrismicUrl(nameOrUrl)

  return addr ? addr[0] + '/api/v2' : `https://${nameOrUrl}.prismic.io/api/v2`
}

export const createClient = async (
  repositoryName: string,
  accessToken?: string,
) => {
  const url = toPrismicUrl(repositoryName)
  return await getApi(url, { accessToken })
}

const pagedGet = async (
  client: PrismicResolvedApi,
  queryOptions: QueryOptions,
  page: number,
  pageSize: number,
  documents: PrismicDocument[],
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
  const {
    repositoryName,
    releaseID,
    accessToken,
    fetchLinks,
    lang,
  } = pluginOptions
  const { reporter } = gatsbyContext

  const client = await createClient(repositoryName, accessToken)

  const queryOptions: QueryOptions = {}
  if (releaseID) {
    const ref = client.refs.find((r) => r.id === releaseID)
    if (ref) {
      queryOptions.ref = ref.ref
    } else {
      reporter.warn(
        msg(
          `A release with ID "${releaseID}" was not found. Defaulting to the master ref instead.`,
        ),
      )
    }
  }
  if (fetchLinks) queryOptions.fetchLinks = fetchLinks
  if (lang) queryOptions.lang = lang

  return await pagedGet(client, queryOptions, 1, API_PAGE_SIZE, [], reporter)
}

export async function fetchDocumentsByIds(
  pluginOptions: PluginOptions,
  gatsbyContext: SourceNodesArgs,
  documents: string[],
): Promise<PrismicDocument[]> {
  const {
    repositoryName,
    releaseID,
    accessToken,
    fetchLinks,
    lang,
  } = pluginOptions

  const { reporter } = gatsbyContext

  const client = await createClient(repositoryName, accessToken)

  const queryOptions: QueryOptions = {}

  if (releaseID) {
    const ref = client.refs.find((r) => r.id === releaseID)
    if (ref) {
      queryOptions.ref = ref.ref
    } else {
      reporter.warn(
        msg(
          `A release with ID "${releaseID}" was not found. Defaulting to the master ref instead.`,
        ),
      )
    }
  }

  if (fetchLinks) queryOptions.fetchLinks = fetchLinks

  if (lang) queryOptions.lang = lang

  const chunks = chunk(documents, 100).map((docs) =>
    client.getByIDs(docs, queryOptions),
  )

  const responses: ApiSearchResponse[] = await Promise.all(chunks)

  return responses.flatMap((doc) => doc.results)
}

function parseJson<T>(str: string): Promise<T> {
  try {
    const data = JSON.parse(str) as T
    return Promise.resolve(data)
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getCustomTypes = async (
  pluginOptions: PluginOptions,
): Promise<Schemas> => {

  const [
    ,
    repoName = pluginOptions.repositoryName,
    domain = 'prismic.io',
  ] = parsePrismicUrl(pluginOptions.repositoryName) || []

  const addr = `https://customtypes.${domain}/customtypes?static=true`



  return new Promise<Schemas>((resolve, reject) => {
    const req = get(addr, {
      headers: {
        repository: repoName,
        Authorization: `Bearer ${pluginOptions.customTypeToken}`
      }
    }, (res) => {
      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error('Failed to get custom-types, status code: ' + res.statusCode));
      }

      let chunks = '';
      res.on('data', chunk => chunks += chunk)
      res.on('end', () => {
        const schemas = parseJson<Array<CustomType>>(chunks).then(customTypesToSchemas)
        resolve(schemas)
      })
    })
    req.on('error', (error) => reject(error))
  })

}

function customTypesToSchemas(customTypes: Array<CustomType>): Schemas {
  return customTypes.reduce<Schemas>((acc, customType) => {
    const {id, json} = customType
    return {...acc, [id]: json}
  }, {})
}

interface CustomType {
  id: string,
  label: string,
  repeatable: boolean,
  json: Schema,
  hash: string,
  status: boolean,
}
