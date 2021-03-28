import { LinkResolver } from 'gatsby-plugin-prismic-previews'

export const linkResolver: LinkResolver = (doc) => `/${doc.uid}/`
