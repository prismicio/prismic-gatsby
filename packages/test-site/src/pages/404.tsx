import * as React from 'react'
import { PageProps } from 'gatsby'
import {
  componentResolverFromMap,
  WithPrismicPreviewProps,
  withPrismicUnpublishedPreview,
} from 'gatsby-plugin-prismic-previews'
import * as prismic from 'ts-prismic'

import { linkResolver } from '../linkResolver'

import KitchenSinkPage from '../pages/{PrismicPrefixKitchenSink.uid}'

const repoName = process.env.GATSBY_PRISMIC_REPOSITORY_NAME as string

const NotFoundPage = () => '404 Not Found'

// const NotFoundPage = (): string => '404'

export default withPrismicUnpublishedPreview(
  NotFoundPage,
  { [repoName]: { linkResolver } },
  {
    componentResolver: componentResolverFromMap({
      kitchen_sink: KitchenSinkPage,
    }),
  },
  // {
  //   componentResolver: <P extends PageProps>(
  //     docs: prismic.Document[],
  //   ): React.ComponentType<P> | void => {
  //     switch (docs[0].type) {
  //       case 'kitchen_sink':
  //         return KitchenSinkPage
  //     }
  //   },
  //   dataResolver: (nodes) => {
  //     return nodes[0]
  //   },
  // },
  // {
  //   componentRenderer: (
  //     docs: prismic.Document[],
  //     props: PageProps & WithPrismicPreviewProps,
  //   ): React.ReactNode | void => {
  //     const doc = docs[0]

  //     switch (doc.type) {
  //       case 'kitchen_sink':
  //         return <KitchenSinkPage {...props} />
  //     }
  //   },
  // },
)
