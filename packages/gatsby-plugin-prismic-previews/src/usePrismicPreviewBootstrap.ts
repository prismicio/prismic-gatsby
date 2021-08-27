import * as React from 'react'
import * as prismic from '@prismicio/client'
import * as prismicT from '@prismicio/types'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'

import { extractPreviewRefRepositoryName } from './lib/extractPreviewRefRepositoryName'
import { fetchTypePaths } from './lib/fetchTypePaths'
import { getPreviewRef } from './lib/getPreviewRef'
import { isPreviewSession } from './lib/isPreviewSession'
import { sprintf } from './lib/sprintf'

import { PrismicRepositoryConfigs } from './types'
import {
  MISSING_PLUGIN_OPTIONS_MSG,
  MISSING_REPOSITORY_CONFIG_MSG,
} from './constants'
import {
  PrismicContextActionType,
  PrismicContextState,
  PrismicPreviewState,
} from './context'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'

export type UsePrismicPreviewBootstrapFn = () => Promise<void>

/**
 * React hook that bootstraps a Prismic preview session. When the returned
 * bootstrap function is called, the preiew session will be scoped to this
 * hook's Prismic repository. All documents from the repository will be fetched
 * using the preview session's documents.
 *
 * @param repositoryConfigs Configuration that determines how the bootstrap function runs.
 */
export const usePrismicPreviewBootstrap = (
  repositoryConfigs: PrismicRepositoryConfigs = [],
): UsePrismicPreviewBootstrapFn => {
  const [contextState, contextDispatch] = usePrismicPreviewContext()

  // A ref to the latest contextState is setup specifically for getTypePath
  // which is populated during the program's runtime. Since
  // contextState.typePaths is empty at all times during the program's run due
  // to closures, we need to opt out of the closure and use a ref.
  //
  // If you have a better idea how to handle this, please share!
  const contextStateRef = React.useRef<PrismicContextState>(contextState)

  // We need to update the ref anytime contextState changes to ensure lazy
  // functions get the latest data.
  React.useEffect(() => {
    contextStateRef.current = contextState
  }, [contextState])

  return React.useCallback(async (): Promise<void> => {
    if (
      (contextStateRef.current.previewState !== PrismicPreviewState.IDLE &&
        contextStateRef.current.previewState !==
          PrismicPreviewState.RESOLVED) ||
      contextStateRef.current.isBootstrapped
    ) {
      // No op. Bootstrapping should only happen once.
      return
    }

    if (E.isLeft(isPreviewSession())) {
      return contextDispatch({
        type: PrismicContextActionType.NotAPreview,
      })
    }

    const previewRef = getPreviewRef()
    if (E.isLeft(previewRef)) {
      return contextDispatch({
        type: PrismicContextActionType.Failed,
        payload: { error: previewRef.left },
      })
    }

    const repositoryName = extractPreviewRefRepositoryName(previewRef.right)
    if (O.isNone(repositoryName)) {
      return contextDispatch({
        type: PrismicContextActionType.Failed,
        payload: { error: new Error('Invalid preview ref') },
      })
    }

    contextDispatch({
      type: PrismicContextActionType.SetActiveRepositoryName,
      payload: { repositoryName: repositoryName.value },
    })

    // TODO: Deeply merge repository configs
    const resolvedRepositoryConfigs = [
      ...repositoryConfigs,
      ...contextState.repositoryConfigs,
    ]
    const repositoryConfig = resolvedRepositoryConfigs.find(
      (config) => config.repositoryName === repositoryName.value,
    )
    if (!repositoryConfig) {
      return contextDispatch({
        type: PrismicContextActionType.Failed,
        payload: {
          error: new Error(
            sprintf(
              MISSING_REPOSITORY_CONFIG_MSG,
              repositoryName.value,
              'withPrismicPreview and withPrismicUnpublishedPreview',
            ),
          ),
        },
      })
    }

    const repositoryPluginOptions =
      contextState.pluginOptionsStore[repositoryName.value]
    if (!repositoryPluginOptions) {
      return contextDispatch({
        type: PrismicContextActionType.Failed,
        payload: {
          error: new Error(
            sprintf(MISSING_PLUGIN_OPTIONS_MSG, repositoryName.value),
          ),
        },
      })
    }

    contextDispatch({
      type: PrismicContextActionType.SetupRuntime,
      payload: {
        repositoryName: repositoryName.value,
        config: {
          linkResolver: repositoryConfig.linkResolver,
          htmlSerializer: repositoryConfig.htmlSerializer,
          transformFieldName: repositoryConfig.transformFieldName,
          typePrefix: repositoryPluginOptions.typePrefix,
          imageImgixParams: repositoryPluginOptions.imageImgixParams,
          imagePlaceholderImgixParams:
            repositoryPluginOptions.imagePlaceholderImgixParams,
        },
      },
    })

    // Begin bootstrap phase.
    contextDispatch({
      type: PrismicContextActionType.StartBootstrapping,
    })

    const typePaths = await fetchTypePaths({
      repositoryName: repositoryName.value,
    })()
    if (E.isLeft(typePaths)) {
      return contextDispatch({
        type: PrismicContextActionType.Failed,
        payload: { error: typePaths.left },
      })
    }

    contextDispatch({
      type: PrismicContextActionType.ImportTypePaths,
      payload: {
        repositoryName: repositoryName.value,
        typePathsExport: typePaths.right,
      },
    })

    const endpoint =
      repositoryPluginOptions.apiEndpoint ??
      prismic.getEndpoint(repositoryName.value)
    const client = prismic.createClient(endpoint, {
      accessToken: repositoryPluginOptions.accessToken,
      defaultParams: {
        lang: repositoryPluginOptions.lang,
        fetchLinks: repositoryPluginOptions.fetchLinks,
        graphQuery: repositoryPluginOptions.graphQuery,
      },
    })
    client.enableAutoPreviews()

    let allDocuments: prismicT.PrismicDocument[]
    try {
      allDocuments = await client.getAll()
    } catch (error) {
      if (
        error instanceof prismic.ForbiddenError &&
        repositoryPluginOptions.promptForAccessToken
      ) {
        return contextDispatch({
          type: PrismicContextActionType.PromptForAccessToken,
        })
      } else {
        return contextDispatch({
          type: PrismicContextActionType.Failed,
          payload: { error },
        })
      }
    }

    contextDispatch({
      type: PrismicContextActionType.RegisterDocuments,
      payload: {
        repositoryName: repositoryName.value,
        documents: allDocuments,
      },
    })

    contextDispatch({
      type: PrismicContextActionType.Bootstrapped,
    })
  }, [
    repositoryConfigs,
    contextState.repositoryConfigs,
    contextState.pluginOptionsStore,
    contextDispatch,
  ])
}
