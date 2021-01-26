import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as gatsbyImgix from 'gatsby-plugin-imgix'
import * as PrismicDOM from 'prismic-dom'

import {
  HTMLSerializer,
  LinkResolver,
  PluginOptions,
  PrismicAPIDocumentNodeInput,
  UnknownRecord,
} from '../types'

// interface ProxifyFieldEnv {
//   typePaths: TypePathsStore
//   nodes: Record<string, PrismicAPIDocumentNodeInput>
//   linkResolver: PluginOptions['linkResolver']
// }

// const linkFieldDocument = (
//   value: gatsbyPrismic.PrismicAPILinkField,
// ): RT.ReaderTask<ProxifyFieldEnv, PrismicAPIDocumentNodeInput | null> =>
//   pipe(
//     RTE.ask<ProxifyFieldEnv>(),
//     RTE.filterOrElse(
//       () =>
//         Boolean(value.link_type === 'Document' && !value.isBroken && value.id),
//       () => new Error('Not a document link'),
//     ),
//     RTE.bindW('linkedDocumentId', () =>
//       pipe(
//         O.fromNullable(value.id),
//         RTE.fromOption(() => new Error('Document ID missing')),
//       ),
//     ),
//     RTE.chainW((env) =>
//       pipe(
//         env.nodes,
//         R.lookup(env.linkedDocumentId),
//         RTE.fromOption(() => new Error('Document not in store')),
//       ),
//     ),
//     RTE.getOrElseW(() => RT.of(null)),
//   )

// const proxifyLinkField = <T extends gatsbyPrismic.PrismicAPILinkField>(
//   path: string[],
//   value: T,
// ): RTE.ReaderTaskEither<
//   ProxifyFieldEnv,
//   never,
//   T & {
//     url: string | null
//     document: PrismicAPIDocumentNodeInput | null
//   }
// > =>
//   pipe(
//     RTE.ask<ProxifyFieldEnv>(),
//     RTE.bind('url', (env) =>
//       RTE.of(PrismicDOM.Link.url(value, env.linkResolver)),
//     ),
//     RTE.bind('linkedDocument', () => RTE.from linkFieldDocument(value)),
//     // RTE.map((env) => ({
//     //   ...value,
//     //   url,
//     // })),
//   )

// const proxifyField = <T>(
//   path: string[] = [],
//   value: T,
// ): RTE.ReaderTaskEither<ProxifyFieldEnv, never, T> => pipe()

// const proxifyNodeInput = <
//   TData extends UnknownRecord,
//   TDocumentNodeInput extends PrismicAPIDocumentNodeInput<TData>
// >(
//   nodeInput: TDocumentNodeInput,
// ): RTE.ReaderTaskEither<ProxifyFieldEnv, never, TDocumentNodeInput> => pipe()

// export interface ProxifyDocumentNodeInputEnv {
//   typePaths: TypePathsStore
// }

// export const proxifyDocumentNodeInput = <
//   TData extends UnknownRecord,
//   TDocumentNodeInput extends PrismicAPIDocumentNodeInput<TData>
// >(
//   nodeInput: TDocumentNodeInput,
// ): RTE.ReaderTaskEither<
//   ProxifyDocumentNodeInputEnv,
//   never,
//   TDocumentNodeInput
// > => proxifyField([nodeInput.type], nodeInput)

interface ProxifyDocumentNodeInputEnv {
  getTypePath(path: string[]): gatsbyPrismic.PrismicTypePathType
  getNode(id: string): PrismicAPIDocumentNodeInput | undefined
  linkResolver: LinkResolver
  htmlSerializer?: HTMLSerializer
  imageImgixParams: PluginOptions['imageImgixParams']
  imagePlaceholderImgixParams: PluginOptions['imagePlaceholderImgixParams']
}

