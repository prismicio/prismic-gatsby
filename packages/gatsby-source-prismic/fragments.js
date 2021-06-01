// NOTE: The fragments provided here are deprecated.
// They are effectively aliases for @imgix/gatsby's official fragments. These
// are kept around to ease the migration from V3 to V4.

import { graphql } from 'gatsby'

export const GatsbyPrismicImageFixed = graphql`
  fragment GatsbyPrismicImageFixed on ImgixFixed {
    ...GatsbyImgixFixed
  }
`

export const GatsbyPrismicImageFixed_noBase64 = graphql`
  fragment GatsbyPrismicImageFixed_noBase64 on ImgixFixed {
    ...GatsbyImgixFixed_noBase64
  }
`

// Not actually necessary since applying `auto=format` to the source URL
// automatically returns WebP for all URLs.
export const GatsbyPrismicImageFixed_withWebp = graphql`
  fragment GatsbyPrismicImageFixed_withWebp on ImgixFixed {
    ...GatsbyImgixFixed
  }
`

// Not actually necessary since applying `auto=format` to the source URL
// automatically returns WebP for all URLs.
export const GatsbyPrismicImageFixed_withWebp_noBase64 = graphql`
  fragment GatsbyPrismicImageFixed_withWebp_noBase64 on ImgixFixed {
    ...GatsbyImgixFixed_noBase64
  }
`

export const GatsbyPrismicImageFluid = graphql`
  fragment GatsbyPrismicImageFluid on ImgixFluid {
    ...GatsbyImgixFluid
  }
`

export const GatsbyPrismicImageFluid_noBase64 = graphql`
  fragment GatsbyPrismicImageFluid_noBase64 on ImgixFluid {
    ...GatsbyImgixFluid_noBase64
  }
`

// Not actually necessary - since Imgix is scaling,
// there is no "penalty" for including WebP by default
export const GatsbyPrismicImageFluid_withWebp = graphql`
  fragment GatsbyPrismicImageFluid_withWebp on ImgixFluid {
    ...GatsbyImgixFluid
  }
`

// Not actually necessary - since Imgix is scaling,
// there is no "penalty" for including WebP by default
export const GatsbyPrismicImageFluid_withWebp_noBase64 = graphql`
  fragment GatsbyPrismicImageFluid_withWebp_noBase64 on ImgixFluid {
    ...GatsbyImgixFluid_noBase64
  }
`
