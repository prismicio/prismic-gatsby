import * as React from 'react'
import { graphql, PageProps, Link } from 'gatsby'
import {
  usePrismicPreviewAccessToken,
  usePrismicPreviewContext,
  withPrismicPreview,
  WithPrismicPreviewProps,
} from 'gatsby-plugin-prismic-previews'

import { linkResolver } from '../linkResolver'

const repoName = process.env.GATSBY_PRISMIC_REPOSITORY_NAME as string

const HomePage = ({
  data,
  ...rest
}: PageProps<Record<string, any>> &
  WithPrismicPreviewProps<Record<string, any>>): JSX.Element => {
  const dataStr = JSON.stringify(data, null, 2)

  const [state] = usePrismicPreviewContext()
  const [token] = usePrismicPreviewAccessToken(repoName)

  return (
    <div>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          {' '}
          <Link to="/about">About</Link>
        </li>
      </ul>
      <pre style={{ backgroundColor: 'lightgray', padding: '2rem' }}>
        <code>{dataStr}</code>
      </pre>
      <hr />
      <pre style={{ backgroundColor: 'lightgray', padding: '2rem' }}>
        <code>{JSON.stringify(rest, null, 2)}</code>
      </pre>
    </div>
  )
}

export default withPrismicPreview(HomePage, {
  [repoName]: {
    linkResolver,
  },
})

export const query = graphql`
  {
    allPrismicPrefixKitchenSink {
      nodes {
        _previewable
        id
        data {
          title {
            text
          }
          body {
            ... on PrismicPrefixKitchenSinkDataBodyFirstOption {
              items {
                first_option_repeat_image {
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
