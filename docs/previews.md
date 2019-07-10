# Previews <!-- omit in toc -->

- [Prerequisites](#Prerequisites)
- [Why previews are useful](#Why-previews-are-useful)
- [How to use previews](#How-to-use-previews)
  - [TL;DR](#TLDR)
  - [Guide](#Guide)
    - [usePrismicPreview](#usePrismicPreview)
    - [mergePrismicPreviewData](#mergePrismicPreviewData)
  - [Previewing un-published pages](#Previewing-un-published-pages)
    - [Unpublished document route handler](#Unpublished-document-route-handler)
    - [Resolving unpublished paths](#Resolving-unpublished-paths)
- [API](#API)
  - [usePrismicPreview](#usePrismicPreview-1)
    - [Return Value](#Return-Value)
  - [mergePrismicPreviewData](#mergePrismicPreviewData-1)
    - [Return Value](#Return-Value-1)
      - [If `previewData` is falsey](#If-previewData-is-falsey)
      - [If `staticData` is falsey](#If-staticData-is-falsey)
      - [If `previewData` and `staticData` have the same top level keys](#If-previewData-and-staticData-have-the-same-top-level-keys)
      - [If `previewData` and `staticData` have different top level keys](#If-previewData-and-staticData-have-different-top-level-keys)
- [Limitations](#Limitations)
  - [Images](#Images)
  - [Aliases](#Aliases)

## Prerequisites

While not required, it's recommended to client render your preview resolver
paths with the
(`gatsby-plugin-create-client-paths`)[https://www.npmjs.com/package/gatsby-plugin-create-client-paths]
plugin. This will help prevent any issues with accessing browser only objects
such as `window`.

## Why previews are useful

In most traditional CMS setups, content editors and creators can preview their
changes before publishing them live. However, as you are probably aware, getting
previews to work with Gatsby can be a bit challenging.

The static nature of Gatsby coupled with a headless CMS brings a lot of
benefits. Unfortunately, it also comes with the drawback of removing the
capability to provide the "immediate feedback" of previews that many content
creators want.

In a traditional setting, a server exists to dynamically build and serve these
preview requests on demand. With Gatsby, no such infrastructure exists to
accomplish this. Asking content creators, editors, and clients to "wait a few
minutes" for a site to rebuild is often not an acceptable solution.

With v3 of `gatsby-source-prismic`, we're happy to announce that client-rendered
previews are now available! By rendering previews client-side, we can retain the
benefits of Gatsby's HTML pre-rendering while still provding the dynamic & rich
content editing experience of a traditional server setup.

## How to use previews

### TL;DR

- Query for your preview data with `usePrismicPreview` on your preview endpoint.
- With your new `previewData`, use Gatsby's `navigate` function to route to the
  returned `path`, passing your `previewData` along in `window`.
- On your page or template, read your `previewData` from `window` and pass it to
  the `mergePrismicPreviewData` helper function along with your normal static
  data from Gatsby.
- Pass your merged data to your template exactly where you would your static
  data!

### Guide

To get started with previews, it's key to understand the two main functions that
`gatsby-source-prismic` provides to facilitate them. The first of these is a
React hook called `usePrismicPreview`.

#### usePrismicPreview

`usePrismicPreview` allows developers to make requests to Prismic's API that get
processed _in the browser_. After they're processed, these API responses will
have the same shape as the data provided at build-time.

This means that data returned from `usePrismicPreview` can be dropped into your
templates and pages _as is_. In most cases, `usePrismicPreview` will be called
on the page component that matches the preview resolver endpoint you specify in
Prismic.

Here is an example using the `usePrismicPreview` hook on a page component at
`/preview`.

```jsx
// src/pages/preview.js

import React, { useEffect } from 'react'
import { navigate } from 'gatsby'
import { usePrismicPreview } from 'gatsby-source-prismic'

import { Spinner } from '../components/Spinner'

const PreviewPage = ({ location }) => {
  const { previewData, path } = usePrismicPreview(location, {
    linkResolver: ({ node, key, value }) => doc => doc.uid,
    htmlSerializer: ({ node, key, value }) => () => {},
  })

  useEffect(() => {
    if (previewData && path) {
      window.__PRISMIC_PREVIEW_DATA__ = previewData
      navigate(path)
    }
  }, [previewData, path])

  return <Spinner />
}

export default PreviewPage
```

Let's breakdown what's happening here:

1. We call `usePrismicPreview` and pass in `location` as the first argument. The
   `location` object from `@reach/router` is needed to read the token and ID of
   the previewed document from Prismic.
2. In the second argument to `usePrismicPreview`, we pass in an object
   containing the required `linkResolver` and `htmlSerializer` functions. We are
   able to read your access token and repository name from `gatsby-config.js`,
   but due to a limitation with Gatsby, you are required to re-specify these two
   functions again. If needed, you can optionally provide overrides to any of
   the other plugin config options here as well.
3. From `usePrismicPreview`, we receive `previewData`. The `previewData` object
   contains the data from Prismic's API for the previewed document. This object
   is also normalized to have the same key-value data shape as what we get at
   build-time.
4. From `usePrismicPreview`, we receive `path`. `path` is a string determined by
   running `linkResolver` with the raw previewed document. If for some reason
   you would need to have different logic to determine the path of your preview
   document, you can provide an optional `pathResolver` function that will be
   used instead.
5. In `useEffect`, once `previewData` is available, we navigate the user to the
   resolved `path` and set `previewData` to a namespaced key on `window`. We
   navigate to `path` to ensure that we are using the appropriate page or
   template component for the document we're previewing.
6. While all of the above is happening, we can display a loading indicator or
   spinner to our users for a good UX.

#### mergePrismicPreviewData

You may be wondering:

> "What if my template needs data that a previewed document doesn't have, such
> as data from an `allPrismicBooks` graphql query?".

For these cases, we provide a helper function `mergePrismicPreviewData` to
handle just that. This allows us to display fresh preview data on templates
where `previewData` "fits", but fallback to static data wherever else it's
needed.

Once we've navigated to our appropriate template, we need to conditionally
handle reading `previewData` from `window`.

Below is an example template component:

```jsx
// src/templates/authorTemplate.js

import React from 'react'
import { graphql } from 'gatsby'
import { mergePrismicPreviewData } from 'gatsby-source-prismic'

import { Layout } from '../components/Layout'

const IS_BROWSER = typeof window !== 'undefined'

const AuthorTemplate = ({ location, data: staticData }) => {
  const previewData = IS_BROWSER && window.__PRISMIC_PREVIEW_DATA__

  const data = mergePrismicPreviewData({ staticData, previewData })

  return (
    <Layout>{/* Use your preview data just as you normally would! */}</Layout>
  )
}

export default AuthorTemplate

export const query = graphql`` // => query for your static data...
```

Just like last time, let's break this down:

1. Like in normal Gatsby-land, we have a `graphql` query that fetches our static
   data and passes it to our template as the `data` prop. In this case, we're
   destructuring it and naming it `staticData`.
2. If `window` has `__PRISMIC_PREVIEW_DATA__` in it, let's conditionally assign
   it. Note that we check for `window`'s existence to prevent issues during SSR.
3. Pass `staticData` and `previewData` into `mergePrismicPreviewData`. This
   helper will merge our `previewData` and `staticData` objects together,
   ensuring that we use fresh preview data where it's appropriate, and fallback
   to static data where we don't have any preview data.

   This helper function is also flexible enough to know that if `previewData` is
   any falsey value, we shouldn't do any processing and just return `staticData`
   _as is_. This prevents us from doing any extra work when we're not previewing
   this template.

4. Now, use your merged `data` object as you normally would! Since we have the
   same key-value structure for previews, things should "just work"!

### Previewing un-published pages

With our previous approach, we can preview currently published pages from
Prismic just fine, but unpublished pages may not preview correctly. Depending on
the logic in your `linkResolver()`, your unpublished previews may return an
undefined or erroneous `path`, resulting unexpected behavior.

To remedy this, we're going to take advantage of the fact that Gatsby pages and
templates are just React components.

#### Unpublished document route handler

To start, let's create a dedicated `unpublishedPreview` page in your `pages/`
directory. (e.g. `src/pages/unpublishedPreview.js`).

> ⚠️ While not required, we recommend client rendering the `unpublishedPreview`
> route with
> (`gatsby-plugin-create-client-paths`)[https://www.npmjs.com/package/gatsby-plugin-create-client-paths]
> as well. This will avoid issues with `window` during SSR.

In here, we can have the following component:

```js
// src/pages/unpublishedPreview.js

import { PageTemplate } from 'src/templates/page'

export const UnpublishedPage = props => {
  const previewData = window.__PRISMIC_PREVIEW_DATA__

  // => Perform any logic from previewData to determine the correct page or template component to use.

  return <PageTemplate {...props} />
}

export default UnpublishedPage
```

As usual, let's break this down:

1. We import our `<PageTemplate>` component. Because templates and pages in
   Gatsby are just React components, we can reuse them anywhere!
2. Read our `previewData` from `window`. This example reads `previewData`
   straight from `window`, but feel free to conditionally assign this in any way
   you prefer to prevent SSR issues.
3. Run any logic using `previewData` to correctly determine what template
   component to pass your data to. This example only has one template, but your
   site may utilize several.
4. Spread your props over the template componenet you render. This is needed to
   pass props like `location` and any other props your templates may need.

#### Resolving unpublished paths

Next, we need to update the `linkResolver` or `pathResolver` function that we
use to resolve our `path` from `usePrismicPreview` to handle unpublished
documents. Because we may need some custom logic that may not be suitable for
your link resolving, `pathResolver` is typically more appropriate for this.

Depending on the structure of your project, the implementation of `pathResolver`
may vary, but here is a full example to get started with:

```js
// src/pages/preview.js

export const PreviewPage = ({ location }) => {
  const { allPrismicPage } = useStaticQuery(graphql`
    {
      allPrismicPage {
        nodes {
          uid
        }
      }
    }
  `)
  const pageUIDs = allPrismicPage.nodes.map(node => node.uid)

  const pathResolver = () => doc => {
    const previewedUID = doc.prismicPage.uid

    if (pageUIDs.includes(previewedUID)) {
      return previewedUID
    } else {
      return '/unpublishedPreview'
    }
  }

  const { previewData, path } = usePrismicPreview(location, {
    repositoryName: 'myRepoName',
    linkResolver: () => () => {},
    htmlSerializer: () => {},
    pathResolver,
  })

  useEffect(() => {
    if (previewData && path) {
      window.__PRISMIC_PREVIEW_DATA = previewData
      navigate(path)
    }
  }, [path, previewData])

  return <Spinner />
}
```

As usual, lets break this down:

1. We perform a static query in with Gatsby's `useStaticQuery` React hook to get
   a list of all our nodes & UIDs.
2. `map` over the results from our static query to build an array of published
   UIDs.
3. Define a `pathResolver` function for `usePrismicPreview()` that checks if the
   previewed document's `uid` is in the list of published documents.
4. If the previewed document's `uid` isn't in the list we built, navigate to
   `/unpublishedPreview`. Otherwise, we'll send them to the route for that
   document.

## API

### usePrismicPreview

`usePrismicPreview` is a React hook, so all of the conventions and restrictions
of hooks apply to its use. It accepts the following function parameters as
defined below:

| Parameter | Required? |  Type  | Description                                                                                                                                                                                                                                                         |
| :-------: | :-------: | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| location  |    ✅     | Object | The location object from `@reach/router`. Used to determine the preview token and document ID from search parameters.                                                                                                                                               |
| overrides |    ✅     | Object | An object that allows you to override any of the `gatsby-source-prismic` plugin options _only_ for previews. Due to limitations in Gatsby, you are **required** to provide a `linkResolver` and `htmlSerializer` here again if you specified it in `gatsby-config`. |

The `overrides` object can be passed any of the following keys. Please keep in
mind that specifying your `linkResolver`, `htmlSerializer` and `repositoryName`
is **required**.

|      Key       | Required? |       Type        | Description                                                                                                                                                                                                                                                      |
| :------------: | :-------: | :---------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| repositoryName |    ✅     |      String       | Your Prismic repository name.                                                                                                                                                                                                                                    |
|  linkResolver  |    ✅     |     Function      | Determines how links in your preview are resolved to URLs. If `pathResolver` is not defined, `linkResolver` is used to determine the `path` returned by `usePrismicPreview`. Generally, this should be the same function as the one provided in `gatsby-config`. |
| htmlSerializer |    ✅     |     Function      | Determines how rich text fields are serialized to HTML. Generally, this should be the same function as the one provided in `gatsby-config`.                                                                                                                      |
|  pathResolver  |           |     Function      | Function that allows for custom preview `path` resolving logic. This is useful if your `linkResolver` logic is different than how you generate URLs or paths for your pages. `pathResolver` receives the normalized previewed document as an argument.           |
|   fetchLinks   |           | String or Array[] | Determines which link fields are fetched for the previewed document. For more information, refer to Prismic's docs on fetchLinks: https://prismic.io/docs/javascript/query-the-api/fetch-linked-document-fields                                                  |
|  accessToken   |           |      String       | Your Prismic access token. Only provide this if you need to use a different token than the one provided in `gatsby-config`.                                                                                                                                      |

#### Return Value

Returns an object with the following keys:

|     Key     |  Type   | Description                                                                                                                                                           |
| :---------: | :-----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| previewData | Object  | Normalized API response from Prismic for the previewed doc. The key-value shape of `previewData` is identical to what `gatsby-source-prismic` provides at build-time. |
|    path     | String  | A path determined by running the raw preview API response through either `linkResolver` or `pathResolver`.                                                            |
|  isPreview  | Boolean | Boolean for indicating that your current route is on a preview.                                                                                                       |

--- |

### mergePrismicPreviewData

Receives a single object as a parameter:

|     Key     | Required? |  Type  | Description                                                                                                                        |
| :---------: | :-------: | :----: | ---------------------------------------------------------------------------------------------------------------------------------- |
| staticData  |           | Object | Static data from Gatsby. Typically this is the data that Gatsby provides to your pages from `graphql` queries via the `data` prop. |
| previewData |           | Object | Preview data from `usePrismicPreview`.                                                                                             |

#### Return Value

##### If `previewData` is falsey

Returns `staticData` as is.

##### If `staticData` is falsey

Returns `previewData` as is.

##### If `previewData` and `staticData` have the same top level keys

Returns a new object by deeply merging the key-value pairs from `staticData` and
`previewData`. If a key between the two objects are shared, values from
`previewData` are used.

##### If `previewData` and `staticData` have different top level keys

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

Since normalized previews rely on the inferred graphQL schemas that are provided
to Gatsby, graphQL aliases are currently unsupported.

This means that if you perform anything like this in your graphQL queries:

```graphql
query {
  prismicPage(uid: { eq: $uid }) {
    uid
    data {
      myTitle: title {
        text
      }
    }
    meta_title
    meta_description
  }
}
```

Previews _will not_ function properly since `previewData` objects are unable to
know about these key changes.

> ⚠️ If you attempt to merge a `previewData` with a `staticData` object with
> aliased fields with `mergePrismicPreviewData`, the resulting merged object
> will be incorrect.
