# Limitations

Previews are only processed in the browser at runtime. As a result, features
that require build-time processing, such as `gatsby-transformer-sharp` or [field
aliasing][gatsby-graphql-aliasing], cannot be handled during a preview.

Please keep the following limitations in mind while creating your templates if
you app needs to support previews.

### GraphQL field aliases

GraphQL allows fields to be renamed, also known as aliasing, as needed. Gatsby's
GraphQL data layer only exists during build-time. As a result, field aliasing is
not possible during client-side previews.

To mitigate this limitation, use Gatsby's
[`useStaticQuery`][gatsby-usestaticquery] within your components as much as
possible to scope your queries.

[gatsby-graphql-aliasing]:
  https://www.gatsbyjs.com/docs/graphql-reference/#aliasing
[gatsby-usestaticquery]:
  https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/

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
