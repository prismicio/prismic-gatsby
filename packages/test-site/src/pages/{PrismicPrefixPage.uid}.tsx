import * as React from 'react'
import { graphql, PageProps } from 'gatsby'
import {
  usePrismicPreviewAccessToken,
  withPrismicPreview,
  WithPrismicPreviewProps,
} from 'gatsby-plugin-prismic-previews-2'

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
      <pre style={{ backgroundColor: 'lightgray', padding: '2rem' }}>
        <code>{props.prismicPreviewState}</code>
      </pre>
      <hr />
      <pre style={{ backgroundColor: 'lightgray', padding: '2rem' }}>
        <code>
          {JSON.stringify(props.data.prismicPrefixPage.data.title, null, 2)}
        </code>
      </pre>
      <hr />
      <pre style={{ backgroundColor: 'lightgray', padding: '2rem' }}>
        <code>{propsStr}</code>
      </pre>
    </div>
  )
}

export default withPrismicPreview(Page, repoName, { linkResolver })

export const query = graphql`
  query($uid: String!) {
    prismicPrefixPage(uid: { eq: $uid }) {
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
