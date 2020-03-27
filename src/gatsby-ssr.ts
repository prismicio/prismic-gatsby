import React from 'react'
import { PluginOptions } from './types'

interface OnRenderBodyArgs {
  setHeadComponents(args: React.ReactElement<any>[]): void;
}

export const onRenderBody = ({ setHeadComponents }: OnRenderBodyArgs, options: PluginOptions) => {
  const src = `//prismic.io/prismic.js?repo=${options.repositoryName}`;
  const key = 'prismic-script';
  const toolbarScript = React.createElement('script', { key, src });
  /* TODO: make optional */
  setHeadComponents([toolbarScript]);
}
