import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as RE from 'fp-ts/ReaderEither'
import * as O from 'fp-ts/Option'
import { pipe, Refinement } from 'fp-ts/function'
import { NodeHelpers } from 'gatsby-node-helpers'

import {
  HTMLSerializer,
  LinkResolver,
  PluginOptions,
  PrismicAPIDocumentNodeInput,
  UnknownRecord,
} from '../types'
import { FIELD_VALUE_TYPE_PATH_MISMATCH_MSG } from '../constants'

import * as documentDataFieldProxy from '../fieldProxies/documentDataFieldProxy'
import * as documentFieldProxy from '../fieldProxies/documentFieldProxy'
import * as groupFieldProxy from '../fieldProxies/groupFieldProxy'
import * as imageFieldProxy from '../fieldProxies/imageFieldProxy'
import * as linkFieldProxy from '../fieldProxies/linkFieldProxy'
import * as sliceFieldProxy from '../fieldProxies/sliceFieldProxy'
import * as slicesFieldProxy from '../fieldProxies/slicesFieldProxy'
import * as structuredTextFieldProxy from '../fieldProxies/structuredTextFieldProxy'

import { sprintf } from './sprintf'
import { serializePath } from './serializePath'

const refineValue = <A, B extends A>(
  refinement: Refinement<A, B>,
  intendedType: gatsbyPrismic.PrismicTypePathType,
) =>
  RE.fromPredicate(
    refinement,
    () => new Error(sprintf(FIELD_VALUE_TYPE_PATH_MISMATCH_MSG, intendedType)),
  )

export interface ProxyDocumentSubtreeEnv {
  getTypePath(path: string[]): gatsbyPrismic.PrismicTypePathType | undefined
  getNode(id: string): PrismicAPIDocumentNodeInput | undefined
  linkResolver: LinkResolver
  htmlSerializer?: HTMLSerializer
  imageImgixParams: PluginOptions['imageImgixParams']
  imagePlaceholderImgixParams: PluginOptions['imagePlaceholderImgixParams']
  nodeHelpers: NodeHelpers
  createContentDigest(input: string | UnknownRecord): string
}

export const proxyDocumentSubtree = (
  path: string[],
  value: unknown,
): RE.ReaderEither<ProxyDocumentSubtreeEnv, Error, unknown> =>
  pipe(
    RE.ask<ProxyDocumentSubtreeEnv>(),
    RE.bindW('type', (env) =>
      pipe(
        O.fromNullable(env.getTypePath(path)),
        RE.fromOption(
          () => new Error(`No type for path: ${serializePath(path)}`),
        ),
      ),
    ),
    RE.chain((env) => {
      switch (env.type) {
        case gatsbyPrismic.PrismicSpecialType.Document: {
          return pipe(
            value,
            refineValue(documentFieldProxy.valueRefinement, env.type),
            RE.chainW((value) => documentFieldProxy.proxyValue(path, value)),
          )
        }

        case gatsbyPrismic.PrismicSpecialType.DocumentData: {
          return pipe(
            value,
            refineValue(documentDataFieldProxy.valueRefinement, env.type),
            RE.chainW((value) =>
              documentDataFieldProxy.proxyValue(path, value),
            ),
          )
        }

        case gatsbyPrismic.PrismicFieldType.Group: {
          return pipe(
            value,
            refineValue(groupFieldProxy.valueRefinement, env.type),
            RE.chain((value) => groupFieldProxy.proxyValue(path, value)),
          )
        }

        case gatsbyPrismic.PrismicFieldType.Slices: {
          return pipe(
            value,
            refineValue(slicesFieldProxy.valueRefinement, env.type),
            RE.chain((value) => slicesFieldProxy.proxyValue(path, value)),
          )
        }

        case gatsbyPrismic.PrismicFieldType.Slice: {
          return pipe(
            value,
            refineValue(sliceFieldProxy.valueRefinement, env.type),
            RE.chain((value) => sliceFieldProxy.proxyValue(path, value)),
          )
        }

        case gatsbyPrismic.PrismicFieldType.Link: {
          return pipe(
            value,
            refineValue(linkFieldProxy.valueRefinement, env.type),
            RE.chain(linkFieldProxy.proxyValue),
          )
        }

        case gatsbyPrismic.PrismicFieldType.Image: {
          return pipe(
            value,
            refineValue(imageFieldProxy.valueRefinement, env.type),
            RE.chain(imageFieldProxy.proxyValue),
          )
        }

        case gatsbyPrismic.PrismicFieldType.StructuredText: {
          return pipe(
            value,
            refineValue(structuredTextFieldProxy.valueRefinement, env.type),
            RE.chain(structuredTextFieldProxy.proxyValue),
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
          return RE.of(value)
        }
      }
    }),
  )
