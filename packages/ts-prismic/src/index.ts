import { ValueOf, IterableElement } from 'type-fest'

/**
 * Parameters for the Prismic REST API V2.
 *
 * @see https://prismic.io/docs/technologies/introduction-to-the-content-query-api
 */
interface Params {
  /**
   * The secure token for accessing the API (only needed if your repository is set to private).
   *
   * @see https://user-guides.prismic.io/en/articles/1036153-generating-an-access-token
   */
  accessToken?: string

  /**
   * The `pageSize` parameter defines the maximum number of documents that the API will return for your query.
   *
   * @see https://prismic.io/docs/technologies/search-parameters-reference-rest-api#pagesize
   */
  pageSize?: number

  /**
   * The `page` parameter defines the pagination for the result of your query.
   *
   * @see https://prismic.io/docs/technologies/search-parameters-reference-rest-api#page
   */
  page?: number

  /**
   * The `after` parameter can be used along with the orderings option. It will remove all the documents except for those after the specified document in the list.
   *
   * @see https://prismic.io/docs/technologies/search-parameters-reference-rest-api#after
   */
  after?: string

  /**
   * The `fetch` parameter is used to make queries faster by only retrieving the specified field(s).
   *
   * @see https://prismic.io/docs/technologies/search-parameters-reference-rest-api#fetch
   */
  fetch?: string | string[]

  /**
   * The `fetchLinks` parameter allows you to retrieve a specific content field from a linked document and add it to the document response object.
   *
   * @see https://prismic.io/docs/technologies/search-parameters-reference-rest-api#fetchlinks
   */
  fetchLinks?: string | string[]

  /**
   * The `graphQuery` parameter allows you to specify which fields to retrieve and what content to retrieve from Linked Documents / Content Relationships.
   *
   * @see https://prismic.io/docs/technologies/graphquery-rest-api
   */
  graphQuery?: string

  /**
   * The `lang` option defines the language code for the results of your query.
   *
   * @see https://prismic.io/docs/technologies/search-parameters-reference-rest-api#lang
   */
  lang?: string

  /**
   * The `orderings` parameter orders the results by the specified field(s). You can specify as many fields as you want.
   *
   * @see https://prismic.io/docs/technologies/search-parameters-reference-rest-api#orderings
   */
  orderings?: string | string[]

  /**
   * The `orderingsDirection` parameter determines if the `orderings` parameter should sort documents in ascending or descending order.
   *
   * @see https://prismic.io/docs/technologies/search-parameters-reference-rest-api#orderings
   */
  orderingsDirection?: 'asc' | 'desc'
}

/**
 * Parameters in this map have been renamed from the official Prismic REST API
 * V2 specification for better developer ergonomics.
 *
 * These parameters are renamed to their mapped value.
 */
const RENAMED_PARAMS = {
  accessToken: 'access_token',
} as const

/**
 * Parameters in this list are not actual Prismic REST API V2 parameters. They
 * are specific to this plugin for better developer ergonomics.
 *
 * These parameters are *not* included in URL builder products.
 */
const ARTIFICIAL_PARAMS = ['orderingsDirection'] as const

/**
 * A valid parameter name for the Prismic REST API V2.
 */
type ValidParamName =
  | Exclude<
      keyof Params,
      keyof typeof RENAMED_PARAMS | IterableElement<typeof ARTIFICIAL_PARAMS>
    >
  | ValueOf<typeof RENAMED_PARAMS>

/**
 * Get a repository's default Prismic REST API V2 endpoint.
 *
 * @param repositoryName Name of the repository.
 *
 * @returns The repository's default Prismic REST API V2 endpoint
 */
export const defaultAPIV2Endpoint = (repositoryName: string): string =>
  `https://${repositoryName}.cdn.prismic.io/api/v2`

/**
 * Build a Prismic REST API V2 URL to request metadata about a repository. Meta
 * information about the repository includes data such as refs, languages, and
 * types.
 *
 * Type the JSON response with `APIResponse`.
 *
 * @param endpoint Endpoint to the repository's REST API.
 * @param accessToken Access token for the repository.
 *
 * @returns URL that can be used to request meta information about the repository.
 */
export const buildRepositoryURL = (
  endpoint: string,
  accessToken?: string,
): string => {
  const url = new URL(endpoint)

  if (accessToken) {
    url.searchParams.set('access_token', accessToken)
  }

  return url.toString()
}

/**
 * Build a Prismic REST API V2 URL to request documents from a repository. The
 * paginated response for this URL includes documents matching the parameters.
 *
 * A ref is required to make a request. Use the result of `buildAPIURL` to
 * retrieve a list of available refs.
 *
 * Type the JSON response with `SearchResponse`.
 *
 * @see https://prismic.io/docs/technologies/introduction-to-the-content-query-api#prismic-api-ref
 * @see https://prismic.io/docs/technologies/query-predicates-reference-rest-api
 *
 * @param endpoint Endpoint to the repository's REST API.
 * @param ref Ref for the request.
 * @param predicates List of predicates
 * @param params Parameters for the request.
 *
 * @returns URL that can be used to request documents from the repository.
 */
export const buildSearchURL = (
  endpoint: string,
  ref: string,
  predicates?: string[] | null,
  params: Params = {},
): string => {
  const url = new URL(`${endpoint}/documents/search`)

  url.searchParams.set('ref', ref)

  if (predicates) {
    for (const predicate of predicates) {
      url.searchParams.set('q', `[${predicate}]`)
    }
  }

  for (const k in params) {
    if (
      ARTIFICIAL_PARAMS.includes(k as IterableElement<typeof ARTIFICIAL_PARAMS>)
    ) {
      continue
    }

    const name = (k in RENAMED_PARAMS
      ? RENAMED_PARAMS[k as keyof typeof RENAMED_PARAMS]
      : k) as ValidParamName

    let value = params[k as keyof typeof params]

    switch (name) {
      case 'orderings': {
        value = Array.isArray(value) ? value.join(',') : value

        if (params.orderingsDirection === 'desc') {
          value = `${value} desc`
        }

        value = `[${value}]`

        break
      }
    }

    if (value != null) {
      url.searchParams.set(
        name,
        Array.isArray(value) ? value.join(',') : value.toString(),
      )
    }
  }

  return url.toString()
}
