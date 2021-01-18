import * as React from 'react'
import { graphql, PageProps } from 'gatsby'
import { usePrismicPreviewContext } from 'gatsby-plugin-prismic-previews-2'
import Prismic from 'prismic-javascript'

const HomePage = ({ data }: PageProps): JSX.Element => {
  const dataStr = JSON.stringify(data, null, 2)

  const [state] = usePrismicPreviewContext(
    process.env.GATSBY_PRISMIC_REPOSITORY_NAME as string,
  )

  console.log(state.repositoryName)

  React.useEffect(() => {
    const client = Prismic.client('https://gatsby-starter-ww.prismic.io/api/v2')

    const asyncEffect = async (): Promise<void> => {
      try {
        const api = await client.getApi()
        console.log(api)
      } catch (e) {
        if (e instanceof Error) {
          console.log(/401/.test(e.message))
        }
      }
    }

    asyncEffect()
  }, [])

  return (
    <pre style={{ backgroundColor: 'lightgray', padding: '2rem' }}>
      <code>{dataStr}</code>
    </pre>
  )
}

export default HomePage

export const query = graphql`
  {
    allPrismicPrefixPage {
      nodes {
        id
        data {
          title {
            text
          }
          body {
            ... on PrismicPrefixPageDataBodyImages {
              items {
                image {
                  fluid {
                    ...GatsbyImgixFluid
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
