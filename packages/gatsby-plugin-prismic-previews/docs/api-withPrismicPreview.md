# withPrismicPreview

This [higher order component][hoc] (HOC) is used to connect preview content to
your app. It automatically updates a page's `data` prop with content from an
active preview session as needed.

If you choose to keep your access token private by not providing it as part of
the plugin's options, this HOC will also display a modal allowing an editor to
provide it. It will save the token locally within the browser for future preview
updates.

In order for this HOC to add preview content to your existing page data, you
must mark documents in your query as "previewable." This involves adding a
`_previewable` field to you query. An example of this is
[provided below](#typical-example).

```typescript
function withPrismicPreview(
  WrappedComponent: React.ComponentType,
  usePrismicPreviewResolverConfig: Record<
    string,
    {
      linkResolver: LinkResolver
      htmlSerializer?: HTMLSerializer
    }
  >,
  config: {
    mergePreviewData?: boolean
  },
): React.ComponentType
```

- **`WrappedComponent`**<br/>The page component to which Prismic previews will
  be connected.

- **`usePrismicPreviewResolverConfig`**<br/>A set of configuration values for
  each Prismic repository used in your app.

- **`config`**<br/>A set of configuration values that determine how the preview
  data is prepared and provided.

The following configuration should be provided for each Prismic repository used
in your app:

- **`linkResolver`**<br/>The [Link Resolver][link-resolver] used for the Prismic
  repository. This should be the same Link Resolver provided to
  [`gatsby-source-prismic`][gsp] in your app's `gatsby-config.js`.

- **`htmlSerializer`**<br/>The optional [HTML Serializer][html-serializer] used
  for the configured Prismic repository. This should be the same HTML Serializer
  provided to [`gatsby-source-prismic`][gsp] in your app's `gatsby-config.js`.

Configuration values:

- **`mergePreviewData`**<br/>An optional boolean that determines if previewed
  content should be automatically merged into the page's `data` prop. This
  option defaults to `true`. If this option is set to `false`, the `data` prop
  will remain unmodified during previews. In that situation, preview data can be
  manually merged using
  [`useMergePrismicPreviewData()`][usemergeprismicpreviewdata].

## Typical Example

This example uses `withPrismicPreview()` to automatically update a page
template's data to include preview content during a preview session.

The page template component is written as a standard Gatsby page without any
special preview-specific code. In most cases, you can simply add
`withPrismicPreview()` around the default export to an existing page template to
enable preview support.

The page's query includes a `_previewable` field for the queried document. This
tells the HOC to replace the document's data with preview content if available.
This special field should be included any time a document is queried, including
querying for documents within relationship fields.

```javascript
import * as React from 'react'
import { graphql } from 'gatsby'
import { withPrismicPreview } from 'gatsby-plugin-prismic-previews'

import { linkResolver } from '../linkResolver'

const PageTemplate = ({ data }) => {
  const page = data.prismicPage

  return (
    <div>
      <h1>{page.data.title.text}</h1>
    </div>
  )
}

export default withPrismicPreview(PageTemplate, {
  'my-repository-name': {
    linkResolver,
  },
})

export const query = graphql`
  query PageTemplate($id: ID!) {
    prismicPage(id: { eq: $id }) {
      _previewable
      data {
        title {
          text
        }
      }
    }
  }
`
```

[hoc]: https://reactjs.org/docs/higher-order-components.html
[link-resolver]: https://prismic.io/docs/technologies/link-resolver-gatsby
[gsp]: https://github.com/angeloashmore/gatsby-source-prismic
[html-serializer]:
  https://prismic.io/docs/technologies/html-serializer-javascript
[usemergeprismicpreviewdata]: ./useMergePrismicPreviewData.md
