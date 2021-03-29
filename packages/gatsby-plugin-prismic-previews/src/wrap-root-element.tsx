/**
 * TODO:
 * This file is not used due to issues with multiple React.Context instances
 * being created. This causes an issue where gatsby-browser and the hooks
 * appear to use different instances, causing invalid lookups and dispatches.
 */

import * as React from 'react'
import * as gatsby from 'gatsby'
import * as IO from 'fp-ts/IO'
import * as IOE from 'fp-ts/IOEither'
import { pipe } from 'fp-ts/function'

import { PrismicPreviewProvider } from './context'

/**
 * Determines if PrismicPreviewProvider has been added to the app. Because
 * multiple instances of this plugin can be added to an app, and we only need
 * one PrismicPreviewProvider, this in-memory boolean determines if one of the
 * plugin instances has already added the provider.
 *
 * The first plugin instance to run this API will set this to true.
 */
let isProviderAdded = false as boolean

const declareProviderAdded: IO.IO<void> = () => void (isProviderAdded = true)

export const wrapRootElement: NonNullable<
  gatsby.GatsbyBrowser['wrapRootElement']
> = (gatsbyContext: gatsby.WrapRootElementBrowserArgs) =>
  pipe(
    IOE.Do,
    IOE.filterOrElse(
      () => !isProviderAdded,
      () => new Error('PrismicPreviewProvider has already been added'),
    ),
    IOE.chainFirst(() => IOE.fromIO(declareProviderAdded)),
    IOE.map(() => (
      <PrismicPreviewProvider key="gatsby-plugin-prismic-previews-provider">
        {gatsbyContext.element}
      </PrismicPreviewProvider>
    )),
    IOE.getOrElse(() => IO.of(gatsbyContext.element)),
  )()
