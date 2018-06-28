import Prismic from 'prismic-javascript'

export default async ({ repositoryName, accessToken, experimentBranchName }) => {
  console.log(`Starting to fetch data from Prismic`)

  const apiEndpoint = `https://${repositoryName}.prismic.io/api/v2`
  const client = await Prismic.api(apiEndpoint, { accessToken })
  let runningVariations = []
  const options = {}

  if (client.experiments.running && client.experiments.running.length) {
    runningVariations = Object
      .assign(...client.experiments.running.map(experiment => experiment.variations))
      .map(variation => variation.data)
  }
  if (experimentBranchName && runningVariations.length) {
    const matchedVariation = runningVariations.find((variation) => {
      return variation.label.toLowerCase().replace(' ', '-') === experimentBranchName
    })
    if (matchedVariation) {
      options.ref = matchedVariation.ref
      console.log(`Using "${matchedVariation.label}" Prismic experiment branch`)
    } else {
      console.log(`Falling back to no Prismic experiment branch`);
    }
  }

  console.time(`Fetch Prismic data`)

  // Query all documents from client
  const documents = await pagedGet(client, options)

  console.timeEnd(`Fetch Prismic data`)

  return {
    documents,
  }
}

async function pagedGet(
  client,
  options,
  query = [],
  page = 1,
  pageSize = 100,
  aggregatedResponse = null,
) {
  const mergedOptions = Object.assign(
    {
      lang: `*`,
    },
    options,
  )

  const response = await client.query(query, {
    ...mergedOptions,
    page,
    pageSize,
  })

  if (!aggregatedResponse) {
    aggregatedResponse = response.results
  } else {
    aggregatedResponse = aggregatedResponse.concat(response.results)
  }

  if (page * pageSize < response.total_results_size) {
    return pagedGet(
      client,
      options,
      query,
      page + 1,
      pageSize,
      aggregatedResponse,
    )
  }

  return aggregatedResponse
}
