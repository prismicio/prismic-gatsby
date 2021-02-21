import * as gatsby from 'gatsby'
import * as gatsbyFs from 'gatsby-source-filesystem'
import * as PrismicDOM from 'prismic-dom'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, identity } from 'fp-ts/function'

import { buildObjectType } from '../lib/buildObjectType'

import { Dependencies, PrismicAPILinkField } from '../types'

export const buildLinkType: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    buildObjectType({
      name: deps.nodeHelpers.createTypeName('LinkType'),
      fields: {
        link_type: deps.globalNodeHelpers.createTypeName('LinkTypeEnum'),
        isBroken: 'Boolean',
        url: {
          type: 'String',
          resolve: (source: PrismicAPILinkField) =>
            source.link_type === 'Document'
              ? PrismicDOM.Link.url(source, deps.pluginOptions.linkResolver)
              : source.url,
        },
        target: 'String',
        size: 'Int',
        id: 'ID',
        type: 'String',
        tags: '[String]',
        lang: 'String',
        slug: 'String',
        uid: 'String',
        document: {
          type: deps.nodeHelpers.createTypeName('AllDocumentTypes'),
          resolve: (source: PrismicAPILinkField) =>
            source.link_type === 'Document' &&
            source.type &&
            source.id &&
            !source.isBroken
              ? deps.nodeHelpers.createNodeId(source.type, source.id)
              : null,
          extensions: { link: {} },
        },
        localFile: {
          type: 'File',
          resolve: async (source: PrismicAPILinkField) =>
            source.url && source.link_type === 'Media'
              ? await gatsbyFs.createRemoteFileNode({
                  url: source.url,
                  store: deps.store,
                  cache: deps.cache,
                  createNode: deps.createNode,
                  createNodeId: deps.createNodeId,
                  reporter: deps.reporter,
                })
              : null,
        },
        raw: { type: 'JSON', resolve: identity },
      },
    }),
  ),
)
