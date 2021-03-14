import * as React from 'react'

import {
  PrismicContext,
  PrismicContextAction,
  PrismicContextRepositoryState,
} from './context'

type UsePrismicPreviewContextValue = readonly [
  PrismicContextRepositoryState,
  React.Dispatch<PrismicContextAction>,
]

export const usePrismicPreviewContext = (
  repositoryName: string,
): UsePrismicPreviewContextValue => {
  const [state, dispatch] = React.useContext(PrismicContext)

  return React.useMemo(() => {
    let repositoryState = state[repositoryName]

    if (!repositoryState) {
      if (typeof window === 'undefined') {
        repositoryState = {
          // @ts-expect-error - Empty pluginOptions
          pluginOptions: {},
          repositoryName,
          nodes: {},
          typePaths: {},
          rootNodeMap: {},
          isBootstrapped: false,
        }
      } else {
        throw new Error(
          `Could not find a React Context for repository "${repositoryName}". Ensure that gatsby-plugin-prismic-previews is configured in gatsby-node.js for the repository.`,
        )
      }
    }

    return [repositoryState, dispatch]
  }, [state, repositoryName, dispatch])
}
