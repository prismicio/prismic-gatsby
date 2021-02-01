import * as React from 'react'
import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as E from 'fp-ts/Either'
import { pipe, constVoid } from 'fp-ts/function'

import { throwError } from './lib/throwError'

import { PluginOptions } from './types'

const getToolbarScriptURL = (
  repositoryName: string,
  type: PluginOptions['toolbar'],
): string => {
  switch (type) {
    case 'new': {
      return `//static.cdn.prismic.io/prismic.js?repo=${repositoryName}&new=true`
    }

    case 'legacy': {
      return `//static.cdn.prismic.io/prismic.js?repo=${repositoryName}`
    }
  }
}

interface OnRenderBodyProgramEnv {
  setPostBodyComponents: gatsby.RenderBodyArgs['setPostBodyComponents']
  repositoryName: string
  toolbar: PluginOptions['toolbar']
}

const onRenderBodyProgram: RTE.ReaderTaskEither<
  OnRenderBodyProgramEnv,
  never,
  void
> = pipe(
  RTE.ask<OnRenderBodyProgramEnv>(),
  RTE.bind('scriptURL', (env) =>
    RTE.of(getToolbarScriptURL(env.repositoryName, env.toolbar)),
  ),
  RTE.bind('script', (env) =>
    RTE.of(React.createElement('script', { src: env.scriptURL, defer: true })),
  ),
  RTE.chainFirst((env) =>
    RTE.fromIO(() => env.setPostBodyComponents([env.script])),
  ),
  RTE.map(constVoid),
)

export const onRenderBody: NonNullable<
  gatsby.GatsbySSR['onRenderBody']
> = async (
  gatsbyContext: gatsby.RenderBodyArgs,
  pluginOptions: PluginOptions,
) =>
  pipe(
    await RTE.run(onRenderBodyProgram, {
      setPostBodyComponents: gatsbyContext.setPostBodyComponents,
      repositoryName: pluginOptions.repositoryName,
      toolbar: pluginOptions.toolbar,
    }),
    E.fold(throwError, constVoid),
  )
