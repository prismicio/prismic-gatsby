import React from 'react'
import { PluginOptions } from './types'

export interface OnRenderBodyArgs {
  setHeadComponents(args: React.ReactElement<any>[]): void;
}

export const onRenderBody = ({ setHeadComponents }: OnRenderBodyArgs, options: PluginOptions) => {
  if(options.prismicScript === false) return;

  const src = `//static.cdn.prismic.io/prismic.js?repo=${options.repositoryName}&new=true`;
  const key = 'prismic-script';
  const toolbarScript = React.createElement('script', { key, src, async: true, defer: true });

  setHeadComponents([ toolbarScript ]);
}
