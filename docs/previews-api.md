# Preview API

## Table of Contents

- [`usePrismicPreview`](#usePrismicPreview)
- [`mergePrismicPreviewData`](#usePrismicPreview)
- [Limitations](#limitations)

## usePrismicPreview

`usePrismicPreview` is a React hook, so all of the conventions and restrictions
of hooks apply to its use.

It accepts a single object with the following properties. Please keep in mind
that specifying your `repositoryName` is **required**.

If you use a provide a `linkResolver` and/or `htmlSerializer` in your
`gatsby-config.js`, you should also provide it here.

| Key                | Required? | Type              | Description                                                                                                                                                                                                                                            |
| ------------------ | --------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **repositoryName** | ✅        | String            | Your Prismic repository name.                                                                                                                                                                                                                          |
| **linkResolver**   |           | Function          | Determines how links in your preview are resolved to URLs. If `pathResolver` is not defined, `linkResolver` is used to determine the `path` returned by `usePrismicPreview`.                                                                           |
| **pathResolver**   |           | Function          | Function that allows for custom preview `path` resolving logic. This is useful if your `linkResolver` logic is different than how you generate URLs or paths for your pages. `pathResolver` receives the normalized previewed document as an argument. |
| **htmlSerializer** |           | Function          | Determines how rich text fields are serialized to HTML.                                                                                                                                                                                                |
| **fetchLinks**     |           | String or Array[] | Determines which link fields are fetched for the previewed document. For more information, refer to Prismic's docs on fetchLinks: https://prismic.io/docs/javascript/query-the-api/fetch-linked-document-fields                                        |
| **accessToken**    |           | String            | Your Prismic access token. Only provide this if you need to use a different token than the one provided in `gatsby-config`.                                                                                                                            |

### Return Value

Returns an object with the following keys:

| Key             | Type    | Description                                                                                                                                      |
| --------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **previewData** | Object  | API response from Prismic for the previewed doc. The data is shaped just like the data from `gatsby-source-prismic` at build time.               |
| **path**        | String  | The path of the previewed document determined using `pathResolver` or `linkResolver`. Use this to redirect the browser once loading is complete. |
| **isPreview**   | Boolean | Determines if the current route is on a preview.                                                                                                 |
| **isLoading**   | Boolean | Determines if the page is loading preview data from Prismic.                                                                                     |

## mergePrismicPreviewData

Receives a single object as a parameter:

| Key             | Required? | Type   | Description                                                                                                              |
| --------------- | --------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| **staticData**  |           | Object | Static data from Gatsby. This is the data that Gatsby provides to your pages from `graphql` queries via the `data` prop. |
| **previewData** |           | Object | Preview data from `usePrismicPreview`.                                                                                   |

### Return Value

**If `previewData` is falsey/empty**: Returns `staticData` as is.

**If `staticData` is falsey**: Returns `previewData` as is.

**If `previewData` contains the same document as `staticData`**: Returns a new
object by deeply merging the key-value pairs from `staticData` and
`previewData`. Data in `previewData` replaces data in `staticData`.

**If `previewData` contains a document nested in `staticData`**: Returns a new
object with the nested document replaced anywhere it is referenced. Note that
this only works if the nested data in `staticData` includes the document's ID
field. This is useful for previewing documents whose data is only a smaller part
of a whole page.

## Limitations

### Images

#### Using Imgix transformed images

If using Prismic's Imgix integration and the `GatsbyPrismicImage...` fragments
for images, this works out of the box with previews. Default values are used for
width/height, however, so be aware that your images may have different
resolutions at preview time.

- **Fixed images**: Defaults to `400px` width.
- **Fluid images**: Defaults to `800px` max width.

#### Using locally transformed images

If you are using `gatsby-transformer-sharp` and the `localFile` field for
images, we cannot perform the same image optimizations that we do at build-time.
Instead, `usePrismicPreview()` returns just the `url` field for an image.

In this case, We recommend creating a custom `<Image />` React component that
can conditionally render a normal `<img />` when a `src` is specified, or
fallback to `gatsby-image` data otherwise. Taking this approach will ensure that
we utilize fresh preview data for images, but still retain the benefits of
lazy-loaded images when statically viewing our site.

Below is a simple example of such a component:

```jsx
import React from 'react'
import GatsbyImage from 'gatsby-image'

export const Image = ({ src, fixed, fluid, ...props }) =>
  src ? (
    <img src={src} {...props} />
  ) : (
    <GatsbyImage fluid={fluid} fixed={fixed} {...props} />
  )
```

### Aliases

GraphQL aliases are not supported since previews do not have access to your
Gatsby GraphQL query.

This means that if you perform anything like this in your GraphQL queries:

```graphql
query {
  prismicPage(uid: { eq: $uid }) {
    uid
    data {
      myAliasedTitle: title {
        text
      }
    }
  }
}
```

Previews _will not_ function properly since `previewData` will not change
`title` to `myAliasedTitle`.

### Preview links

Share links from Prismic Toolbar are currently unsupported. See
[#276](https://github.com/angeloashmore/gatsby-source-prismic/issues/276).
