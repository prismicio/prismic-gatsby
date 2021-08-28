import * as gatsbyPluginImage from 'gatsby-plugin-image'

export const generateImageSource: gatsbyPluginImage.IGatsbyImageHelperArgs['generateImageSource'] =
  (filename, width, height, format, fit, options) => {
    const src = filename

    return {
      src,
      width,
      height,
      format,
    }
  }
