import { NodePluginSchema, GatsbyCache } from 'gatsby'
import { ImgixUrlParams } from 'gatsby-plugin-imgix'
import {
  createImgixFixedType,
  createImgixFluidType,
  createImgixFixedSchemaFieldConfig,
  createImgixFluidSchemaFieldConfig,
  createImgixUrlSchemaFieldConfig,
} from 'gatsby-plugin-imgix/dist/node'

interface PartialPrismicImageType {
  url?: string
  dimensions?: {
    width: number
    height: number
  }
}

type BuildPrismicImageTypesArgs = {
  schema: NodePluginSchema
  cache: GatsbyCache
  defaultImgixParams?: ImgixUrlParams
  defaultPlaceholderImgixParams?: ImgixUrlParams
}

export const buildPrismicImageTypes = ({
  schema,
  cache,
  defaultImgixParams,
  defaultPlaceholderImgixParams,
}: BuildPrismicImageTypesArgs) => {
  const resolveUrl = (obj: PartialPrismicImageType) => obj.url
  const resolveWidth = (obj: PartialPrismicImageType) => obj.dimensions?.width
  const resolveHeight = (obj: PartialPrismicImageType) => obj.dimensions?.height

  const PrismicImageFixedType = createImgixFixedType({
    name: 'PrismicImageFixedType',
    cache,
  })

  const PrismicImageFluidType = createImgixFluidType({
    name: 'PrismicImageFluidType',
    cache,
  })

  const PrismicImageType = schema.buildObjectType({
    name: 'PrismicImageType',
    description: 'An image field with optional constrained thumbnails.',
    interfaces: ['PrismicImageInterface'],
    fields: {
      alt: 'String',
      copyright: 'String',
      dimensions: 'PrismicImageDimensionsType',
      url: createImgixUrlSchemaFieldConfig({
        resolveUrl,
        defaultImgixParams,
      }),
      fixed: createImgixFixedSchemaFieldConfig({
        type: PrismicImageFixedType,
        resolveUrl,
        resolveWidth,
        resolveHeight,
        cache,
        defaultImgixParams,
        defaultPlaceholderImgixParams,
      }),
      fluid: createImgixFluidSchemaFieldConfig({
        type: PrismicImageFluidType,
        resolveUrl,
        resolveWidth,
        resolveHeight,
        cache,
        defaultImgixParams,
        defaultPlaceholderImgixParams,
      }),
      localFile: {
        type: 'File',
        extensions: { link: {} },
      },
      thumbnails: 'PrismicImageThumbnailsType',
    },
  })

  const PrismicImageThumbnailType = schema.buildObjectType({
    name: 'PrismicImageThumbnailType',
    description: 'An image thumbnail with constraints.',
    interfaces: ['PrismicImageInterface'],
    fields: {
      alt: 'String',
      copyright: 'String',
      dimensions: 'PrismicImageDimensionsType',
      url: createImgixUrlSchemaFieldConfig({
        resolveUrl,
        defaultImgixParams,
      }),
      fixed: createImgixFixedSchemaFieldConfig({
        type: PrismicImageFixedType,
        resolveUrl,
        resolveWidth,
        resolveHeight,
        cache,
        defaultImgixParams,
      }),
      fluid: createImgixFluidSchemaFieldConfig({
        type: PrismicImageFluidType,
        resolveUrl,
        resolveWidth,
        resolveHeight,
        cache,
        defaultImgixParams,
      }),
      localFile: {
        type: 'File',
        extensions: { link: {} },
      },
    },
  })

  // The following types must be separated to in order to pass them separately
  // to two different `createTypes` calls in gatsby-node.ts. `createTypes`
  // requires that all passed types are of the same class.
  return [
    // Imgix GraphQLObjectType instances
    [PrismicImageFixedType, PrismicImageFluidType],
    // Prismic GatsbyGraphQLObjectType instances
    [PrismicImageType, PrismicImageThumbnailType],
  ]
}

type BuildTypesArgs = {
  schema: NodePluginSchema
}

