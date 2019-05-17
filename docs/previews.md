# Previews

This is a stub article.

- Why previews are useful
- How to use previews
- API
  - `usePrismicPreview()`
  - `mergePrismicPreviewData`
- Limitations
  - Images

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
  returned `path`, passing your `previewData` along in `location.state`.
- On your page or template, read your `previewData` from `location.state` and
  pass it to the `mergePrismicPreviewData` helper function along with your
  normal static data from Gatsby.
- Pass your merged data to your template exactly where you would your static
  data!

### Guide

To get started with previews, it's key to understand the two main functions that
`gatsby-source-prismic` provides to facilitate them. The first of these is a
React hook called `usePrismicPreview`.

### usePrismicPreview

`usePrismicPreview` allows developers to make requests to Prismic's API that get
processed _in the browser_. After they're processed, these API responses will
have the same shape as the data provided at build-time.

This means that data returned from `usePrismicPreview` can be dropped into your
templates and pages _as is_. In most cases, `usePrismicPreview` will be called
on the page you create as the endpoint you specify in Prismic as your preview
resolver.

Here is an example of calling the `usePrismicPreview` hook on a page at
`/preview`.

```jsx
import React, { useEffect } from 'react'
import { navigate } from 'gatsby'
import { usePrismicPreview } from 'gatsby-source-prismic'

import { Spinner } from '../components/Spinner'

const PreviewPage = ({ location }) => {
  const { previewData, path } = usePrismicPreview(location, {
    linkResolver: doc => doc.uid,
    htmlSerializer: () => {},
  })

  useEffect(() => {
    if (previewData) {
      navigate(path, {
        state: { previewData: JSON.stringify(previewData) },
      })
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
   running `linkResolver` with the previewed document. If for some reason you
   would need to have different logic to determine the path of your preview
   document, you can provide an optional `pathResolver` function that will be
   used instead.
5. In `useEffect`, once `previewData` is available, we navigate the user to the
   resolved `path` and pass `previewData` along too. We need to `JSON.stringify`
   it since `@reach/router` doesn't allow you to pass objects in
   `location.state`. We navigate to `path` to ensure that we are using the
   appropriate page or template component for the document we're previewing.

### mergePrismicPreviewData

You may be wondering:

> "What if my template needs data that a previewed document doesn't have, such
> as data from an `allPrismicBooks` graphql query?".

For these cases, we provide a helper function `mergePrismicPreviewData` to
handle just that. This allows us to display fresh preview data on templates
where `previewData` "fits", but fallback gracefully to static data wherever else
it's needed.

Once we've navigated to our appropriate template, we need to conditionally
handle reading `previewData` from `location.state`.

Below is an example template:

```jsx
import React from 'react'
import { graphql } from 'gatsby'
import { mergePrismicPreviewData } from 'gatsby-source-prismic'

import { Layout } from '../components/Layout'

const AuthorTemplate = ({ location, data: staticData }) => {
  const previewData = location.state.hasOwnProperty('previewData')
    ? JSON.parse(location.state.previewData)
    : null
  const data = mergePrismicPreviewData({ staticData, previewData })

  return (
    <Layout>{/* Use your preview data just as you normally would! */}</Layout>
  )
}

export default AuthorTemplate

export const query = graphql`` // query for your static data...
```

Just like last time, let's break this down:

1. Just like in normal Gatsby-land, we have a `graphql` query that fetches our
   static data from Gatsby and passes it to our template as the `data` prop. In
   this case, we're destructuring it and naming it `staticData`.
2. If `location.state` has `previewData` in it, let's `JSON.parse` the
   stringified data. Otherwise, we didn't come from a preview, and we're viewing
   this template normally.
3. Pass `staticData` and `previewData` into `mergePrismicPreviewData`. This
   helper will merge our `previewData` and `staticData` objects together,
   ensuring that we use fresh preview data where it's appropriate, and fallback
   to static data where we don't have any preview data.

   Additionally, this helper function is smart enough to know that if
   `previewData` is any falsey value, we shouldn't do any processing and just
   return `staticData` _as is_. This prevents us from doing any extra work when
   we're not previewing this template.

## API

TODO

## Limitations

TODO
