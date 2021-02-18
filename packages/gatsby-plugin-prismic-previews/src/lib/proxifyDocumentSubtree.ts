import * as gatsbyPrismic from 'gatsby-source-prismic'
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
import { FIELD_VALUE_TYPE_PATH_MISMATCH_MSG } from '../constants'

import * as groupFieldProxy from '../fieldProxies/groupFieldProxy'
import * as imageFieldProxy from '../fieldProxies/imageFieldProxy'
import * as linkFieldProxy from '../fieldProxies/linkFieldProxy'
import * as sliceFieldProxy from '../fieldProxies/sliceFieldProxy'
import * as slicesFieldProxy from '../fieldProxies/slicesFieldProxy'
import * as structuredTextFieldProxy from '../fieldProxies/structuredTextFieldProxy'

import { sprintf } from './sprintf'
import { serializePath } from './serializePath'

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
): RE.ReaderEither<ProxifyDocumentSubtreeEnv, Error, unknown> =>
  pipe(
    RE.ask<ProxifyDocumentSubtreeEnv>(),
    RE.bind('propPath', () => RE.of([...path, prop])),
    RE.bind('propValue', () => RE.of(target[prop as string])),
    RE.bindW('type', (env) =>
      pipe(
        O.fromNullable(env.getTypePath(env.propPath)),
        RE.fromOption(
          () => new Error(`No type for path: ${serializePath(env.propPath)}`),
        ),
      ),
    ),
    RE.chain((env) => {
      switch (env.type) {
        case gatsbyPrismic.PrismicSpecialType.DocumentData: {
          return pipe(
            env.propValue,
            RE.fromPredicate(
              (propValue): propValue is UnknownRecord =>
                typeof propValue === 'object' && propValue !== null,
              () =>
                new Error(
                  sprintf(FIELD_VALUE_TYPE_PATH_MISMATCH_MSG, env.type),
                ),
            ),
            RE.chainW((propValue) =>
              proxyDocumentSubtree(env.propPath, propValue),
            ),
          )
        }

        case gatsbyPrismic.PrismicFieldType.Group: {
          return pipe(
            env.propValue,
            RE.fromPredicate(
              groupFieldProxy.valueRefinement,
              () =>
                new Error(
                  sprintf(FIELD_VALUE_TYPE_PATH_MISMATCH_MSG, env.type),
                ),
            ),
            RE.chain((propValue) =>
              groupFieldProxy.proxyValue(env.propPath, propValue),
            ),
          )
        }

        case gatsbyPrismic.PrismicFieldType.Slices: {
          return pipe(
            env.propValue,
            RE.fromPredicate(
              slicesFieldProxy.valueRefinement,
              () =>
                new Error(
                  sprintf(FIELD_VALUE_TYPE_PATH_MISMATCH_MSG, env.type),
                ),
            ),
            RE.chain((propValue) =>
              slicesFieldProxy.proxyValue(env.propPath, propValue),
            ),
          )
        }

        case gatsbyPrismic.PrismicFieldType.Slice: {
          return pipe(
            env.propValue,
            RE.fromPredicate(
              sliceFieldProxy.valueRefinement,
              () =>
                new Error(
                  sprintf(FIELD_VALUE_TYPE_PATH_MISMATCH_MSG, env.type),
                ),
            ),
            RE.chain((propValue) =>
              sliceFieldProxy.proxyValue(env.propPath, propValue),
            ),
          )
        }

        case gatsbyPrismic.PrismicFieldType.Link: {
          return pipe(
            env.propValue,
            RE.fromPredicate(
              linkFieldProxy.valueRefinement,
              () =>
                new Error(
                  sprintf(FIELD_VALUE_TYPE_PATH_MISMATCH_MSG, env.type),
                ),
            ),
            RE.chain(linkFieldProxy.proxyValue),
          )
        }

        case gatsbyPrismic.PrismicFieldType.Image: {
          return pipe(
            env.propValue,
            RE.fromPredicate(
              imageFieldProxy.valueRefinement,
              () =>
                new Error(
                  sprintf(FIELD_VALUE_TYPE_PATH_MISMATCH_MSG, env.type),
                ),
            ),
            RE.chain(imageFieldProxy.proxyValue),
          )
        }

        case gatsbyPrismic.PrismicFieldType.StructuredText: {
          return pipe(
            env.propValue,
            RE.fromPredicate(
              structuredTextFieldProxy.valueRefinement,
              () =>
                new Error(
                  sprintf(FIELD_VALUE_TYPE_PATH_MISMATCH_MSG, env.type),
                ),
            ),
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
        case gatsbyPrismic.PrismicFieldType.UID: {
          return RE.of(env.propValue)
        }

        default: {
          return RE.throwError(new Error('No proxy handler for field type'))
        }
      }
    }),
    RE.orElse(() => proxyDocumentSubtree([...path, prop], target[prop])),
  )

export const proxyDocumentSubtree = (
  path: string[],
  input: unknown,
): RE.ReaderEither<ProxifyDocumentSubtreeEnv, Error, unknown> =>
  pipe(
    RE.ask<ProxifyDocumentSubtreeEnv>(),
    RE.chainW((env) =>
      pipe(
        input,
        RE.fromPredicate(
          (input): input is UnknownRecord =>
            typeof input === 'object' && input !== null,
          () => new Error('Target is an unsupported type'),
        ),
        RE.map(
          (input) =>
            new Proxy(input, {
              get: (target, prop, receiver): unknown =>
                pipe(
                  RE.of(prop),
                  RE.filterOrElseW(
                    (prop): prop is string => typeof prop === 'string',
                    () => new Error('Unsupported prop type'),
                  ),
                  RE.chainW((prop) => proxyGetProgram(path, target, prop)),
                  (program) => program(env),
                  E.getOrElse(() => Reflect.get(target, prop, receiver)),
                ),
            }),
        ),
      ),
    ),
  )
