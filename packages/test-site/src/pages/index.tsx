import * as React from 'react'
import { graphql, PageProps } from 'gatsby'

const HomePage = ({ data }: PageProps): JSX.Element => {
  const dataStr = JSON.stringify(data, null, 2)

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
