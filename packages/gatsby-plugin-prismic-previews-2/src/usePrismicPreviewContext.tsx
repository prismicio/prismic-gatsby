import * as React from 'react'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

import { getPrismicContext, PrismicContextValue } from './context'

export const usePrismicPreviewContext = (
  repositoryName: string,
): PrismicContextValue =>
  pipe(
    getPrismicContext(repositoryName),
    O.fold(() => {
      throw new Error(
        `Could not find a React Context for repository "${repositoryName}"`,
      )
    }, React.useContext),
  )
