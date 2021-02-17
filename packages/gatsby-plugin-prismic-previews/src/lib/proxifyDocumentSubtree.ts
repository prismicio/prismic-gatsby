import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as gatsbyImgix from 'gatsby-plugin-imgix'
import * as PrismicDOM from 'prismic-dom'
import * as RE from 'fp-ts/ReaderEither'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

import {
  HTMLSerializer,
  LinkResolver,
  PluginOptions,
  PrismicAPIDocumentNodeInput,
  UnknownRecord,
} from '../types'
import {
  getProxiedLinkFieldValue,
  linkFieldValueRefinement,
} from '../fieldProxies/getProxiedLinkFieldValue'

export interface ProxifyDocumentSubtreeEnv {
  getTypePath(path: string[]): gatsbyPrismic.PrismicTypePathType | undefined
  getNode(id: string): PrismicAPIDocumentNodeInput | undefined
  linkResolver: LinkResolver
  htmlSerializer?: HTMLSerializer
  imageImgixParams: PluginOptions['imageImgixParams']
  imagePlaceholderImgixParams: PluginOptions['imagePlaceholderImgixParams']
}

// TODO: Test if this works for arrays like Group and Slice fields.
const proxyGetProgram = <T extends UnknownRecord>(
  path: string[],
  target: T,
  prop: string,
  receiver: unknown,
): RE.ReaderEither<ProxifyDocumentSubtreeEnv, Error, unknown> =>
  pipe(
    RE.ask<ProxifyDocumentSubtreeEnv>(),
    RE.bindW('type', (env) =>
      pipe(
        O.fromNullable(env.getTypePath([...path, prop as string])),
        RE.fromOption(() => new Error('No type for path')),
      ),
    ),
    RE.bind('propPath', () => RE.of([...path, prop])),
    RE.bind('propValue', () => RE.of(target[prop as string])),
    RE.chain((env) => {
      switch (env.type) {
        case gatsbyPrismic.PrismicSpecialType.DocumentData: {
          return proxifyDocumentSubtree2(
            env.propPath,
            env.propValue as UnknownRecord,
          )
        }

        case gatsbyPrismic.PrismicFieldType.Link: {
          return pipe(
            env.propValue,
            RE.fromPredicate(
              linkFieldValueRefinement,
              () =>
                new Error(
                  'Prop value does not match type declared in type path',
                ),
            ),
            RE.chain(getProxiedLinkFieldValue),
          )
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
          return RE.throwError(new Error('No proxy handler for field type'))
        }
      }
    }),
    RE.orElse(() => Reflect.get(target, prop, receiver)),
  )

export const proxifyDocumentSubtree2 = <T extends UnknownRecord>(
  path: string[],
  input: T,
): RE.ReaderEither<ProxifyDocumentSubtreeEnv, never, T> =>
  pipe(
    RE.ask<ProxifyDocumentSubtreeEnv>(),
    RE.map(
      (env) =>
        new Proxy(input, {
          get: (target, prop, receiver): unknown =>
            pipe(
              RE.of(prop),
              RE.filterOrElseW(
                (prop): prop is string => typeof prop === 'string',
                () => new Error('Unsupported prop type'),
              ),
              RE.chainW((prop) =>
                proxyGetProgram(path, target, prop, receiver),
              ),
              (program) => program(env),
              E.getOrElse(() => Reflect.get(target, prop, receiver)),
            ),
        }),
    ),
  )

// TODO: Refactor to use ReaderTaskEither
export const proxifyDocumentSubtree = <T extends UnknownRecord>(
  path: string[],
  input: T,
) => (env: ProxifyDocumentSubtreeEnv): T =>
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
        case gatsbyPrismic.PrismicSpecialType.DocumentData: {
          const propValue = target[prop] as Record<string, unknown>

          return proxifyDocumentSubtree([...path, prop], propValue)(env)
        }

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
          const sourceWidth = propValue.dimensions?.width
          const sourceHeight = propValue.dimensions?.height

          if (!url || !sourceWidth || !sourceHeight) {
            return propValue
          }

          const args = {
            imgixParams: env.imageImgixParams,
            placeholderImgixParams: env.imagePlaceholderImgixParams,
          }

          const fixed = gatsbyImgix.buildImgixFixed({
            url,
            sourceWidth,
            sourceHeight,
            args,
          })

          const fluid = gatsbyImgix.buildImgixFluid({
            url,
            sourceWidth,
            sourceHeight,
            args,
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

          return propValue.map((el) =>
            proxifyDocumentSubtree([...path, prop], el)(env),
          )
        }

        case gatsbyPrismic.PrismicFieldType.Slice: {
          const propValue = target[prop] as gatsbyPrismic.PrismicAPISliceField[]

          return propValue.map((el) => ({
            primary: proxifyDocumentSubtree([...path, 'primary'], el)(env),
            items: propValue.map((item) =>
              proxifyDocumentSubtree([...path, 'items'], item)(env),
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
