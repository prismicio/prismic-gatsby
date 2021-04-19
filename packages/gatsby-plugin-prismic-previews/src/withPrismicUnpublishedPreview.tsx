import * as React from 'react'
import * as gatsby from 'gatsby'
import * as IOE from 'fp-ts/IOEither'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import * as R from 'fp-ts/Record'
import { constNull, constVoid, pipe } from 'fp-ts/function'
import ky from 'ky'

import { camelCase } from './lib/camelCase'
import { getComponentDisplayName } from './lib/getComponentDisplayName'
import { getNodesForPath } from './lib/getNodesForPath'
import { isPreviewSession } from './lib/isPreviewSession'
import { userFriendlyError } from './lib/userFriendlyError'

import { PrismicAPIDocumentNodeInput, UnknownRecord } from './types'
import {
  usePrismicPreviewBootstrap,
  UsePrismicPreviewBootstrapConfig,
} from './usePrismicPreviewBootstrap'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'
import { usePrismicPreviewAccessToken } from './usePrismicPreviewAccessToken'

import { Root } from './components/Root'
import { ModalAccessToken } from './components/ModalAccessToken'
import { ModalError } from './components/ModalError'
import { ModalLoading } from './components/ModalLoading'

export type WithPrismicUnpublishedPreviewConfig = {
  /**
   * Determines the React component to render for an unpublished preview. This
   * function will be provided a list of nodes whose `url` field (computed using
   * your app's Link Resolver) matches the page's URL.
   *
   * @param nodes List of nodes whose `url` field matches the page's URL.
   *
   * @returns The React component to render. If no component is returned, the wrapped component will be rendered.
   */
  componentResolver<P>(
    nodes: PrismicAPIDocumentNodeInput[],
  ): React.ComponentType<P> | undefined | null

  /**
   * Determines the data passed to a Gatsby page. The value returned from this
   * function is passed directly to the `data` prop.
   *
   * @param nodes List of nodes that have URLs resolved to the current page.
   * @param data The original page's `data` prop.
   *
   * @returns The value that will be passed to the page's `data` prop.
   */
  dataResolver?<TData extends Record<string, unknown>>(
    nodes: PrismicAPIDocumentNodeInput[],
    data: TData,
  ): Record<string, unknown>
}

/**
 * A convenience function to create a `componentResolver` function from a record
 * mapping a Prismic document type to a React component.
 *
 * In most cases, this convenience function is sufficient to provide a working
 * unpublished preview experience.
 *
 * @param componentMap A record mapping a Prismic document type to a React component.
 *
 * @returns A `componentResolver` function that can be passed to `withPrismicUnpublishedPreview`'s configuration.
 */
export const componentResolverFromMap = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  componentMap: Record<string, React.ComponentType<any>>,
): WithPrismicUnpublishedPreviewConfig['componentResolver'] => (nodes) =>
  pipe(
    A.head(nodes),
    O.bindTo('node'),
    O.bind('type', (env) => O.some(env.node.type)),
    O.chain((env) => R.lookup(env.type, componentMap)),
    O.getOrElseW(constNull),
  )

/**
 * A `dataResolver` function that assumes the first matching node for the page's
 * URL is the primary document. The document is added to the page's `data` prop
 * using the Prismic document's type formatted using Gatsby's camel-cased query
 * convention.
 */
export const defaultDataResolver: NonNullable<
  WithPrismicUnpublishedPreviewConfig['dataResolver']
> = (nodes, data) =>
  pipe(
    A.head(nodes),
    O.bindTo('node'),
    O.bind('key', (env) => O.some(camelCase(env.node.internal.type))),
    O.fold(
      () => data,
      (env) => ({
        ...data,
        [env.key]: env.node,
      }),
    ),
  )

type LocalState =
  | 'IDLE'
  | 'PROMPT_FOR_ACCESS_TOKEN'
  | 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN'
  | 'DISPLAY_ERROR'
  | 'NOT_PREVIEW'

export const withPrismicUnpublishedPreview = <
  TStaticData extends UnknownRecord,
  TProps extends gatsby.PageProps<TStaticData>
