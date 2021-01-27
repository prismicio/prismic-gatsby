import { LinkResolver } from 'gatsby-plugin-prismic-previews-2'

export const linkResolver: LinkResolver = (doc) => `/${doc.uid}`
