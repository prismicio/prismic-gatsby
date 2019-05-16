import React from 'react'
import { PreviewProvider } from './components/PreviewProvider'

export const wrapPageElement = ({ element, props }, pluginOptions) => (
  <PreviewProvider pluginOptions={pluginOptions} {...props}>
    {element}
  </PreviewProvider>
)
