import React from 'react'
import { PluginOptions } from './types'

interface OnRenderBodyArgs {
    setHeadComponents(args: React.ReactElement<any>[]): void;
}

exports.onRenderBody = ({ setHeadComponents }: OnRenderBodyArgs, options: PluginOptions) => {
    const src = `//prismic.io/prismic.js?repo=${options.repositoryName}`;
    const type = "text/javascript";
    const key = "prismic-script";
    const toolbarScript = React.createElement('script', { key, type, src });
    /* TODO: make optional */
    setHeadComponents([toolbarScript]);
}