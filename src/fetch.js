import Prismic from 'prismic-javascript'

export default async ({
  repositoryName,
  accessToken,
  releaseId,
  fetchLinks,
  lang,
}) => {
  console.time(`Fetch Prismic data`)
  console.log(`Starting to fetch data from Prismic`)

  const apiEndpoint = `https://${repositoryName}.prismic.io/api/v2`
  const client = await Prismic.api(apiEndpoint, { accessToken })

  let ref
  if (releaseId) {
    ref = client.refs.find(ref => ref.id === releaseId).ref
  }

  // Query all documents from client
  const documents = await pagedGet(client, [], { fetchLinks }, lang, ref)

  console.timeEnd(`Fetch Prismic data`)

  return {
    documents,
  }
}

async function pagedGet(
  client,
  query = [],
  options = {},
  lang = '*',
  ref = null,
  page = 1,
  pageSize = 100,
  aggregatedResponse = null,
) {
  const mergedOptions = { lang, ...options }

  const response = await client.query(query, {
    ...mergedOptions,
    page,
    pageSize,
    ref,
  })

  if (!aggregatedResponse) {
    aggregatedResponse = response.results
  } else {
    aggregatedResponse = aggregatedResponse.concat(response.results)
  }

  if (page * pageSize < response.total_results_size) {
    return pagedGet(
      client,
      query,
      options,
      lang,
      ref,
      page + 1,
      pageSize,
      aggregatedResponse,
    )
  }

  return aggregatedResponse
}
