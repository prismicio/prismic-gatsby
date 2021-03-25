# Migrating from `gatsby-source-prismic`

## Handling breaking changes

### Update `withPreview` to `withPrismicPreview`

In your preview-enabled page components or templates, update the `withPreview`
import to the `withPrismicPreview` import and provide additional arguments to
the function as described below.

```diff
- import { withPreview } from 'gatsby-source-prismic'
+ import { withPrismicPreview } from 'gatsby-plugin-prismic-previews'
  import { linkResolver } from '../linkResolver'

  const Page = ({ data }) => {
    // Your Page component
  }

- export default withPreview(Page)
+ export default withPrismicPreview(Page, 'your-repository-name', {
+   linkResolver,
+ })
```

`withPrismicPreview` takes the following arguments:

```javascript
withPrismicPreview(component, repositoryName, config)
```

- `component`: The page or template's component.
- `repositoryName`: Your Prismic repository name. This should be the same
  `repositoryName` from your plugin options in `gatsby-config.js`.
- `config`:
  - `linkResolver`: Your project's Link Resolver. This should be the same
    `linkResolver` provided to `gatsby-source-prismic` in `gatsby-config.js`.
  - `htmlSerializer` (optional): Your project's HTML Serializer. This should be
    the same `htmlSerializer` provided to `gatsby-source-prismic` in
    `gatsby-config.js`
  - `mergePreviewData` (default: `true`): `true` if preview data should be
    merged into the `data` prop automatically. You can set this option to
    `false` if you choose to merge the data manually.

### Update `withPreviewResolver` to `withPrismicPreviewResolver`

In your dedicated preview resolver page, update the `withPreviewResolver` import
to the `withPrismicPreviewResolver` import and update the arguments provided to
the function as described below. The preview resolver page is typically created
at `/src/pages/preview.js`.

```diff
- import { withPreviewResolver } from 'gatsby-source-prismic'
+ import { withPrismicPreviewResolver } from 'gatsby-plugin-prismic-previews'
  import { linkResolver } from '../linkResolver'

  const PreviewPage = ({ data }) => {
    // Your Page component
  }

- export default withPreviewResolver(PreviewPage, {
-   repositoryName: 'your-repository-name',
-   linkResolver,
- })
+ export default withPrismicPreview(PreviewPage, 'your-repository-name', {
+   linkResolver,
+ })
```

`withPrismicPreviewResolver` takes the following arguments:

```javascript
withPrismicPreviewResolver(component, repositoryName, config)
```

- `component`: The page component.
- `repositoryName`: Your Prismic repository name. This should be the same
  `repositoryName` from your plugin options in `gatsby-config.js`.
- `config`:
  - `linkResolver`: Your project's Link Resolver. This should be the same
    `linkResolver` provided to `gatsby-source-prismic` in `gatsby-config.js`.
  - `autoRedirect` (default: `true`): `true` if the page should automatically
    redirect to the previewed document's URL after it has been resolved. You can
    set this option to `false` if you choose to redirect manually.

### Update `withUnpublishedPreview` to `withPrismicUnpublishedPreview`

> TODO

In your dedicated preview page, update the `withUnpublishedPreview` import to
the `withPrismicUnpublishedPreview` import and update the arguments provided to
the function as described below. The unpublished preview page is typically
created as part of the "Not Found" 404 page at `/src/pages/404.js`.
