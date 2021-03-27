# withPrismicPreview

This [higher order component][hoc] (HOC) is used to connect Prismic previews to
your app. It automatically updates a page's `data` prop with content from an
active preview session as needed.

If a preview session requires an access token to be provided, this HOC will also
display a modal and save the token for future preview updates.

```typescript
type WithPrismicPreviewConfig = {
  linkResolver: LinkResolver
  htmlSerializer?: HTMLSerializer
  mergePreviewData?: boolean
}

const withPrismicPreview: <
  TStaticData extends Record<PropertyKey, unknown>,
  TProps extends gatsby.PageProps<TStaticData>
>(
  WrappedComponent: React.ComponentType<TProps>,
  repositoryName: string,
  config: WithPrismicPreviewConfig,
) => React.ComponentType<TProps & WithPrismicPreviewProps<TStaticData>>
```

- **`WrappedComponent`**: The page component to which Prismic previews will be
  connected.
- **`repositoryName`**: The name of the Prismic repository that contains your
  content. This should match the `repositoryName` option provided in the
  plugin's configuration in your app's `gatsby-config.js`.
- **`config`**: A set of configuration values that determine how the preview
  data is prepared and manipulated.

Configuration values:

- **`linkResolver`**: The [Link Resolver][link-resolver] used for the configured
  Prismic repository. This should be the same Link Resolver provided to
  [`gatsby-source-prismic`][gsp] in your app's `gatsby-config.js`.
- **`htmlSerializer`**: The optional [HTML Serializer][html-serializer] used for
  the configured Prismic repository. This should be the same HTML Serializer
  provided to [`gatsby-source-prismic`][gsp] in your app's `gatsby-config.js`.
- **`mergePreviewData`**: An optional boolean that determines if previewed
  content should be merged into the page's `data` prop. This option defaults to
  `true`. If this option is set to `false`, the `data` prop will remain
  unmodified during previews. In that situation, preview data can be manually
  merged using [`useMergePrismicPreviewData`][usemergeprismicpreviewdata].

## Typical Example

This example uses `withPrismicPreview` to automatically update a page template's
data to include preview content during a preview session.

The page template component is written as a standard Gatsby page without any
special preview-specific code. In most cases, you can simply add
`withPrismicPreview` around the default export to an existing page template to
enable preview support.

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

export default withPrismicPreview(PageTemplate, 'my-repository-name', {
  linkResolver,
})
```

[hoc]: https://reactjs.org/docs/higher-order-components.html
[link-resolver]: https://prismic.io/docs/technologies/link-resolver-gatsby
[gsp]: https://github.com/angeloashmore/gatsby-source-prismic
[html-serializer]:
  https://prismic.io/docs/technologies/html-serializer-javascript
[usemergeprismicpreviewdata]: ./useMergePrismicPreviewData.md
