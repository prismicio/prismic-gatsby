import * as React from 'react'

import {
  PrismicContext,
  PrismicContextAction,
  PrismicContextState,
} from './context'

type UsePrismicPreviewContextValue = readonly [
  PrismicContextState,
  React.Dispatch<PrismicContextAction>,
]

/**
 * Returns the global state for Prismic preview sessions.
 */
export const usePrismicPreviewContext = (): UsePrismicPreviewContextValue =>
  React.useContext(PrismicContext)
