import * as React from 'react'
import { graphql, PageProps, Link } from 'gatsby'
import {
  usePrismicPreviewAccessToken,
  withPrismicPreview,
  WithPrismicPreviewProps,
} from 'gatsby-plugin-prismic-previews'

import { linkResolver } from '../linkResolver'

const repoName = process.env.GATSBY_PRISMIC_REPOSITORY_NAME as string

const Page = (
  props: PageProps<Record<string, any>> &
    WithPrismicPreviewProps<Record<string, any>>,
): JSX.Element => {
  const propsStr = JSON.stringify(props, null, 2)

  const [accessToken] = usePrismicPreviewAccessToken(repoName)

  // const [state] = usePrismicPreviewContext(repoName)
  // const [token] = usePrismicPreviewAccessToken(repoName)

  // console.log({ state, token })

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
        <code>{props.prismicPreviewState}</code>
      </pre>
      <hr />
      <pre
        style={{
          backgroundColor: 'lightgray',
          padding: '2rem',
          overflow: 'auto',
        }}
      >
        <code>
          {JSON.stringify(
            props.data.prismicPrefixKitchenSink.data.title,
            null,
            2,
          )}
        </code>
      </pre>
      <hr />
      <pre
        style={{
          backgroundColor: 'lightgray',
          padding: '2rem',
          overflow: 'auto',
        }}
      >
        <code>{propsStr}</code>
      </pre>
    </div>
  )
}

export default withPrismicPreview(Page, repoName, { linkResolver })

export const query = graphql`
  query($uid: String!) {
    prismicPrefixKitchenSink(uid: { eq: $uid }) {
      _previewable
      uid
      data {
        title {
          text
        }
      }
    }
  }
`
