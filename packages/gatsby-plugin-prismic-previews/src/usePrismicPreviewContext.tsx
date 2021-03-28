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

export const usePrismicPreviewContext = (): UsePrismicPreviewContextValue =>
  React.useContext(PrismicContext)
