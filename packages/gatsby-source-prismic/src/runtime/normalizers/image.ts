import * as prismicT from '@prismicio/types'
import * as gatsbyImage from 'gatsby-image'
import * as gatsbyPluginImage from 'gatsby-plugin-image'
import * as imgixGatsby from '@imgix/gatsby'
import * as imgixGatsbyHelpers from '@imgix/gatsby/dist/pluginHelpers.browser'
import { NormalizeConfig, NormalizerDependencies } from '../types'

const sanitizeImageURL = (url: string): string =>
  decodeURIComponent(url.replace(/\+/g, ' '))

const getURLSearchParams = (url: string): Record<string, string> => {
  const urlInstance = new URL(url)
  const result: Record<string, string> = {}

  for (const [key, value] of urlInstance.searchParams.entries()) {
    result[key] = value
  }

  return result
}

export const isImageField = (value: unknown): value is prismicT.ImageField => {
  // Unfortunately, we can't check for specific properties here since it's
  // possible for the object to be empty if an image was never set.
  return typeof value === 'object' && value !== null
}

export type NormalizeImageConfig<
  Value extends prismicT.ImageField = prismicT.ImageField
> = NormalizeConfig<Value> &
  Pick<
    NormalizerDependencies,
    'imageImgixParams' | 'imagePlaceholderImgixParams'
  >

type NormalizedImageBase<Value extends prismicT.ImageFieldImage> = Value & {
  url: string | null
  fixed: gatsbyImage.FixedObject | null
  fluid: gatsbyImage.FluidObject | null
  gatsbyImageData: gatsbyPluginImage.IGatsbyImageData | null
  localFile: {
    childImageSharp: {
      fixed: gatsbyImage.FixedObject
      fluid: gatsbyImage.FluidObject
      gatsbyImageData: gatsbyPluginImage.IGatsbyImageData
    }
  } | null
}

export type NormalizedImageValue<
  Value extends prismicT.ImageField
> = NormalizedImageBase<Value> & {
  thumbnails: Record<string, NormalizedImageBase<prismicT.ImageFieldImage>>
}

type BuildImageFieldConfig<Value extends prismicT.ImageFieldImage> = {
  value: Value
  imageImgixParams: imgixGatsby.ImgixUrlParams
  imagePlaceholderImgixParams: imgixGatsby.ImgixUrlParams
}

const buildImageField = <Value extends prismicT.ImageFieldImage>(
  config: BuildImageFieldConfig<Value>,
): NormalizedImageBase<Value> => {
  const imgixParams = {
    ...(config.value.url ? getURLSearchParams(config.value.url) : undefined),
    ...config.imageImgixParams,
  }
  const placeholderImgixParams = config.imagePlaceholderImgixParams

  const fixed =
    config.value.url && config.value.dimensions
      ? imgixGatsbyHelpers.buildFixedObject({
          url: config.value.url,
          args: {
            width: 400,
            imgixParams,
            placeholderImgixParams,
          },
          sourceWidth: config.value.dimensions.width,
          sourceHeight: config.value.dimensions.height,
        })
      : null

  const fluid =
    config.value.url && config.value.dimensions
      ? imgixGatsbyHelpers.buildFluidObject({
          url: config.value.url,
          args: {
            maxWidth: 800,
            imgixParams,
            placeholderImgixParams,
          },
          sourceWidth: config.value.dimensions.width,
          sourceHeight: config.value.dimensions.height,
        })
      : null

  const gatsbyImageData =
    config.value.url && config.value.dimensions
      ? imgixGatsbyHelpers.buildGatsbyImageDataObject({
          url: config.value.url,
          dimensions: config.value.dimensions,
          defaultParams: imgixParams,
          resolverArgs: {},
        })
      : null

  return {
    url: config.value.url ? sanitizeImageURL(config.value.url) : null,
    alt: config.value.alt,
    copyright: config.value.copyright,
    dimensions: config.value.dimensions,
    fixed,
    fluid,
    gatsbyImageData,
    localFile:
      config.value.url && config.value.dimensions
        ? {
            publicURL: config.value.url,
            childImageSharp: {
              fixed,
              fluid,
              gatsbyImageData,
            },
          }
        : null,
  } as NormalizedImageBase<Value>
}

export const image = <Value extends prismicT.ImageField>(
  config: NormalizeImageConfig<Value>,
): NormalizedImageValue<Value> => {
  const result: NormalizedImageValue<Value> = {
    ...buildImageField({
      value: config.value,
      imageImgixParams: config.imageImgixParams,
      imagePlaceholderImgixParams: config.imagePlaceholderImgixParams,
    }),
    thumbnails: {},
  }

  const thumbnailNames = Object.keys(config.value).filter(
    (key) => !['url', 'alt', 'copyright', 'dimensions'].includes(key),
  )

  for (const thumbnailName of thumbnailNames) {
    result.thumbnails[
      thumbnailName as keyof typeof result.thumbnails
    ] = buildImageField({
      value: config.value[thumbnailName],
      imageImgixParams: config.imageImgixParams,
      imagePlaceholderImgixParams: config.imagePlaceholderImgixParams,
    })
  }

  return result
}
