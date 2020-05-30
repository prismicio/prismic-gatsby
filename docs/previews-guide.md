# Previewing with Prismic

`gatsby-source-prismic`'s preview system aims to be unopinionated in its
implementation. This allows the system to be flexible and work alongside other
parts of your site.

The following guide is a recommended approach to implementing previews, but
customizations are encouraged.

## Table on Contents

- [Why previews are useful](#why-previews-are-useful)
- [Summary](#summary)
- [Enable previews in Prismic](#enable-previews-in-prismic)
- [Create a preview page](#create-a-preview-page)
- [Get preview data](#get-preview-data)
- [Save preview data globally](#save-preview-data-globally)
- [Navigate to the document's page](#navigate-to-the-documents-page)
- [Merge with non-preview data](#merge-with-non-preview-data)
- [Wrap-up](#wrap-up)
- [Limitations](#limitations)

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

Luckily, `gatsby-source-prismic` provides a way to load previews directly from
Prismic. By rendering previews client-side, we can retain the benefits of
Gatsby's HTML pre-rendering while still provding the dynamic and rich content
editing experience of a traditional server setup.

## Summary

Each step is described in full detail below.

1. [**Enable previews**](#enable-previews): Enable previews in Prismic with your
   preview URL and optionally include the Prismic Toolbar.

1. [**Create a preview page**](#create-a-preview-page): Create a page to which
   Prismic will redirect previews.

1. [**Get preview data**](#get-preview-data): Query for your preview data with
   the `usePrismicPreview` hook on your preview page.

1. [**Save preview data globally**](#save-preview-data-globally): Save your
   preview data globally (e.g. `window` or Redux) to use later on the document's
   page.

1. [**Navigate to the document's page**](#navigate-to-the-documents-page):
   Navigate to your previewed document's page using Gatsby's `navigate`
   function.

1. [**Merge with non-preview data**](#merge-with-non-preview-data): Lastly, on
   your page or template, read the preview data from your global store and pass
   it to the `mergePrismicPreviewData` helper.

## Enable previews in Prismic

Before writing any code in Gatsby, we'll need to enable previews in Prismic.

Follow Prismic's official [How to set up a preview][prismic-setup-preview] guide
to enable previews on your repository.

While developing, you would typically set up multiple preview sites:

- **Development**: Domain: `http://localhost:8000`, Link Resolver: `/preview`
- **Production**: Domain: `https://<your_url>`, Link Resolver: `/preview`

You may optionally enable the Prismic Toolbar script to make previewing
[Releases][prismic-releases] and creating sharable links much easier. You can
enable this by setting the `prismicToolbar` option in your `gatsby-config.js`
file to `true`.

```diff
  plugins: [
    {
      resolve: 'gatsby-source-prismic',
      options: {
        repositoryName: 'gatsby-source-prismic-test-site',
        accessToken: 'example-wou7evoh0eexuf6chooz2jai2qui9pae4tieph1sei4deiboj',
+       prismicToolbar: true
      }
    }
  ]
```

> **Note**: If your repository is not relatively new and requires the older
> Prismic Toolbar script, set `prismicToolbar` to `"legacy"` instead of true.
>
> To check if you need the `legacy` option, go to your Prismic repository and
> navigate to **Settings** > **Previews**. In the _Include the Prismic Toolbar
> javascript file_ section, check the URL for the `<script>` code snippet.
>
> If the `src` attribute ends with `&new=true`, set `prismicToolbar` to `true`.
> If it does _not_ end with `&new=true`, set `prismicToolbar` to `"legacy"`.

Once previews are enabled, we can open the code for our site.

## Create a preview page

Prismic sends previews to an endpoint on your site along with data representing
the preview. This endpoint can be set to any page, but `/preview` is the most
common choice. The rest of this guide assumes the endpoint to be `/preview`, but
you can replace this as needed.

First, create the preview page within your project.

```jsx
// src/pages/preview.js

import React from 'react'

const PreviewPage = () => {
  return <div>Loading preview...</div>
}

export default PreviewPage
```

This page does nothing yet, but it sets the stage for fetching preview data.

## Get preview data

Using the `usePrismicPreview` hook, we can fetch our preview data from Prismic.

We must provide the following arguments to the hook:

- **`repositoryName`**: Your Prismic repository name just like in your
  `gatsby-config.js` file.

`usePrismicPreview` can accept other options that override settings provided in
`gatsby-config.js`, but we will skip those for this walkthough.
[See a full list of options here](./previews-api.md#usePrismicPreview).

```jsx
// src/pages/preview.js

import React from 'react'
import { usePrismicPreview } from 'gatsby-source-prismic'

// Note that the `location` prop is taken and provided to the `usePrismicPreview` hook.
const PreviewPage = () => {
  const { isPreview, previewData, path } = usePrismicPreview({
    // The repositoryName value from your `gatsby-config.js`.
    repositoryName: 'myRepository',
  })

  return <div>Loading preview...</div>
}

export default PreviewPage
```

We now have preview data from Prismic, but we need to store it for use later.

## Save preview data globally

We'll need to save the preview data globally in order to use it on the
document's page. This could be a Redux store or a React Context value.

We'll just use `window` for simplicity.

```jsx
// src/pages/preview.js

import React, { useEffect } from 'react'
import { usePrismicPreview } from 'gatsby-source-prismic'

// Note that the `location` prop is taken and provided to the `usePrismicPreview` hook.
const PreviewPage = ({ location }) => {
  const { isPreview, previewData, path } = usePrismicPreview({
    // The repositoryName value from your `gatsby-config.js`.
    repositoryName: 'myRepository',
  })

  // This useEffect runs when values from usePrismicPreview update. When
  // preview data is available, this will save the data globally and redirect to
  // the previewed document's page.
  useEffect(() => {
    // If this is not a preview, skip.
    //   null = Not yet determined if previewing.
    //   true = Preview is available.
    //   false = Preview is not available.
    if (isPreview === false) return

    // Save the preview data to somewhere globally accessible. This could be
    // something like a global Redux store or React context.
    //
    // We'll just put it on window.
    window.__PRISMIC_PREVIEW_DATA__ = previewData
  }, [isPreview, previewData, path])

  // Tell the user if this is not a preview.
  if (isPreview === false) return <div>Not a preview!</div>

  return <div>Loading preview...</div>
}

export default PreviewPage
```

## Navigate to the document's page

Our last addition to the preview page will navigate the user to the previewed
document's page using Gatsby's navigate function.

We will also handle here the unpublished document case. So first let's create an
unpublished document route handler. For this example, let's assume we have a
page generated using a template at `src/templates/page.js`. If your site uses a
different template, you will need to adapt accordingly.

```js
// src/pages/unpublishedPreview.js

import { PageTemplate } from 'src/templates/page'

export const UnpublishedPage = (props) => {
  // const previewData = window.__PRISMIC_PREVIEW_DATA__
  // => Perform any logic from previewData to determine the correct page or template component to use.

  return <PageTemplate {...props} />
}

export default UnpublishedPage
```

Then let's modify our preview page. The call to `navigate()` is added at the end
of the `useEffect()`.

```jsx
// src/pages/preview.js

import React, { useEffect } from 'react'
import { navigate, useStaticQuery } from 'gatsby'
import { usePrismicPreview } from 'gatsby-source-prismic'

// Note that the `location` prop is taken and provided to the `usePrismicPreview` hook.
const PreviewPage = ({ location }) => {
  // Let's use a static query to retrieve all known paths. We'll use it later
  // to navigate to the unpublishedPreview page if the document is not
  // published.
  const { allSitePage } = useStaticQuery(graphql`
    {
      allSitePage {
        nodes {
          path
        }
      }
    }
  `)
  const allPaths = allSitePage.nodes.map((node) => node.path)

  const { isPreview, previewData, path } = usePrismicPreview({
    // The repositoryName value from your `gatsby-config.js`.
    repositoryName: 'myRepository',
  })

  // This useEffect runs when values from usePrismicPreview update. When
  // preview data is available, this will save the data globally and redirect to
  // the previewed document's page.
  useEffect(() => {
    // If this is not a preview, skip.
    //   null = Not yet determined if previewing.
    //   true = Preview is available.
    //   false = Preview is not available.
    if (isPreview === false || !previewData) return

    // Save the preview data to somewhere globally accessible. This could be
    // something like a global Redux store or React context.
    //
    // We'll just put it on window.
    window.__PRISMIC_PREVIEW_DATA__ = previewData

    // Navigate to the document's page if page exists.
    if (allPaths.includes(path)) {
      navigate(path)
    } else {
      navigate('/unpublishedPreview')
    }
  }, [isPreview, previewData, path])

  // Tell the user if this is not a preview.
  if (isPreview === false) return <div>Not a preview!</div>

  return <div>Loading preview...</div>
}

export default PreviewPage
```

## Merge with non-preview data

On the page or template that our preview page will navigate to, we'll use the
`mergePrismicPreviewData` helper to merge the preview data with the existing
static data.

This function accepts the static and preview data and recursively merges every
level. The resulting object should match the static data, but with the new
preview data where changed.

First, let's create a simple helper that can be reused in different templates:

```js
// src/utils/usePreviewData.js
import { useMemo } from 'react'
import { mergePrismicPreviewData } from 'gatsby-source-prismic'

// Returns true if we're in a browser, false otherwise. This will help guard
// against SSR issues when building the site.
const IS_BROWSER = typeof window !== 'undefined'

/**
 * Prismic preview hook
 * @param {object} staticData Data object from Gatsby page
 */
export default function usePreviewData(staticData) {
  return useMemo(() => {
    // If we're not in a browser (i.e. we're in SSR) or preview data has not been
    // set, use the non-preview static data.
    if (!IS_BROWSER || !window.__PRISMIC_PREVIEW_DATA__) return staticData

    return mergePrismicPreviewData({
      staticData,
      previewData: window.__PRISMIC_PREVIEW_DATA__,
    })
  }, [staticData])
}
```

For this example, let's assume we navigated to a page generated using a template
at `src/templates/page.js`. If your site uses a static page or a different
template, these changes will go there instead.

```javascript
// src/templates/page.js
import React from 'react'
import { graphql } from 'gatsby'
import usePreviewData from './utils/usePreviewData'

export const PageTemplate = ({ data }) => {
  const liveData = usePreviewData(data)

  return (
    <Layout>
      <h1>{liveData.prismicPage.data.title}</h1>
      <div
        dangerouslySetInnerHTML={{
          __html: liveData.prismicPage.data.body.html,
        }}
      />
    </Layout>
  )
}

export const query = graphql`
  query($id: String!) {
    prismicPage(id: { eq: $id }) {
      data {
        title
        body {
          html
        }
      }
    }
  }
`
```

## Wrap-up

After the last step, you should have a `/preview` page that fetches preview
data, redirects to the document's page, and displays the changed data along with
unchanged data.

The power of the preview system comes from the plugin's two main preview
functions:

- **`usePrismicPreview`**: React hook to fetch preview data using Prismic's
  preview URL parameters.
- **`mergePrismicPreviewData`**: Helper function to merge preview data with
  static data.

With both helpers, custom preview functionality can be built within your Gatsby
site. This guide shows a basic implementation, but the system allows for
building your own preview system tailored to your setup.

For more details on the preview functions' API, see the
[Previews API](./previews-api.md) document.

## Limitations

The preview setup described in this guide works well to preview changes in a
prismic document that maps directly to a page in your site.

When you click the "Preview" button in the prismic editor, you will be
redirected to the corresponding page in your website, and only the changes
associated to that document will be loaded. So the preview won't work for other
cases such as:

- static queries used in other components than a page component
- compound page queries where you load data from more than one prismic document

Also see other technical limitations described in the
[Previews API](./previews-api.md#limitations) document.

[prismic-setup-preview]:
  https://user-guides.prismic.io/en/articles/781294-how-to-set-up-a-preview
[prismic-releases]:
  https://user-guides.prismic.io/en/articles/778358-what-is-a-release
