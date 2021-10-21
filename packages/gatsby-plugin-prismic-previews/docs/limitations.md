# Limitations

Previews are only processed in the browser at runtime. As a result, features
that require build-time processing, such as `gatsby-transformer-sharp` or [field
aliasing][gatsby-graphql-aliasing], cannot be handled during a preview.

You may see previews referenced as "client-side" previews in documentation. This
refers to the fact that previews using `gatsby-plugin-prismic-previews` are run
in the browser, or client, rather than a server.

Please keep the following limitations in mind while creating your templates if
your app needs to support previews.

### GraphQL field aliases

GraphQL allows fields to be renamed, also known as aliasing, as needed. Gatsby's
GraphQL data layer only exists during build-time. As a result, field aliasing is
not possible during client-side previews.

To mitigate this limitation, use Gatsby's
[`useStaticQuery`][gatsby-usestaticquery] within your components as much as
possible to scope your queries.

[gatsby-graphql-aliasing]: https://www.gatsbyjs.com/docs/graphql-reference/#aliasing
[gatsby-usestaticquery]: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/

### GraphQL schema customizations

Gatsby allows its GraphQL data API to be customized using the
[`createSchemaCustomization`](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#createSchemaCustomization)
and
[`createResolvers`](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#createResolvers)
APIs in `gatsby-node.js`. This works during development and build-time because
Gatsby's GraphQL server is modified. During client-side previews, however, the
GraphQL API is no longer available. This means the customizations will not be
included in previewed data.

You can still use the GraphQL customization APIs, but be sure to write your
pages and components in a way that allows them to fall back to default values if
content is not available during a preview.

### Image processing

Build-time processed images using `gatsby-transformer-sharp` and the `localFile`
field are simulated during an unpublished preview. The following fields are made
available without support for query arguments such as cropping and image
manipulation:

- `imageField.localFile.childImageSharp.fixed`
- `imageField.localFile.childImageSharp.fluid`

Images using Imgix via the `fixed` and `fluid` fields are made available without
support for query arguments such as cropping and image manipulation.

- `imageField.fixed`
- `imageField.fluid`

Default values are used for options like `width` and `quality`. If you encounter
styling errors during previews, such as images blowing out of their elements,
use CSS to ensure they are sized properly.

### `localFile` for media fields

Media fields that link to files (e.g. PDFs and videos) are linked directly using
the Prismic CDN URL. The following field is simulated during previewing:

- `mediaField.localFile.publicURL`
