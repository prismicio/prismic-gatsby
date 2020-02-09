const gql = (query: TemplateStringsArray) => String(query).replace(`\n`, ` `)

export const types = gql`
  "A text field with formatting options."
  type PrismicStructuredTextType {
    "The HTML value of the text using \`prismic-dom\` and the HTML serializer."
    html: String
    "The plain text value of the text using \`prismic-dom\`."
    text: String
    "The field's value without transformations exactly as it comes from the Prismic API."
    raw: JSON
  }

  "A field for storing geo-coordinates."
  type PrismicGeoPointType {
    "The latitude value of the geo-coordinate."
    latitude: Float
    "The longitude value of the geo-coordinate."
    longitude: Float
  }

  "Embed videos, songs, tweets, slices, etc."
  type PrismicEmbedType {
    "The name of the author/owner of the resource. Fetched via oEmbed data."
    author_name: String
    "A URL for the author/owner of the resource. Fetched via oEmbed data."
    author_url: String
    "The suggested cache lifetime for this resource, in seconds. Consumers may choose to use this value or not. Fetched via oEmbed data."
    cache_age: String
    "The URL of the resource."
    embed_url: String
    "The HTML required to display the resource. The HTML should have no padding or margins. Consumers may wish to load the HTML in an off-domain iframe to avoid XSS vulnerabilities. Fetched via oEmbed data."
    html: String
    "The name of the resource."
    name: String
    "The name of the resource provider. Fetched via oEmbed data."
    provider_name: String
    "The URL of the resource provider. Fetched via oEmbed data."
    provider_url: String
    "The width of the resource's thumbnail. Fetched via oEmbed data."
    thumbnail_height: Int
    "A URL to a thumbnail image representing the resource. Fetched via oEmbed data."
    thumbnail_url: String
    "The width of the resource's thumbnail. Fetched via oEmbed data."
    thumbnail_width: Int
    "A text title, describing the resource. Fetched via oEmbed data."
    title: String
    "The resource type. Fetched via oEmbed data."
    type: String
    "The oEmbed version number."
    version: String
  }

  "Dimensions for images."
  type PrismicImageDimensionsType {
    "Width of the image in pixels."
    width: Int!
    "Height of the image in pixels."
    height: Int!
  }

  "\`gatsby-image\`-compatible image data for \`fixed\` images."
  type PrismicImageFixedType {
    base64: String
    aspectRatio: Float
    width: Float
    height: Float
    src: String
    srcSet: String
    srcWebp: String
    srcSetWebp: String
  }

  "\`gatsby-image\`-compatible image data for \`fluid\` images."
  type PrismicImageFluidType {
    base64: String
    aspectRatio: Float
    src: String
    srcSet: String
    srcWebp: String
    srcSetWebp: String
    sizes: String
  }

  "An image thumbnail with constraints."
  type PrismicImageThumbnailType implements PrismicImageInterface {
    alt: String
    copyright: String
    dimensions: PrismicImageDimensionsType
    url: String
    localFile: File @link
    "\`gatsby-image\`-compatible image data for \`fixed\` images."
    fixed(width: Int, height: Int): PrismicImageFixedType
    "\`gatsby-image\`-compatible image data for \`fluid\` images."
    fluid(
      maxWidth: Int
      maxHeight: Int
      srcSetBreakpoints: [Int!]
    ): PrismicImageFluidType
  }

  "An image field with optional constrained thumbnails."
  type PrismicImageType implements PrismicImageInterface {
    alt: String
    copyright: String
    dimensions: PrismicImageDimensionsType
    url: String
    localFile: File @link
    "\`gatsby-image\`-compatible image data for \`fixed\` images."
    fixed(width: Int, height: Int): PrismicImageFixedType
    "\`gatsby-image\`-compatible image data for \`fluid\` images."
    fluid(
      maxWidth: Int
      maxHeight: Int
      srcSetBreakpoints: [Int!]
    ): PrismicImageFluidType
    "The image's thumbnails."
    thumbnails: PrismicImageThumbnailsType
  }

  "Types of links."
  enum PrismicLinkTypes {
    "Any of the other types"
    Any
    "Internal content"
    Document
    "Internal media content"
    Media
    "URL"
    Web
  }

  "Link to web, media, and internal content."
  type PrismicLinkType {
    "The type of link."
    link_type: PrismicLinkTypes!
    "If a Document link, \`true\` if linked document does not exist, \`false\` otherwise."
    isBroken: Boolean
    "The document's URL derived via the link resolver."
    url: String
    "The link's target."
    target: String
    "If a Media link, the size of the file."
    size: Int
    "If a Document link, the linked document's Prismic ID."
    id: ID
    "If a Document link, the linked document's Prismic custom type API ID"
    type: String
    "If a Document link, the linked document's list of tags."
    tags: [String]
    "If a Document link, the linked document's language."
    lang: String
    "If a Document link, the linked document's slug."
    slug: String
    "If a Document link, the linked document's UID."
    uid: String
    "If a Document link, the linked document."
    document: PrismicAllDocumentTypes @link
    "The field's value without transformations exactly as it comes from the Prismic API."
    raw: JSON
  }

  interface PrismicSliceType {
    "The slice type API ID."
    slice_type: String!

    "The slice label."
    slice_label: String
  }

  interface PrismicImageInterface {
    "The image's alternative text."
    alt: String
    "The image's copyright text."
    copyright: String
    "The image's dimensions."
    dimensions: PrismicImageDimensionsType
    "The image's URL on Prismic's CDN."
    url: String
    "The locally downloaded image if \`shouldNormalizeImage\` returns true."
    localFile: File
    fixed: PrismicImageFixedType
    fluid: PrismicImageFluidType
  }

  interface PrismicDocument {
    "The document's data object without transformations exactly as it comes from the Prismic API."
    dataRaw: JSON!
    "The document's data object without transformations. The object is stringified via \`JSON.stringify\` to eliminate the need to declare subfields."
    dataString: String
      @deprecated(reason: "Use \`dataRaw\` instead which returns JSON.")
    "The document's initial publication date."
    first_publication_date(
      "Format the date using Moment.js' date tokens, e.g. \`date(formatString: \\"YYYY MMMM DD\\")\`. See https://momentjs.com/docs/#/displaying/format/ for documentation for different tokens."
      formatString: String
      "Returns a string generated with Moment.js' \`fromNow\` function"
      fromNow: Boolean
      "Returns the difference between this date and the current time. Defaults to \\"milliseconds\\" but you can also pass in as the measurement \\"years\\", \\"months\\", \\"weeks\\", \\"days\\", \\"hours\\", \\"minutes\\", and \\"seconds\\"."
      difference: String
      "Configures the locale Moment.js will use to format the date."
      locale: String
    ): Date
    "The document's Prismic API URL."
    href: String
    "The document's URL derived via the link resolver."
    url: String
    "Globally unique identifier. Note that this differs from the \`prismicID\` field."
    id: ID!
    "The document's language."
    lang: String!
    "The document's most recent publication date"
    last_publication_date(
      "Format the date using Moment.js' date tokens, e.g. \`date(formatString: \\"YYYY MMMM DD\\")\`. See https://momentjs.com/docs/#/displaying/format/ for documentation for different tokens."
      formatString: String
      "Returns a string generated with Moment.js' \`fromNow\` function"
      fromNow: Boolean
      "Returns the difference between this date and the current time. Defaults to \\"milliseconds\\" but you can also pass in as the measurement \\"years\\", \\"months\\", \\"weeks\\", \\"days\\", \\"hours\\", \\"minutes\\", and \\"seconds\\"."
      difference: String
      "Configures the locale Moment.js will use to format the date."
      locale: String
    ): Date
    "The document's list of tags."
    tags: [String!]!
    "Alternate languages for the document."
    alternate_languages: [PrismicLinkType!]!
    "The document's Prismic API ID type."
    type: String!
    "The document's Prismic ID."
    prismicId: ID!
  }
`
