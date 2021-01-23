import * as React from 'react'
import * as gatsby from 'gatsby'
import * as IOE from 'fp-ts/IOEither'
import * as IO from 'fp-ts/IO'
import { pipe } from 'fp-ts/function'
import Prismic from 'prismic-javascript'

import { getComponentDisplayName } from './lib/getComponentDisplayName'
import { validatePreviewTokenForRepository } from './lib/isPreviewTokenForRepository'
import { getCookie } from './lib/getCookie'

import { UnknownRecord } from './types'
import { UnauthorizedError } from './errors/NotAuthorizedError'
import {
  usePrismicPreviewBootstrap,
  UsePrismicPreviewBootstrapFn,
  UsePrismicPreviewBootstrapState,
} from './usePrismicPreviewBootstrap'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'
import { usePrismicPreviewAccessToken } from './usePrismicPreviewAccessToken'
import { useMergePrismicPreviewData } from './useMergePrismicPreviewData'

export interface WithPrismicPreviewProps {
  bootstrapPrismicPreview: UsePrismicPreviewBootstrapFn
  isPrismicPreview: boolean
  prismicPreviewState: UsePrismicPreviewBootstrapState['state']
  prismicPreviewError: UsePrismicPreviewBootstrapState['error']
}

type WithPrismicPreviewConfig = {
  mergePreviewData?: boolean
}

type LocalState =
  | 'IDLE'
  | 'PROMPT_FOR_ACCESS_TOKEN'
  | 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN'
  | 'DISPLAY_ERROR'

const isValidToken = (repositoryName: string) =>
  pipe(
    getCookie(Prismic.previewCookie),
    IOE.chain((token) =>
      IOE.fromEither(validatePreviewTokenForRepository(repositoryName, token)),
    ),
    IOE.getOrElse(() => IO.of(false)),
  )

export const withPrismicPreview = <
  TStaticData extends UnknownRecord,
  TProps extends gatsby.PageProps<TStaticData>
>(
  WrappedComponent: React.ComponentType<TProps>,
  repositoryName: string,
  config: WithPrismicPreviewConfig = {},
): React.ComponentType<TProps & WithPrismicPreviewProps> => {
  const WithPrismicPreview = (props: TProps): React.ReactElement => {
    const [contextState] = usePrismicPreviewContext(repositoryName)
    const [bootstrapState, bootstrapPreview] = usePrismicPreviewBootstrap(
      repositoryName,
    )
    const [, { set: setAccessToken }] = usePrismicPreviewAccessToken(
      repositoryName,
    )
    const [localState, setLocalState] = React.useState<LocalState>('IDLE')

    // Begin bootstrapping on page entry if the preview token is for this
    // repository and we haven't already bootstrapped.
    React.useEffect(() => {
      if (isValidToken(repositoryName)() && !contextState.isBootstrapped) {
        bootstrapPreview()
      }
    }, [])

    // Handle state changes from the preview resolver.
    React.useEffect(() => {
      switch (bootstrapState.state) {
        case 'FAILED': {
          if (
            bootstrapState.error instanceof UnauthorizedError &&
            contextState.pluginOptions.promptForAccessToken
          ) {
            // If we encountered an UnauthorizedError, we don't have the correct
            // access token, and the plugin is configured to prompt for a token,
            // prompt for the correct token.
            if (contextState.pluginOptions.accessToken) {
              setLocalState('PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN')
            } else {
              setLocalState('PROMPT_FOR_ACCESS_TOKEN')
            }
          } else {
            // Otherwise, just display the error to the user. This can either be
            // an internal error or an UnauthorizedError (if the plugin is
            // configured to not prompt for the access token or we have the wrong
            // token).
            setLocalState('DISPLAY_ERROR')
          }

          break
        }
      }
    }, [bootstrapState.state, bootstrapState.error])

    // TODO: Replace this with a proper UI in the DOM.
    // TODO: Have a user-facing button to clear the access token cookie.
    React.useEffect(() => {
      switch (localState) {
        case 'PROMPT_FOR_ACCESS_TOKEN':
        case 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN': {
          const accessToken = prompt(
            `Enter Prismic access token for ${repositoryName}`,
          )

          if (accessToken) {
            // Set the access token in the repository's context and retry
            // bootstrapping the preview.
            setAccessToken(accessToken)
            bootstrapPreview()
          } else {
            setLocalState('DISPLAY_ERROR')
          }

          break
        }

        case 'DISPLAY_ERROR': {
          console.error(bootstrapState.error)

          break
        }
      }
    }, [localState])

    const mergedData = useMergePrismicPreviewData(repositoryName, props.data, {
      mergeStrategy: 'traverseAndReplace',
      skip: config.mergePreviewData,
    })

    return (
      <WrappedComponent
        {...props}
        data={mergedData.data}
        boostrapPrismicPreview={bootstrapPreview}
        isPrismicPreview={mergedData.isPreview}
        prismicPreviewState={bootstrapState.state}
        prismicPreviewError={bootstrapState.error}
        prismicPreviewSetAccessToken={setAccessToken}
      />
    )
  }

  const wrappedComponentName = getComponentDisplayName(WrappedComponent)
  WithPrismicPreview.displayName = `withPrismicPreview(${wrappedComponentName})`

  return WithPrismicPreview
}