const proxifyRecord = <T extends UnknownRecord>(path: string[], input: T) => (
  env: ProxifyDocumentNodeInputEnv,
): T =>
  new Proxy(input, {
    get(target, prop, receiver): unknown {
      if (typeof prop !== 'string') {
        return Reflect.get(target, prop, receiver)
      }

      const type = env.getTypePath([...path, prop])
      if (!type) {
        return Reflect.get(target, prop, receiver)
      }

      switch (type) {
        case gatsbyPrismic.PrismicFieldType.Link: {
          const propValue = target[prop] as gatsbyPrismic.PrismicAPILinkField
          const enhancedPropValue = {
            ...propValue,
            url: PrismicDOM.Link.url(propValue, env.linkResolver),
            raw: propValue,
          }

          return new Proxy(enhancedPropValue, {
            get(
              target,
              prop: keyof typeof propValue | 'document',
              receiver,
            ): unknown {
              switch (prop) {
                case 'document': {
                  if (propValue.link_type === 'Document' && propValue.id) {
                    const linkedDocument = env.getNode(propValue.id)
                    if (linkedDocument) {
                      return linkedDocument
                    }
                  }

                  return Reflect.get(target, prop, receiver)
                }
              }

              return Reflect.get(target, prop, receiver)
            },
          })
        }

        // TODO: Handle thumbnails
        case gatsbyPrismic.PrismicFieldType.Image: {
          const propValue = target[prop] as gatsbyPrismic.PrismicAPIImageField

          const url = propValue.url
          if (!url) {
            return propValue
          }

          const fixed = gatsbyImgix.buildImgixFixed({
            url,
            sourceWidth: propValue.dimensions.width,
            sourceHeight: propValue.dimensions.height,
            args: {
              imgixParams: env.imageImgixParams,
              placeholderImgixParams: env.imagePlaceholderImgixParams,
            },
          })

          const fluid = gatsbyImgix.buildImgixFluid({
            url,
            sourceWidth: propValue.dimensions.width,
            sourceHeight: propValue.dimensions.height,
            args: {
              imgixParams: env.imageImgixParams,
              placeholderImgixParams: env.imagePlaceholderImgixParams,
            },
          })

          return { ...propValue, fixed, fluid }
        }

        case gatsbyPrismic.PrismicFieldType.StructuredText: {
          const propValue = target[
            prop
          ] as gatsbyPrismic.PrismicAPIStructuredTextField

          return {
            html: PrismicDOM.RichText.asHtml(
              propValue,
              env.linkResolver,
              env.htmlSerializer,
            ),
            text: PrismicDOM.RichText.asText(propValue),
            raw: propValue,
          }
        }

        case gatsbyPrismic.PrismicFieldType.Group:
        case gatsbyPrismic.PrismicFieldType.Slices: {
          const propValue = target[prop] as UnknownRecord[]

          return propValue.map((el) => proxifyRecord([...path, prop], el)(env))
        }

        case gatsbyPrismic.PrismicFieldType.Slice: {
          const propValue = target[prop] as gatsbyPrismic.PrismicAPISliceField[]

          return propValue.map((el) => ({
            primary: proxifyRecord([...path, 'primary'], el)(env),
            items: propValue.map((item) =>
              proxifyRecord([...path, 'items'], item)(env),
            ),
          }))
        }

        case gatsbyPrismic.PrismicFieldType.Boolean:
        case gatsbyPrismic.PrismicFieldType.Color:
        case gatsbyPrismic.PrismicFieldType.Date:
        case gatsbyPrismic.PrismicFieldType.Embed:
        case gatsbyPrismic.PrismicFieldType.GeoPoint:
        case gatsbyPrismic.PrismicFieldType.Number:
        case gatsbyPrismic.PrismicFieldType.Select:
        case gatsbyPrismic.PrismicFieldType.Text:
        case gatsbyPrismic.PrismicFieldType.Timestamp:
        case gatsbyPrismic.PrismicFieldType.UID:
        default: {
          return Reflect.get(target, prop, receiver)
        }
      }
    },
  })

export const proxifyDocumentNodeInput = <T extends PrismicAPIDocumentNodeInput>(
  nodeInput: T,
) => (env: ProxifyDocumentNodeInputEnv): T =>
  proxifyRecord([nodeInput.type], nodeInput)(env)
