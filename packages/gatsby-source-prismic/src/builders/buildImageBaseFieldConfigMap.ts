import * as imgixGatsby from '@imgix/gatsby/dist/pluginHelpers'
import { pipe } from 'fp-ts/function'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as gatsbyFs from 'gatsby-source-filesystem'
import * as gqlc from 'graphql-compose'
import { Dependencies, PrismicAPIImageField } from '../types'

/**
 * Returns the URL of an image from the value of an Image field.
 *
 * @param source Image field data.
 *
 * @returns The URL of the image if an image is provided, `null` otherwise.
 */
const resolveUrl = (source: PrismicAPIImageField): string | null => source.url

/**
 * Returns the width of an image from the value of an Image field.
 *
 * @param source Image field data.
 *
 * @returns The width of the image if an image is provided, `undefined` otherwise.
 */
const resolveWidth = (source: PrismicAPIImageField): number | undefined =>
  source.dimensions?.width

/**
 * Returns the height of an image from the value of an Image field.
 *
 * @param source Image field data.
 *
 * @returns The height of the image if an image is provided, `undefined` otherwise.
 */
const resolveHeight = (source: PrismicAPIImageField): number | undefined =>
  source.dimensions?.height

/**
 * Builds a GraphQL field configuration object to be used as part of another
 * Image field GraphQL configuration object. For example, this base
 * configuration object could be added to a config for the thumbnails of an
 * Image field.
 */
export const buildImageBaseFieldConfigMap: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gqlc.ObjectTypeComposerFieldConfigMapDefinition<PrismicAPIImageField, unknown>
> = pipe(
  RTE.asks((deps) => {
    const imgixTypes = imgixGatsby.createImgixGatsbyTypes({
      cache: deps.cache,
      resolveUrl,
      resolveWidth,
      resolveHeight,
      defaultParams: deps.pluginOptions.imageImgixParams,
      namespace: 'Imgix',
    })

    return {
      alt: 'String',
      copyright: 'String',
      dimensions: deps.globalNodeHelpers.createTypeName('ImageDimensionsType'),
      url: imgixTypes.fields.url,
      fixed: imgixTypes.fields.fixed,
      fluid: imgixTypes.fields.fluid,
      gatsbyImageData: imgixTypes.fields.gatsbyImageData,
      localFile: {
        type: 'File',
        resolve: async (
          source: PrismicAPIImageField,
        ): Promise<gatsbyFs.FileSystemNode | null> =>
          source.url
            ? await deps.createRemoteFileNode({
                url: source.url,
                store: deps.store,
                cache: deps.cache,
                createNode: deps.createNode,
                createNodeId: deps.createNodeId,
                reporter: deps.reporter,
              })
            : null,
      },
    }
  }),
)
