# withPrismicPreviewResolver

This [higher order component][hoc] (HOC) is used to redirect an editor from the
Prismic writing room to a previewed document within your app. For example, if an
editor clicks the preview button for a blog post in the writing room, they will
land on the preview resolver page within your app, which then redirects them to
the blog post with previewed content.

Every app must have a preview resolver page to preview content. This page
usually will be created as `/preview` by creating a page at
`/src/pages/preview.js`. This page should be configured as the preview resolver
page in your Prismic repository's settings. For more information on updating
this setting within Prismic, see [Prismic's documentation on setting up
previews][how-to-set-up-a-preview].

If you choose to keep your access token private by not providing it as part of
the plugin's options, this HOC will display a modal allowing an editor to
provide it. It will save the token locally within the browser for future preview
updates.

```typescript
function withPrismicPreviewResolver(
  WrappedComponent: React.ComponentType,
  repositoryConfigs: Record<
    string,
    {
      linkResolver: LinkResolver
    }
  >,
  config: {
    autoRedirect?: boolean
  },
): React.ComponentType
```

- **`WrappedComponent`**<br/>The page component which will direct editors during
  preview sessions.

- **`repositoryConfigs`**<br/>A set of configuration values for each Prismic
  repository used in your app.

- **`config`**<br/>A set of configuration values that determine how editors are
  directed during preview sessions.

The following configuration should be provided for each Prismic repository used
in your app:

- **`linkResolver`**<br/>The [Link Resolver][link-resolver] used for the Prismic
  repository. This should be the same Link Resolver provided to
  [`gatsby-source-prismic`][gsp] in your app's `gatsby-config.js`. The return
  value of your Link Resolver determines the page to which editors will be
  directed.

Configuration values:

- **`autoRedirect`**<br/>An optional boolean that determines if editors should
  be automatically redirected to the previewed content's page within your app.
  This option defaults to `true`. If this option is set to `false`, editors will
  remain on the preview resolver page. In that situation, you can setup a
  redirect manually using the `prismicPreviewPath` prop.

## Typical Example

This example uses `withPrismicPreviewResolver()` to automatically direct an
editor from the Prismic writing room to the previewed content's page during a
preview session.

The page template component is written as a standard Gatsby page without any
special preview-specific code. In most cases, you can simply add
`withPrismicPreviewResolver()` around the default export to a simple placeholder
page to enable preview support.

```javascript
import * as React from 'react'
import { withPrismicPreviewResolver } from 'gatsby-plugin-prismic-previews'

import { linkResolver } from '../linkResolver'

const PreviewPage = () => {
  return (
    <div>
      <h1>Loading preview…</h1>
    </div>
  )
}

export default withPrismicPreviewResolver(PreviewPage, {
  'my-repository-name': { linkResolver },
})
```

[hoc]: https://reactjs.org/docs/higher-order-components.html
[link-resolver]: https://prismic.io/docs/technologies/link-resolver-gatsby
[gsp]: https://github.com/angeloashmore/gatsby-source-prismic
[how-to-set-up-a-preview]:
  https://user-guides.prismic.io/en/articles/781294-how-to-set-up-a-preview
