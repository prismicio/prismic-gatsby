import * as React from 'react'
import * as gatsby from 'gatsby'
import * as RE from 'fp-ts/ReaderEither'
import * as E from 'fp-ts/Either'
import { identity, pipe } from 'fp-ts/function'

import { throwError } from './lib/throwError'

import { PluginOptions } from './types'
import {
  createPrismicContext,
  CreateStoreContextEnv,
} from './usePrismicPreviewContext'

interface WrapRootElementProgramEnv extends CreateStoreContextEnv {
  element: React.ReactNode;
}

const wrapRootElementProgram: RE.ReaderEither<
  WrapRootElementProgramEnv,
  Error,
  React.ReactNode
> = pipe(
  RE.ask<WrapRootElementProgramEnv>(),
  RE.bindW('provider', () => createPrismicContext),
  RE.map((env) => {
    const PrismicPreviewProvider = env.provider

    return <PrismicPreviewProvider>{env.element}</PrismicPreviewProvider>
  }),
)

export const wrapRootElement: NonNullable<
  gatsby.GatsbyBrowser['wrapRootElement']
> = (gatsbyContext, pluginOptions: PluginOptions) =>
  pipe(
    wrapRootElementProgram({
      element: gatsbyContext.element,
      pluginOptions,
    }),
    E.fold(throwError, identity),
  )
