import React, {
  useMemo,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

export const PreviewContext = React.createContext()

export const PreviewProvider = ({ children, pluginOptions, ...props }) => {
  const [typePaths, setTypePaths] = useState(null)

  const asyncEffect = useCallback(async () => {
    const { repositoryName } = pluginOptions

    const req = await fetch(
      `${__PATH_PREFIX__}/prismic__${repositoryName}__typeDefs.json`,
    )
    const data = await req.text()
    console.log(data)
    const typePaths = JSON.parse(data)

    setTypePaths(typePaths)
  }, [pluginOptions])

  useEffect(() => {
    asyncEffect()
  }, [asyncEffect])

  const memoizedValues = useMemo(() => ({ pluginOptions, typePaths }), [
    pluginOptions,
    typePaths,
  ])

  return (
    <PreviewContext.Provider value={memoizedValues} {...props}>
      {children}
    </PreviewContext.Provider>
  )
}

export const usePreviewContext = () => useContext(PreviewContext)
