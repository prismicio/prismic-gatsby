# Previewing with Prismic

`gatsby-source-prismic`'s preview tries to be unopinionated in its
implementation. This allows the system to be flexible and work alongside other
parts of your site.

As a result, there is some setup involved in order to hook into previews.

## Summary

- **Create a preview page**

  Create a page to which Prismic will redirect previews.

- **Get preview data**

  Query for your preview data with the `usePrismicPreview` hook on your preview
  page.

- **Save preview data globally**

  Save your preview data globally (e.g. `window` or Redux) and navigate to your
  previewed document's page using Gatsby's `navigate` function.

- **Merge with non-preview data**

  On your page or template, read your `previewData` from your global store and
  pass it to the `mergePrismicPreviewData` helper function along with your
  normal static data from Gatsby.

- **Pass data to your page**

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

import { Spinner } from '../components/Spinner'

// Note that the `location` prop is taken and provided to the `usePrismicPreview` hook.
const PreviewPage = ({ location }) => {
  const { isPreview, previewData, path } = usePrismicPreview(location, {
    // The repositoryName value from your `gatsby-config.js`.
    repositoryName: 'myRepository',
  })

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

## Get preview data

## Save preview data globally

## Merge with non-preview data

## Pass data to your page
