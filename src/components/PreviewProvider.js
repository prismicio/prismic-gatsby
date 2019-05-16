import React, { useMemo } from 'react'

export const PreviewContext = React.createContext()

export const PreviewProvider = ({ children, pluginOptions, ...props }) => {
  const value = useMemo(() => pluginOptions, [pluginOptions])

  return (
    <PreviewContext.Provider value={value} {...props}>
      {children}
    </PreviewContext.Provider>
  )
}