export const buildTypes = ({ schema }: BuildTypesArgs) => {
  const PrismicStructuredTextType = schema.buildObjectType({
    name: 'PrismicStructuredTextType',
    description: 'A text field with formatting options.',
    fields: {
      html: {
        type: 'String',
        description:
          'The HTML value of the text using `prismic-dom` and the HTML serializer.',
      },
      text: {
        type: 'String',
        description: 'The plain text value of the text using `prismic-dom`.',
      },
      raw: {
        type: 'JSON',
        description:
          "The field's value without transformations exactly as it comes from the Prismic API.",
      },
    },
  })

  const PrismicGeoPointType = schema.buildObjectType({
    name: 'PrismicGeoPointType',
    description: 'A field for storing geo-coordinates.',
    fields: {
      latitude: {
        type: 'Float',
        description: 'The latitude value of the geo-coordinate.',
      },
      longitude: {
        type: 'Float',
        description: 'The latitude value of the geo-coordinate.',
      },
    },
  })

  const PrismicEmbedType = schema.buildObjectType({
    name: 'PrismicEmbedType',
    description: 'Embed videos, songs, tweets, slices, etc.',
    fields: {
      author_id: {
        type: 'ID',
        description: 'The ID of the resource author. Fetched via oEmbed data.',
      },
      author_name: {
        type: 'String',
        description:
          'The name of the author/owner of the resource. Fetched via oEmbed data.',
      },
      author_url: {
        type: 'String',
        description:
          'A URL for the author/owner of the resource. Fetched via oEmbed data.',
      },
      cache_age: {
        type: 'String',
        description:
          'The suggested cache lifetime for this resource, in seconds. Consumers may choose to use this value or not. Fetched via oEmbed data.',
      },
      embed_url: {
        type: 'String',
        description: 'The URL of the resource.',
      },
      html: {
        type: 'String',
        description:
          'The HTML required to display the resource. The HTML should have no padding or margins. Consumers may wish to load the HTML in an off-domain iframe to avoid XSS vulnerabilities. Fetched via oEmbed data.',
      },
      name: { type: 'String', description: 'The name of the resource.' },
      provider_name: {
        type: 'String',
        description:
          'The name of the resource provider. Fetched via oEmbed data.',
      },
      provider_url: {
        type: 'String',
        description:
          'The URL of the resource provider. Fetched via oEmbed data.',
      },
      thumbnail_height: {
        type: 'Int',
        description:
          "The width of the resource's thumbnail. Fetched via oEmbed data.",
      },
      thumbnail_url: {
        type: 'String',
        description:
          'A URL to a thumbnail image representing the resource. Fetched via oEmbed data.',
      },
      thumbnail_width: {
        type: 'Int',
        description:
          "The width of the resource's thumbnail. Fetched via oEmbed data.",
      },
      title: {
        type: 'String',
        description:
          'A text title, describing the resource. Fetched via oEmbed data.',
      },
      type: {
        type: 'String',
        description: 'The resource type. Fetched via oEmbed data.',
      },
      version: {
        type: 'String',
        description: 'The oEmbed version number.',
      },
      url: {
        type: 'String',
        description: 'The source URL of the resource. Fetched via oEmbed data.',
      },
      width: {
        type: 'Int',
        description:
          'The width in pixel of the resource. Fetched via oEmbed data.',
      },
      height: {
        type: 'Int',
        description:
          'The height in pixel of the resource. Fetched via oEmbed data.',
      },
      media_id: {
        type: 'ID',
        description: 'The ID of the resource media. Fetched via oEmbed data.',
      },
    },
  })

  const PrismicImageDimensionsType = schema.buildObjectType({
    name: 'PrismicImageDimensionsType',
    description: 'Dimensions for images.',
    fields: {
      width: { type: 'Int', description: 'Width of the image in pixels.' },
      height: {
        type: 'Int',
        description: 'Height of the image in pixels.',
      },
    },
  })

  const PrismicImageThumbnailType = schema.buildObjectType({
    name: 'PrismicImageThumbnailType',
    description: 'An image thumbnail with constraints.',
    fields: {
      alt: { type: 'String', description: '' },
      copyright: { type: 'String', description: '' },
      dimensions: { type: 'PrismicImageDimensionsType', description: '' },
      url: { type: 'String', description: '' },
      localFile: {
        type: 'File',
        description: '',
        extensions: { link: {} },
      },
    },
  })

  const PrismicLinkTypes = schema.buildEnumType({
    name: 'PrismicLinkTypes',
    description: 'Types of links.',
    values: {
      Any: {},
      Document: {},
      Media: {},
      Web: {},
    },
  })

  const PrismicLinkType = schema.buildObjectType({
    name: 'PrismicLinkType',
    description: 'Link to web, media, and internal content.',
    fields: {
      link_type: {
        type: 'PrismicLinkTypes!',
        description: 'The type of link.',
      },
      isBroken: {
        type: 'Boolean',
        description:
          'If a Document link, `true` if linked document does not exist, `false` otherwise.',
      },
      url: {
        type: 'String',
        description: "The document's URL derived via the link resolver.",
      },
      target: { type: 'String', description: "The link's target." },
      size: {
        type: 'Int',
        description: 'If a Media link, the size of the file.',
      },
      id: {
        type: 'ID',
        description: "If a Document link, the linked document's Prismic ID.",
      },
      type: {
        type: 'String',
        description:
          "If a Document link, the linked document's Prismic custom type API ID",
      },
      tags: {
        type: 'String',
        description: "If a Document link, the linked document's list of tags.",
      },
      lang: {
        type: 'String',
        description: "If a Document link, the linked document's language.",
      },
      slug: {
        type: 'String',
        description: "If a Document link, the linked document's slug.",
      },
      uid: {
        type: 'String',
        description: "If a Document link, the linked document's UID.",
      },
      document: {
        type: 'PrismicAllDocumentTypes',
        description: 'If a Document link, the linked document.',
        extensions: { link: {} },
      },
      raw: {
        type: 'JSON',
        description:
          "The field's value without transformations exactly as it comes from the Prismic API.",
      },
    },
  })

  const PrismicSliceInterface = schema.buildInterfaceType({
    name: 'PrismicSliceInterface',
    fields: {
      slice_type: {
        type: 'String!',
        description: 'The slice type API ID.',
      },
      slice_label: {
        type: 'String',
        description: 'The slice label.',
      },
    },
  })

  const PrismicImageInterface = schema.buildInterfaceType({
    name: 'PrismicImageInterface',
    fields: {
      alt: { type: 'String', description: "The image's alternative text." },
      copyright: { type: 'String', description: "The image's copyright text." },
      dimensions: {
        type: 'PrismicImageDimensionsType',
        description: "The image's dimensions.",
      },
      url: { type: 'String', description: "The image's URL on Prismic's CDN." },
      localFile: {
        type: 'File',
        description:
          'The locally downloaded image if `shouldNormalizeImage` returns true.',
      },
      fixed: {
        type: 'PrismicImageFixedType',
        description:
          "`gatsby-image` fixed image data using Prismic's CDN via Imgix.",
      },
      fluid: {
        type: 'PrismicImageFluidType',
        description:
          "`gatsby-image` fluid image data using Prismic's CDN via Imgix.",
      },
    },
  })

  const PrismicDocumentInterface = schema.buildInterfaceType({
    name: 'PrismicDocument',
    fields: {
      dataRaw: {
        type: 'JSON!',
        description:
          "The document's data object without transformations exactly as it comes from the Prismic API.",
      },
      dataString: {
        type: 'String!',
        description:
          "The document's data object without transformations. The object is stringified via `JSON.stringify` to eliminate the need to declare subfields.",
        deprecationReason: 'Use `dataRaw` instead which returns JSON.',
      },
      first_publication_date: {
        type: 'Date!',
        description: "The document's initial publication date.",
        extensions: { dateformat: {} },
      },
      href: { type: 'String!', description: "The document's Prismic API URL." },
      url: {
        type: 'String',
        description: "The document's URL derived via the link resolver.",
      },
      id: {
        type: 'ID!',
        description:
          'Globally unique identifier. Note that this differs from the `prismicID` field.',
      },
      lang: { type: 'String!', description: "The document's language." },
      last_publication_date: {
        type: 'Date!',
        description: "The document's most recent publication date",
        extensions: { dateformat: {} },
      },
      tags: { type: '[String!]!', description: "The document's list of tags." },
      alternate_languages: {
        type: '[PrismicLinkType!]!',
        description: 'Alternate languages for the document.',
      },
      type: {
        type: 'String!',
        description: "The document's Prismic API ID type.",
      },
      prismicId: { type: 'ID!', description: "The document's Prismic ID." },
      _previewable: {
        type: 'ID!',
        description:
          "Marks the document as previewable using Prismic's preview system. Include this field if updates to the document should be previewable by content editors before publishing. **Note: the value of this field is not stable and should not be used directly**.",
      },
    },
  })

  return [
    PrismicStructuredTextType,
    PrismicGeoPointType,
    PrismicEmbedType,
    PrismicImageDimensionsType,
    PrismicImageThumbnailType,
    PrismicLinkTypes,
    PrismicLinkType,
    PrismicSliceInterface,
    PrismicImageInterface,
    PrismicDocumentInterface,
  ]
}
