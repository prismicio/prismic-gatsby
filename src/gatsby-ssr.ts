import React from 'react'
import { PluginOptions } from './types'

export interface OnRenderBodyArgs {
  setHeadComponents(args: React.ReactElement<any>[]): void;
}

export const onRenderBody = ({ setHeadComponents }: OnRenderBodyArgs, options: PluginOptions) => {
  if(options.omitPrismicScript) return;
  const src = `https://prismic.io/prismic.js?repo=${options.repositoryName}`;
  const key = 'prismic-script';
  const toolbarScript = React.createElement('script', { key, src });
  /* TODO: make optional */
  setHeadComponents([toolbarScript]);
}
