// Default width for `fixed` images. Same as `gatsby-plugin-sharp`.
const DEFAULT_FIXED_WIDTH = 400

// Default resolutions for `fixed` images. Same as `gatsby-plugin-sharp`.
const DEFAULT_FIXED_RESOLUTIONS = [1, 1.5, 2]

// Default maxWidth for `fluid` images. Same as `gatsby-plugin-sharp`.
const DEFAULT_FLUID_MAX_WIDTH = 800

// Default breakpoint factors for `fluid` images. Same as
// `gatsby-plugin-sharp`.
const DEFAULT_FLUID_BREAKPOINT_FACTORS = [0.25, 0.5, 1.5, 2]

// Default quality for images. 50 is fairly aggressive.
const DEFAULT_QUALITY = 50

// Default image sizing strategy. `max` ensures the resulting image is never
// larger than the source file.
const DEFAULT_FIT = 'max'

const buildURL = (
  baseURL,
  {
    width,
    height,
    aspectRatio,
    rect,
    dpr,
    quality = DEFAULT_QUALITY,
    compress = true,
    format = true,
    fit = DEFAULT_FIT,
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

const buildBase64URL = (baseURL, params) =>
  buildURL(baseURL, { width: 100, blur: 15, quality: 20, ...params })

const buildFixedSrcSet = (
  baseURL,
  params,
  resolutions = DEFAULT_FIXED_RESOLUTIONS,
) =>
  resolutions
    .map(resolution => {
      const url = buildURL(baseURL, { ...params, dpr: resolution })
      return `${url} ${resolution}x`
    })
    .join(', ')

const buildFluidSrcSet = (baseURL, params, breakpoints) => {
  const { width } = params

  if (!breakpoints)
    breakpoints = DEFAULT_FLUID_BREAKPOINT_FACTORS.map(x => width * x)

  // Remove duplicates, sort by numberical value, and ensure maxWidth is added.
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

const extractImageURLData = url => {
  const instance = new URL(url)
  const baseURL = instance.origin + instance.pathname
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
  const width = args.width ?? DEFAULT_FIXED_WIDTH
  const height = args.height ?? Math.round(width / aspectRatio)
  const quality = args.quality

  const base64 = buildBase64URL(baseURL, { rect })
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

  const rect = params.get('rect')
  const aspectRatio = sourceWidth / sourceHeight
  const width = args.maxWidth ?? DEFAULT_FLUID_MAX_WIDTH
  const height = args.maxHeight ?? Math.round(width / aspectRatio)
  const quality = args.quality
  const srcSetBreakpoints = args.srcSetBreakpoints

  const base64 = buildBase64URL(baseURL, { rect })
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
