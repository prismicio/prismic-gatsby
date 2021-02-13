import * as React from 'react'
import { graphql, PageProps } from 'gatsby'
import {
  usePrismicPreviewAccessToken,
  usePrismicPreviewContext,
} from 'gatsby-plugin-prismic-previews'

const repoName = process.env.GATSBY_PRISMIC_REPOSITORY_NAME as string

const HomePage = ({ data }: PageProps): JSX.Element => {
  const dataStr = JSON.stringify(data, null, 2)

  const [state] = usePrismicPreviewContext(repoName)
  const [token] = usePrismicPreviewAccessToken(repoName)

  console.log({ state, token })

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
