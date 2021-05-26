import * as React from 'react'
import { graphql, PageProps, Link } from 'gatsby'
import {
  withPrismicPreview,
  WithPrismicPreviewProps,
} from 'gatsby-plugin-prismic-previews'

import { repositoryConfigs } from '../prismicPreviews'

const KitchenSinkPage = (
  props: PageProps<Record<string, any>> &
    WithPrismicPreviewProps<Record<string, any>>,
): JSX.Element => {
  return (
    <div>
      <ul>
        <li>
          <Link to="/">Index</Link>
        </li>
        <li>
          <Link to="/home">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
      <pre style={{ backgroundColor: 'lightgray', padding: '2rem' }}>
        <code>{props.prismicPreviewState}</code>
      </pre>
      <hr />
      <pre style={{ backgroundColor: 'lightgray', padding: '2rem' }}>
        <code>isPrismicPreview: {props.isPrismicPreview?.toString()}</code>
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
            props.data.prismicPrefixKitchenSink.data.body[0]?.primary
              .first_option_nonrepeat_title.html,
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
        <code>
          {JSON.stringify(
            props.data.prismicPrefixKitchenSink.data.body[0]?.primary
              .first_option_nonrepeat_content_relationship.document,
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
        <code>
          {JSON.stringify(
            props.data.prismicPrefixKitchenSink.data.title.html,
            null,
            2,
          )}
        </code>
      </pre>
      <hr />
      {/*
      <pre
        style={{
          backgroundColor: 'lightgray',
          padding: '2rem',
          overflow: 'auto',
        }}
      >
        <code>{propsStr}</code>
      </pre>
      */}
    </div>
  )
}

export default withPrismicPreview(KitchenSinkPage, repositoryConfigs)

export const query = graphql`
  query ($uid: String!) {
    prismicPrefixKitchenSink(uid: { eq: $uid }) {
      _previewable
      uid
      data {
        title {
          html
        }
        body {
          ... on PrismicPrefixKitchenSinkDataBodyFirstOption {
            primary {
              first_option_nonrepeat_title {
                html
              }
              first_option_nonrepeat_content_relationship {
                document {
                  ... on PrismicPrefixKitchenSink {
                    uid
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