>(
  WrappedComponent: React.ComponentType<TProps>,
  usePrismicPreviewBootstrapConfig: UsePrismicPreviewBootstrapConfig,
  config: WithPrismicUnpublishedPreviewConfig,
): React.ComponentType<TProps> => {
  const WithPrismicUnpublishedPreview = (props: TProps): React.ReactElement => {
    const [contextState] = usePrismicPreviewContext()
    const [bootstrapState, bootstrapPreview] = usePrismicPreviewBootstrap(
      usePrismicPreviewBootstrapConfig,
    )
    const [accessToken, { set: setAccessToken }] = usePrismicPreviewAccessToken(
      contextState.activeRepositoryName,
    )
    const [localState, setLocalState] = React.useState<LocalState>('IDLE')
    const dismissModal = () => setLocalState('IDLE')

    const nodesForPath = React.useMemo(() => {
      // props.location.pathname must be used over props.path since the 404
      // page only receives a subset of a page's normal props.
      return getNodesForPath(props.location.pathname, contextState.nodes)
    }, [contextState, props.location.pathname])

    const ResolvedComponent = React.useMemo(
      () => config.componentResolver(nodesForPath) ?? WrappedComponent,
      [nodesForPath],
    )

    const resolvedData = React.useMemo(() => {
      const dataResolver = config.dataResolver ?? defaultDataResolver

      return dataResolver(nodesForPath, props.data)
    }, [nodesForPath, props.data])

    // Begin bootstrapping on page entry if a preview token exists and we
    // haven't already bootstrapped.
    React.useEffect(() => {
      pipe(
        isPreviewSession,
        IOE.fold(
          () => () => setLocalState('NOT_PREVIEW'),
          () =>
            pipe(
              contextState.isBootstrapped,
              IOE.fromPredicate(
                (isBootstrapped) => !isBootstrapped,
                () => new Error('Already bootstrapped'),
              ),
              IOE.fold(
                () => constVoid,
                () => () => bootstrapPreview(),
              ),
            ),
        ),
      )()
    }, [bootstrapPreview, contextState.isBootstrapped])

    // Handle state changes from the preview resolver.
    React.useEffect(() => {
      switch (bootstrapState.state) {
        case 'FAILED': {
          if (
            bootstrapState.error instanceof ky.HTTPError &&
            bootstrapState.error.response.status === 401 &&
            contextState.activeRepositoryName &&
            contextState.pluginOptionsStore[contextState.activeRepositoryName]
              .promptForAccessToken
          ) {
            // If we encountered a 401 status, we don't have the correct access
            // token, and the plugin is configured to prompt for a token, prompt
            // for the correct token.
            if (accessToken) {
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

            // Show the full error and stack trace in the console.
            console.error(bootstrapState.error)
          }

          break
        }

        default: {
          setLocalState('IDLE')
        }
      }
    }, [
      contextState.activeRepositoryName,
      contextState.pluginOptionsStore,
      accessToken,
      bootstrapState.state,
      bootstrapState.error,
    ])

    return (
      <>
        {localState === 'NOT_PREVIEW' ? (
          <WrappedComponent {...props} />
        ) : (
          <ResolvedComponent {...props} data={resolvedData} />
        )}

        {contextState.activeRepositoryName && (
          <Root>
            <ModalLoading
              isOpen={
                localState === 'IDLE' &&
                bootstrapState.state === 'BOOTSTRAPPING'
              }
              repositoryName={contextState.activeRepositoryName}
              onDismiss={dismissModal}
            />
            <ModalAccessToken
              isOpen={
                localState === 'PROMPT_FOR_ACCESS_TOKEN' ||
                localState === 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN'
              }
              repositoryName={contextState.activeRepositoryName}
              state={
                localState === 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN'
                  ? 'INCORRECT'
                  : 'IDLE'
              }
              initialAccessToken={accessToken}
              setAccessToken={setAccessToken}
              afterSubmit={() => {
                dismissModal()
                bootstrapPreview()
              }}
              onDismiss={dismissModal}
            />
            <ModalError
              isOpen={localState === 'DISPLAY_ERROR'}
              repositoryName={contextState.activeRepositoryName}
              errorMessage={
                bootstrapState.error
                  ? userFriendlyError(bootstrapState.error).message
                  : undefined
              }
              onDismiss={dismissModal}
            />
          </Root>
        )}
      </>
    )
  }

  const wrappedComponentName = getComponentDisplayName(WrappedComponent)
  WithPrismicUnpublishedPreview.displayName = `withPrismicUnpublishedPreview(${wrappedComponentName})`

  return WithPrismicUnpublishedPreview
}
