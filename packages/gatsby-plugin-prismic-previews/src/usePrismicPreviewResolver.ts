import * as React from 'react'
import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'
import { Dependencies } from 'gatsby-prismic-core'

import { usePrismicPreview, UsePrismicPreviewConfig } from './usePrismicPreview'

export type UsePrismicPreviewResolverConfig = UsePrismicPreviewConfig

// TODO: write a program that does the below TODO
const prismicPreviewResolverProgram = pipe(
  RTE.ask<Dependencies>(),
  RTE.right({}),
  RTE.bindW('previewRef', () =>
    pipe(
      getURLSearchParam('token'),
      RTE.fromOption(() => Error('token URL parameter not present')),
    ),
  ),
)

export const usePrismicPreviewResolver = (
  config: UsePrismicPreviewResolverConfig,
): ReturnType<typeof usePrismicPreview> => {
  // TODO: Get token and set as cookie
  // In usePrismicPreview, use that cookie as the token and fetch everything.
  // This ensures the cookie will exist there throughout page refreshes, which
  // the Prismic toolbar will do any time a document is edited.

  const preview = usePrismicPreview(config)

  React.useEffect(() => {
    if (preview.isPreview && preview.path && preview.node)
      gatsby.navigate(preview.path)
  }, [preview.path, preview.node, preview.isPreview])

  return preview
}
