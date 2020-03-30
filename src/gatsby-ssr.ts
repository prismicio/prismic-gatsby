import React from 'react'
import { PluginOptions } from './types'

export interface OnRenderBodyArgs {
  setHeadComponents(args: React.ReactElement<any>[]): void;
}

export const onRenderBody = ({ setHeadComponents }: OnRenderBodyArgs, options: PluginOptions) => {
  if(options.omitPrismicScript) return;
  const settings = React.createElement('script',{
    children: `window.prismic = { endpoint: "https://${options.repositoryName}.cdn.prismic.io/api/v2"}`
  });

  const src = `https://static.cdn.prismic.io/prismic.min.js?&new=true`;
  const key = 'prismic-script';
  const toolbarScript = React.createElement('script', { key, src });
  /* TODO: make optional */
  setHeadComponents([
    settings,
    toolbarScript,
  ]);
}
