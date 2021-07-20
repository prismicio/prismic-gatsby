import * as React from 'react'
import { PageProps } from 'gatsby'
import {
  withPrismicPreviewResolver,
  WithPrismicPreviewResolverProps,
} from 'gatsby-plugin-prismic-previews'

import { repositoryConfigs } from '../prismicPreviews'

type PreviewPageProps = PageProps & WithPrismicPreviewResolverProps

const PreviewPage = (props: PreviewPageProps): JSX.Element => {
  const propsStr = JSON.stringify(props, null, 2)

  return (
    <pre style={{ backgroundColor: 'lightgray', padding: '2rem' }}>
      <code>{propsStr}</code>
    </pre>
  )
}

export default withPrismicPreviewResolver(PreviewPage, repositoryConfigs)
