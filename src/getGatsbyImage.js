const buildURL = (
  baseURL,
  {
    width,
    height,
    aspectRatio,
    rect,
    dpr,
    quality = 50,
    compress = true,
    format = true,
    fit = 'max',
    blur,
  } = {},
) => {
  const params = {
    w: width,
    h: height,
    ar: aspectRatio,
    rect,
    fit,
    dpr,
    q: quality,
    blur,
    auto: encodeURIComponent(
      [compress && 'compress', format && 'format'].filter(Boolean).join(','),
    ),
  }

  const searchParams = Object.keys(params)
    .reduce((acc, key) => {
      const val = params[key]

      if (val === undefined || val === null || val.length < 1) return acc

      return [...acc, `${key}=${val}`]
    }, [])
    .join('&')

  return [baseURL, searchParams].join('?')
}

const buildBase64URL = baseURL =>
  buildURL(baseURL, { width: 100, blur: 15, quality: 20 })

const buildFixedSrcSet = (baseURL, params, resolutions = [1, 1.5, 2]) =>
  resolutions
    .map(resolution => {
      const url = buildURL(baseURL, { ...params, dpr: resolution })
      return `${url} ${resolution}x`
    })
    .join(', ')

const buildFluidSrcSet = (baseURL, params, breakpoints) => {
  const { width } = params

  if (!breakpoints) breakpoints = [width / 4, width / 2, width * 1.5, width * 2]

  // Sort, remove duplicates, and ensure maxWidth is added.
  const uniqSortedBreakpoints = [
    ...new Set([...breakpoints, width].sort((a, b) => a - b)),
  ]

  return uniqSortedBreakpoints
    .map(breakpoint => {
      const url = buildURL(baseURL, {
        ...params,
        width: breakpoint,
        height: undefined,
      })
      return `${url} ${breakpoint}w`
    })
    .join(', ')
}

const _getAspectRatioFromRect = rectString => {
  const [x1, y1, x2, y2] = rectString.split(',')

  return (x2 - x1) / (y2 - y1)
}

const stripSearchParams = url => url.replace(/\?.*$/, '')

const extractImageURLData = url => {
  const baseURL = stripSearchParams(url)
  const instance = new URL(url)
  const params = instance.searchParams

  return { baseURL, params }
}

export const getFixedGatsbyImage = (
  url,
  sourceWidth,
  sourceHeight,
  args = {},
) => {
  const { baseURL, params } = extractImageURLData(url)

  const rect = params.get('rect')
  const aspectRatio = sourceWidth / sourceHeight
  const width = args.width ?? sourceWidth
  const height = args.height ?? Math.round(width / aspectRatio)
  const quality = args.quality

  const base64 = buildBase64URL(baseURL)
  const src = buildURL(baseURL, { width, height, rect, quality })
  const srcSet = buildFixedSrcSet(baseURL, { width, height, rect, quality })

  return {
    base64,
    aspectRatio,
    width,
    height,
    src,
    srcWebp: src,
    srcSet,
    srcSetWebp: srcSet,
  }
}

export const getFluidGatsbyImage = (
  url,
  sourceWidth,
  sourceHeight,
  args = {},
) => {
  const { baseURL, params } = extractImageURLData(url)

  const aspectRatio = sourceWidth / sourceHeight
  const width = args.maxWidth ?? sourceWidth
  const height = args.maxHeight ?? Math.round(width / aspectRatio)
  const quality = args.quality
  const srcSetBreakpoints = args.srcSetBreakpoints
  const rect = params.get('rect')

  const base64 = buildBase64URL(baseURL)
  const src = buildURL(baseURL, { width, height, rect, quality })
  const srcSet = buildFluidSrcSet(
    baseURL,
    { width, height, rect, quality },
    srcSetBreakpoints,
  )

  return {
    base64,
    aspectRatio,
    src,
    srcWebp: src,
    srcSet,
    srcSetWebp: srcSet,
    // sizes,
  }
}
