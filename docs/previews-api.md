# Preview API

## Table of Contents

- [`usePrismicPreview`](#usePrismicPreview)
- [`mergePrismicPreviewData`](#usePrismicPreview)
- [Limitations](#limitations)

## usePrismicPreview

`usePrismicPreview` is a React hook, so all of the conventions and restrictions
of hooks apply to its use. It accepts the following function parameters as
defined below:

| Parameter     | Required? | Type   | Description                                                                                                           |
| ------------- | --------- | ------ | --------------------------------------------------------------------------------------------------------------------- |
| **location**  | ✅        | Object | The location object from `@reach/router`. Used to determine the preview token and document ID from search parameters. |
| **overrides** | ✅        | Object | An object that allows you to override any of the `gatsby-source-prismic` plugin options _only_ for previews.          |

The `overrides` object can be passed any of the following keys. Please keep in
mind that specifying your `repositoryName` is **required**.

| Key                | Required? | Type              | Description                                                                                                                                                                                                                                            |
| ------------------ | --------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **repositoryName** | ✅        | String            | Your Prismic repository name.                                                                                                                                                                                                                          |
| **linkResolver**   |           | Function          | Determines how links in your preview are resolved to URLs. If `pathResolver` is not defined, `linkResolver` is used to determine the `path` returned by `usePrismicPreview`.                                                                           |
| **htmlSerializer** |           | Function          | Determines how rich text fields are serialized to HTML.                                                                                                                                                                                                |
| **pathResolver**   |           | Function          | Function that allows for custom preview `path` resolving logic. This is useful if your `linkResolver` logic is different than how you generate URLs or paths for your pages. `pathResolver` receives the normalized previewed document as an argument. |
| **fetchLinks**     |           | String or Array[] | Determines which link fields are fetched for the previewed document. For more information, refer to Prismic's docs on fetchLinks: https://prismic.io/docs/javascript/query-the-api/fetch-linked-document-fields                                        |
| **accessToken**    |           | String            | Your Prismic access token. Only provide this if you need to use a different token than the one provided in `gatsby-config`.                                                                                                                            |

### Return Value

Returns an object with the following keys:

| Key             | Type    | Description                                                                                                                                                           |
| --------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **previewData** | Object  | Normalized API response from Prismic for the previewed doc. The key-value shape of `previewData` is identical to what `gatsby-source-prismic` provides at build-time. |
| **path**        | String  | A path determined by running the raw preview API response through either `linkResolver` or `pathResolver`.                                                            |
| **isPreview**   | Boolean | Boolean for indicating that your current route is on a preview.                                                                                                       |

## mergePrismicPreviewData

Receives a single object as a parameter:

| Key             | Required? | Type   | Description                                                                                                                        |
| --------------- | --------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **staticData**  |           | Object | Static data from Gatsby. Typically this is the data that Gatsby provides to your pages from `graphql` queries via the `data` prop. |
| **previewData** |           | Object | Preview data from `usePrismicPreview`.                                                                                             |

### Return Value

#### If `previewData` is falsey

Returns `staticData` as is.

#### If `staticData` is falsey

Returns `previewData` as is.

#### If `previewData` and `staticData` have the same top level keys

Returns a new object by deeply merging the key-value pairs from `staticData` and
`previewData`. If a key between the two objects are shared, values from
`previewData` are used.

#### If `previewData` and `staticData` have different top level keys

Returns a new object by deeply traversing `staticData` and replacing any
document data nodes with the previewed document's ID with `previewData`. This is
useful for previewing documents whose data would only be shown on a page such as
data from `allPrismicBooks` queries.

## Limitations

### Images

Since preview data normalization happens at runtime, we cannot perform the same
image optimizations that we do at build-time. Instead, `usePrismicPreview()`
returns just the `url` field for an image.

We recommend creating a custom `<Image />` React component that can
conditionally render a normal `<img />` when a `src` is specified, or fallback
to `gatsby-image` data otherwise. Taking this approach will ensure that we
utilize fresh preview data for images, but still retain the benefits of
lazy-loaded images when statically viewing our site.

Below is a simple example of such a component:

```jsx
import React from 'react'
import Img from 'gatsby-image'

export const Image = ({
  src,
  fixed,
  fluid,
  objectFit = 'cover',
  objectPosition = '50% 50%',
  ...props
}) =>
  src ? (
    <img
      width="100%"
      height="100%"
      src={src}
      loading="lazy"
      style={{ objectFit, objectPosition }}
      {...props}
    />
  ) : (
    <Img {...props} fluid={fluid} fixed={fixed} />
  )
```

Let's break this down:

1. If the `src` prop is present, we know that we're on a preview, so we want to
   use a regular `<img />` tag. We provide a few additional props and attributes
   like `objectFit`, `objectPosition` and `width` and `height` with values that
   keep it consistent with the `<Img />` component from `gatsby-image`.

   As a bonus for users on _very_ new browsers, we can also progressively
   enhance our base `<img />` and provide the `loading="lazy"` attribute too!

2. Otherwise, we know we're viewing this image statically, so use the `<Img />`
   component from `gatsby-image` and provide either the `fixed` or `fluid` props
   as preferred.

Feel free to build upon the above example to make it work in any way you prefer.
We don't recommend using the above _as is_. (Though if it works well enough for
you, great!)

CSS-in-JS solutions will work just as well here, or you can even leverage the
`<picture>` tag with a `srcset` you get from Prismic!

### Aliases

Since normalized previews rely on the GraphQL schemas that are provided to
Gatsby, GraphQL aliases are currently unsupported.

This means that if you perform anything like this in your GraphQL queries:

```graphql
query {
  prismicPage(uid: { eq: $uid }) {
    uid
    data {
      myTitle: title {
        text
      }
    }
  }
}
```

Previews _will not_ function properly since `previewData` objects are unable to
know about these key changes.

> ⚠️ If you attempt to merge a `previewData` with a `staticData` object with
> aliased fields with `mergePrismicPreviewData`, the resulting merged object
> will be incorrect.
