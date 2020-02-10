import { buildImgixUrl } from 'ts-imgix'

import { ImgixUrlQueryParams, ImgixFit } from 'ts-imgix'
import {
  GatsbyFixedImageProps,
  GatsbyFluidImageProps,
  GatsbyImageFixedArgs,
  GatsbyImageFluidArgs,
  GraphQLType,
  NormalizedImageField,
} from './types'

// Default width for `fixed` images. Same as `gatsby-plugin-sharp`.
const DEFAULT_FIXED_WIDTH = 400

// Default resolutions for `fixed` images. Same as `gatsby-plugin-sharp`.
const DEFAULT_FIXED_RESOLUTIONS = [1, 1.5, 2]

// Default maxWidth for `fluid` images. Same as `gatsby-plugin-sharp`.
const DEFAULT_FLUID_MAX_WIDTH = 800

// Default breakpoint factors for `fluid` images. Same as
// `gatsby-plugin-sharp`.
const DEFAULT_FLUID_BREAKPOINT_FACTORS = [0.25, 0.5, 1.5, 2]

/**
 * Default params for all images.
 */
const DEFAULT_PARAMS: ImgixUrlQueryParams = {
  // `max` ensures the resulting image is never larger than the source file.
  fit: ImgixFit.max,

  // 50 is fairly aggressive.
  q: 50,
}

/**
 * Default params for the placeholder image.
 */
const DEFAULT_PLACEHOLDER_PARAMS: ImgixUrlQueryParams = {
  // 100 is greater than the default `gatsby-transformer-sharp` size, but it
  // improves the placeholder quality significantly.
  w: 100,

  // The image requires some blurring since it may be stretched large. This
  // softens the pixelation.
  blur: 15,

  // Since this is a low quality placeholer, we can drop down the quality.
  q: 20,
}

const extractURLParts = (url: string) => {
  const instance = new URL(url)
  const baseURL = instance.origin + instance.pathname
  const urlParams = instance.searchParams

  return { baseURL, urlParams }
}

const buildURL = (
  url: string,
  params: ImgixUrlQueryParams & { rect?: string },
) => buildImgixUrl(url)({ ...DEFAULT_PARAMS, ...params })

const buildPlaceholderURL = (
  url: string,
  params: ImgixUrlQueryParams & { rect?: string },
) => buildURL(url, { ...DEFAULT_PLACEHOLDER_PARAMS, ...params })

const buildFixedSrcSet = (
  baseURL: string,
  params: ImgixUrlQueryParams & { rect?: string },
  resolutions: number[] = DEFAULT_FIXED_RESOLUTIONS,
) =>
  resolutions
    .map(resolution => {
      const url = buildURL(baseURL, { ...params, dpr: resolution })
      return `${url} ${resolution}x`
    })
    .join(', ')

const buildFluidSrcSet = (
  baseURL: string,
  params: ImgixUrlQueryParams & { w: number; rect?: string },
  breakpoints?: number[],
) => {
  const { w: width } = params

  if (!breakpoints)
    breakpoints = DEFAULT_FLUID_BREAKPOINT_FACTORS.map(x => width * x)

  // Remove duplicates, sort by numerical value, and ensure maxWidth is added.
  const uniqSortedBreakpoints = [...new Set([...breakpoints, width].sort())]

  return uniqSortedBreakpoints
    .map(breakpoint => {
      if (!breakpoint) return
      const url = buildURL(baseURL, { ...params, w: breakpoint })
      return `${url} ${breakpoint}w`
    })
    .filter(Boolean)
    .join(', ')
}

export const buildFixedGatsbyImage = (
  url: string,
  sourceWidth: number,
  sourceHeight: number,
  args: GatsbyImageFixedArgs = {},
): GatsbyFixedImageProps => {
  const { baseURL, urlParams } = extractURLParts(url)

  const rect = urlParams.get('rect') ?? undefined
  const aspectRatio = sourceWidth / sourceHeight
  const width = args.width ?? DEFAULT_FIXED_WIDTH
  const height = args.height ?? Math.round(width / aspectRatio)
  const quality = args.quality

  const base64 = buildPlaceholderURL(baseURL, { rect })
  const src = buildURL(baseURL, { w: width, h: height, rect, q: quality })
  const srcSet = buildFixedSrcSet(baseURL, {
    w: width,
    h: height,
    rect,
    q: quality,
  })

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

export const buildFluidGatsbyImage = (
  url: string,
  sourceWidth: number,
  sourceHeight: number,
  args: GatsbyImageFluidArgs = {},
): GatsbyFluidImageProps => {
  const { baseURL, urlParams } = extractURLParts(url)

  const rect = urlParams.get('rect') ?? undefined
  const aspectRatio = sourceWidth / sourceHeight
  const width = args.maxWidth ?? DEFAULT_FLUID_MAX_WIDTH
  const height = args.maxHeight ?? Math.round(width / aspectRatio)
  const quality = args.quality
  const breakpoints = args.srcSetBreakpoints

  const base64 = buildPlaceholderURL(baseURL, { rect })
  const src = buildURL(baseURL, { w: width, h: height, rect, q: quality })
  const srcSet = buildFluidSrcSet(
    baseURL,
    { w: width, h: height, rect, q: quality },
    breakpoints,
  )

  return {
    base64,
    aspectRatio,
    src,
    srcWebp: src,
    srcSet,
    srcSetWebp: srcSet,
    sizes: '',
  }
}

const resolveFluid = (
  source: NormalizedImageField,
  args: GatsbyImageFluidArgs,
) =>
  source.url
    ? buildFluidGatsbyImage(
        source.url,
        source.dimensions!.width,
        source.dimensions!.height,
        args,
      )
    : undefined

const resolveFixed = (
  source: NormalizedImageField,
  args: GatsbyImageFixedArgs,
) =>
  source.url
    ? buildFixedGatsbyImage(
        source.url,
        source.dimensions!.width,
        source.dimensions!.height,
        args,
      )
    : undefined

export const resolvers = {
  [GraphQLType.Image]: {
    fixed: { resolve: resolveFixed },
    fluid: { resolve: resolveFluid },
  },
  [GraphQLType.ImageThumbnail]: {
    fixed: { resolve: resolveFixed },
    fluid: { resolve: resolveFluid },
  },
}
