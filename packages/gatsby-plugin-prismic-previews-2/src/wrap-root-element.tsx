import * as React from 'react'
import * as gatsby from 'gatsby'
import * as Rr from 'fp-ts/Reader'
import { pipe } from 'fp-ts/function'

import { PluginOptions } from './types'
import { createPrismicContext, CreatePrismicContextEnv } from './context'

interface WrapRootElementProgramEnv extends CreatePrismicContextEnv {
  element: React.ReactNode
}

const wrapRootElementProgram: Rr.Reader<
  WrapRootElementProgramEnv,
  JSX.Element
> = pipe(
  Rr.ask<WrapRootElementProgramEnv>(),
  Rr.bindW('Provider', () => createPrismicContext),
  Rr.map(({ Provider, element }) => <Provider>{element}</Provider>),
)

export const wrapRootElement: NonNullable<
  gatsby.GatsbyBrowser['wrapRootElement']
> = (gatsbyContext, pluginOptions: PluginOptions) =>
  wrapRootElementProgram({
    pluginOptions,
    element: gatsbyContext.element,
  })
