```jsx
// src/pages/preview.js

import React, { useEffect } from 'react'
import { navigate } from 'gatsby'
import { usePrismicPreview } from 'gatsby-source-prismic'

// Note that the `location` prop is taken and provided to the `usePrismicPreview` hook.
const PreviewPage = ({ location }) => {
  const { isPreview, previewData, path } = usePrismicPreview(location, {
    // The repositoryName value from your `gatsby-config.js`.
    repositoryName: 'myRepository',
  })

  // This useEffect runs when values from usePrismicPreview update. When
  // preview data is available, this will save the data globally and redirect to
  // the previewed document's page.
  useEffect(() => {
    // If this is not a preview, skip.
    if (!isPreview) return

    // Save the preview data to somewhere globally accessible. This could be
    // something like a global Redux store or React context.
    //
    // We'll just put it on window.
    window.__PRISMIC_PREVIEW_DATA__ = previewData

    // Navigate to the document's page.
    navigate(path)
  }, [isPreview, previewData, path])

  // Tell the user if this is not a preview.
  if (isPreview === false) return <div>Not a preview!</div>

  return <div>Loading preview...</div>
}

export default PreviewPage
```

# Previewing with Prismic

`gatsby-source-prismic`'s preview system aims to be unopinionated on how you
implement it. This allows the system to be flexible and work alongside other
parts of your site.

The following guide is a recommended approach to implementing previews, but
customizations are encouraged.

## Summary

Each step is described in full detail below.

1. [**Create a preview page**](#create-a-preview-page)

   Create a page to which Prismic will redirect previews.

1. [**Get preview data**](#get-preview-data)

   Query for your preview data with the `usePrismicPreview` hook on your preview
   page.

1. [**Save preview data globally**](#save-preview-data-globally)

   Save your preview data globally (e.g. `window` or Redux) and navigate to your
   previewed document's page using Gatsby's `navigate` function.

1. [**Merge with non-preview data**](#merge-with-non-preview-data)

   On your page or template, read your `previewData` from your global store and
   pass it to the `mergePrismicPreviewData` helper function along with your
   normal static data from Gatsby.

1. [**Pass data to your page**](#pass-data-to-your-page)

   Pass your merged data to your template exactly where you would your static
   data.

## Create a preview page

Prismic sends previews to an endpoint on your site along with data represeting
the preview. This endpoint can be set to any page, but `/preview` is the most
common choice. The rest of this guide assumes the endpoint to be `/preview`, but
you can replace this as needed.

First, create the preview page within your project.

```jsx
// src/pages/preview.js

import React, { useEffect } from 'react'
import { navigate } from 'gatsby'
import { usePrismicPreview } from 'gatsby-source-prismic'

const PreviewPage = ({ location }) => {
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
- **`location`**: The `location` prop from Gatsby to grab the preview URL.

```jsx
// src/pages/preview.js

import React, { useEffect } from 'react'
import { navigate } from 'gatsby'
import { usePrismicPreview } from 'gatsby-source-prismic'

// Note that the `location` prop is taken and provided to the `usePrismicPreview` hook.
const PreviewPage = ({ location }) => {
  const { isPreview, previewData, path } = usePrismicPreview(location, {
    // The repositoryName value from your `gatsby-config.js`.
    repositoryName: 'myRepository',
  })

  return <div>Loading preview...</div>
}

export default PreviewPage
```

We now have preview data from Prismic, but we need to store it for use later.

## Save preview data globally

We'll need to save the preview data globally in order provide the previewed
document's page the preview data. This could be a Redux store or a React Context
value.

We'll just use `window` for simplicity.

```jsx
// src/pages/preview.js

import React, { useEffect } from 'react'
import { navigate } from 'gatsby'
import { usePrismicPreview } from 'gatsby-source-prismic'

// Note that the `location` prop is taken and provided to the `usePrismicPreview` hook.
const PreviewPage = ({ location }) => {
  const { isPreview, previewData, path } = usePrismicPreview(location, {
    // The repositoryName value from your `gatsby-config.js`.
    repositoryName: 'myRepository',
  })

  // This useEffect runs when values from usePrismicPreview update. When
  // preview data is available, this will save the data globally and redirect to
  // the previewed document's page.
  useEffect(() => {
    // If this is not a preview, skip.
    if (!isPreview) return

    // Save the preview data to somewhere globally accessible. This could be
    // something like a global Redux store or React context.
    //
    // We'll just put it on window.
    window.__PRISMIC_PREVIEW_DATA__ = previewData
  }, [isPreview, previewData, path])

  return <div>Loading preview...</div>
}

export default PreviewPage
```

## Navigate to the document's page

```jsx
// src/pages/preview.js

import React, { useEffect } from 'react'
import { navigate } from 'gatsby'
import { usePrismicPreview } from 'gatsby-source-prismic'

// Note that the `location` prop is taken and provided to the `usePrismicPreview` hook.
const PreviewPage = ({ location }) => {
  const { isPreview, previewData, path } = usePrismicPreview(location, {
    // The repositoryName value from your `gatsby-config.js`.
    repositoryName: 'myRepository',
  })

  // This useEffect runs when values from usePrismicPreview update. When
  // preview data is available, this will save the data globally and redirect to
  // the previewed document's page.
  useEffect(() => {
    // If this is not a preview, skip.
    if (!isPreview) return

    // Save the preview data to somewhere globally accessible. This could be
    // something like a global Redux store or React context.
    //
    // We'll just put it on window.
    window.__PRISMIC_PREVIEW_DATA__ = previewData

    // Navigate to the document's page.
    navigate(path)
  }, [isPreview, previewData, path])

  // Tell the user if this is not a preview.
  if (isPreview === false) return <div>Not a preview!</div>

  return <div>Loading preview...</div>
}

export default PreviewPage
```

## Merge with non-preview data

## Pass data to your page
