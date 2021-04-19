# gatsby-plugin-prismic-previews

Integrate live [Prismic Previews][prismic-previews] into a static
[Gatsby][gatsby] site to enable editors a seamless content editing experience.

- Integrates tightly with the [Gatsby Prismic source plugin][gsp]
- Refreshes preview content automatically as changes are saved in Prismic
- Adds the [Prismic Toolbar][prismic-toolbar] with an in-app edit button and
  preview link sharing.
- No extra infrastructure or costs required (specifically, [Gatsby
  Cloud][gatsby-cloud] is not required)

## Install

```sh
npm install --save gatsby-plugin-prismic-previews gatsby-source-prismic
```

Or if you use Yarn:

```sh
yarn add gatsby-plugin-prismic-previews gatsby-source-prismic
```

Note that [`gatsby-source-prismic`][gsp] is a peer dependency of this plugin.
The functionality of this plugin is closely connected to the source plugin.

## Migrating from `gatsby-source-prismic`'s previews

This plugin replaces the preview functionality provided by
[`gatsby-source-prismic`][gsp]. If your site is set up for previews using the
source plugin, read the migration guide linked below to learn about the changes
needed to migrate.

**Guide**: [Migrating from `gatsby-source-prismic`][gsp-migration-guide]

## How to use

First, you need a way to pass environment variables to the build process so
secrets and other secured data aren't committed to source control. We recommend
using [`dotenv`][dotenv] which will then expose environment variables. [Read
more about dotenv and using environment variables here][gatsby-env-vars]. Then
we can use these environment variables and configure our plugin.

```javascript
// In your gatsby-config.js

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-prismic',
      options: {
        // Be sure to setup gatsby-source-prismic alongside gatsby-plugin-prismic-previews.
      },
    },
    {
      resolve: 'gatsby-plugin-prismic-previews',
      options: {
        // The name of your Prismic repository. This is required.
        // Example: 'your-repository-name' if your prismic.io address
        // is 'your-repository-name.prismic.io'.
        //
        // Learn about environment variables: https://gatsby.dev/env-vars
        repositoryName: process.env.GATSBY_PRISMIC_REPOSITORY_NAME,

        // An API access token to your Prismic repository. This is optional.
        // You can generate an access token in the "API & Security" section of
        // your repository settings. Setting a "Callback URL" is not necessary.
        // The token will be listed under "Permanent access tokens".
        //
        // If you choose to keep your access token private, do not provide this
        // plugin option. Editors will be prompted to enter an access token
        // during a preview session instead, if required.
        //
        // Learn about environment variables: https://gatsby.dev/env-vars
        accessToken: process.env.PRISMIC_ACCESS_TOKEN,

        // Determines the type of Prismic Toolbar that is added to your site.
        // This defaults to "new". See the "Prismic Toolbar" section of the
        // plugin documentation for more details.
        //
        // Note: The toolbar is required for previews to function and cannot be
        // disabled.
        toolbar: 'new',
      },
    },
  ],
}
```

Some options must be provided to the plugin exactly as they are provided to
[`gatsby-source-prismic`][gsp]. For example, if [`gatsby-source-prismic`][gsp]
is configured with a `lang` option, that option must also be provided to
`gatsby-plugin-prismic-previews`.

The following options should be provided to both [`gatsby-source-prismic`][gsp]
and `gatsby-plugin-prismic-previews` with the same values:

- `repositoryName`
- `apiEndpoint`
- `graphQuery`
- `fetchLinks`
- `lang`
- `imageImgixParams`
- `imagePlaceholderImgixParams`
- `typePrefix`

See the [`gatsby-source-prismic` documentation][gsp] for details on each option.

## Connecting your pages

Once the plugin is configured in `gatsby-config.js`, your app will need to be
conneted to the plugin's system. The following files will need to be created or
edited:

- [**Link Resolver function**](#link-resolver-function)<br/>A function used to
  determine a document's URL within your app.

- [**Preview resolver page**](#preview-resolver-page)<br/>A page used to direct
  editors to a document's page during a preview session.

- [**Content pages and templates**](#content-pages-and-templates)<br/>Your app's
  pages with content from Prismic.

- [**404 Not Found page**](#404-not-found-page)<br/>Your app's 404 page which
  will be used to displays previews for unpublished documents.

### Link Resolver function

When working with field types such as a
[Link](https://user-guides.prismic.io/en/articles/383950-link) or a
[Rich Text](https://user-guides.prismic.io/en/articles/383762-rich-text) in a
Gatsby project, a function is required to convert a Prismic document to a
specific URL within your app.

This plugin will use your Link Resolver to send editors to the correct page in
your app during a preview.

See [Prismic's documentation on creating a Link Resolver][prismic-link-resolver]
for your app.

A simple example of a Link Resolver looks like this, but will need to be
customized for your app.

```javascript
// src/linkResolver.js

export const linkResolver = (doc) => {
  switch (doc.type) {
    // URL for a Page document
    case 'page':
      return `/${doc.uid}`

    // URL for a Blog Post document
    case 'blog_post':
      return `/blog/${doc.uid}`

    // Fallback for all other documents
    default:
      return '/'
  }
}
```

### Preview resolver page

The preview resolver page routes editors from the Prismic writing room to a
previewed document within your app. For example, if an editor clicks the preview
button for a blog post in the writing room, they will land on the preview
resolver page within your app, which then redirects them to the blog post with
previewed content.

Every app must have a preview resolver page to preview content. This page
usually will be created as `/preview` by creating a page at
`/src/pages/preview.js`. This page should be configured as the preview resolver
page in your Prismic repository's settings.

For more information on updating this setting within Prismic, see [Prismic's
documentation on setting up previews][prismic-how-to-set-up-a-preview].

This is what a simple preview resolver page could look like:

```javascript
// src/pages/preview.js

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
  [process.env.GATSBY_PRISMIC_REPOSITORY_NAME]: { linkResolver },
})
```

You can see that the Link Resolver provided to `withPrismicPreviewResolver()` is
nested under your Prismic repository's name. This allows you to setup additional
repositories separately, if needed. For example, if your app displays content
from two repositories, each with their own Link Resolver, your
`withPrismicPreviewResolver()` would look something like this:

```javascript
import { mainLinkResolver } from '../mainLinkResolver'
import { secondaryLinkResolver } from '../secondaryLinkResolver'

export default withPrismicPreviewResolver(PreviewPage, {
  [process.env.GATSBY_PRISMIC_MAIN_REPOSITORY_NAME]: {
    linkResolver: mainLinkResolver,
  },
  [process.env.GATSBY_PRISMIC_SECONDARY_REPOSITORY_NAME]: {
    linkResolver: secondaryLinkResolver,
  },
})
```

For more details on setting up a preview resolver page and the available
customizations, see the
[`withPrismicPreviewResolver()`](./docs/api-withPrismicPreviewResolver.md)
reference.

### Content pages and templates

Your app's pages and templates usually contain GraphQL queries to Gatsby's data
layer to fetch content from Prismic. In order for this content to be updated
during a preview, pages must be connected to the preview system using a function
called [`withPrismicPreview()`](./docs/api-withPrismicPreview.md). It
automatically updates a page's `data` prop with content from an active preview
session as needed.

In order for this HOC to add preview content to your existing page data, you
must mark documents in your query as "previewable." This involves adding a
`_previewable` field to your query.

This is what a simple preview-connected page template could look like:

```javascript
// src/pages/{PrismicPage.uid}.js

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
  [process.env.GATSBY_PRISMIC_REPOSITORY_NAME]: { linkResolver },
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

The page template component is written as a standard Gatsby page without any
special preview-specific code. In most cases, you can simply add
`withPrismicPreview()` around the default export to an existing page template to
enable preview support.

The page's query includes a `_previewable` field for the queried document. This
tells the HOC to replace the document's data with preview content if available.
This special field should be included any time a document is queried, including
querying for documents within relationship fields.

You can see that the Link Resolver provided to `withPrismicPreview()` is nested
under your Prismic repository's name. This allows you to setup additional
repositories separately, if needed. For example, if your app displays content
from two repositories, each with their own Link Resolver, your
`withPrismicPreview()` would look something like this:

```javascript
import { mainLinkResolver } from '../mainLinkResolver'
import { secondaryLinkResolver } from '../secondaryLinkResolver'

export default withPrismicPreview(PageTemplate, {
  [process.env.GATSBY_PRISMIC_MAIN_REPOSITORY_NAME]: {
    linkResolver: mainLinkResolver,
  },
  [process.env.GATSBY_PRISMIC_SECONDARY_REPOSITORY_NAME]: {
    linkResolver: secondaryLinkResolver,
  },
})
```

For more details on connecting your pages and templates to preview data and the
available customizations, see the
[`withPrismicPreview()`](./docs/api-withPrismicPreview.md) reference.

### 404 Not Found page

Your app's 404 page is displayed any time a user accesses a page that does not
exist. This can be used to our advantage when trying to preview a page that has
yet to be published. Because the page is not yet published, a page for it does
not exist in your app. As a result, we can override the normal 404 page and
render the previewed document instead automatically as needed.

This is what a simple unpublished preview 404 page could look like:

```javascript
// src/pages/404.js

import * as React from 'react'
import { graphql } from 'gatsby'
import {
  withPrismicUnpublishedPreview,
  componentResolverFromMap,
} from 'gatsby-plugin-prismic-previews'

import { PageTemplate } from './PageTemplate'
import { linkResolver } from '../linkResolver'

const NotFoundPage = ({ data }) => {
  const page = data.prismicPage

  return (
    <div>
      <h1>{page.data.title.text}</h1>
    </div>
  )
}

export default withPrismicUnpublishedPreview(
  PageTemplate,
  { 'my-repository-name': { linkResolver } },
  {
    componentResolver: componentResolverFromMap({
      page: PageTemplate,
    }),
  },
)

export const query = graphql`
  query NotFoundPage {
    prismicPage(id: { eq: "404" }) {
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

## Prismic Toolbar

The [Prismic Toolbar][prismic-toolbar] adds an in-app edit button when an editor
is signed into Prismic and automatic refreshing when content is updated in the
writing room. It also facilitates the preview process by setting up data in the
background that this plugin then reads.

By default, the newer, current version of the toolbar is used. All new and
recently created Prismic repositories will use this version of the toolbar and
requires no extra settings.

If your repository is older, it may not support the latest version of the
toolbar. Don't worry, previews will still work! But you will need to tell the
plugin to use an older version of the toolbar. To check if your repository
requires the older toolbar, perform the following steps:

1. Sign in to the writing room for your Prismic repository.
1. Navigate to your repository's Settings page.
1. Select the Previews section.
1. On that page, check the "Include the Prismic Toolbar JavaScript file" code
   snippet.

   If it looks like this, you can use the latest version of the toolbar which
   requires no extra settings:

   ```html
   <script
     async
     defer
     src="https://static.cdn.prismic.io/prismic.js?new=true&repo=your-repository-name"
   ></script>
   ```

   If it looks like this, you need to use the "legacy" version of the toolbar
   which requires setting the `toolbar` plugin option:

   ```html
   <script>
     window.prismic = {
       endpoint: 'https://your-repository-name.cdn.prismic.io/api/v2',
     }
   </script>
   <script
     type="text/javascript"
     src="https://static.cdn.prismic.io/prismic.min.js"
   ></script>
   ```

If you need to use the legacy version of the toolbar, update your plugin options
in `gatsby-config.js` to include the following `toolbar` option. This will
perform the toolbar setup described in the code snippet automatically.

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-plugin-prismic-previews',
      options: {
        // Alongside your other options...
        toolbar: 'legacy',
      },
    },
  ],
}
```

## Limitations

There are limitations to client-side previewing since it is only being processed
in your browser. Features that require build-time processing, such as
`gatsby-transformer-sharp` or [field aliasing][gatsby-graphql-aliasing], cannot
be handled within the browser.

See the [Limtiations](./docs/limitations.md) documentation for a list of things
to keep in mind and useful strategies.

[gatsby]: https://www.gatsbyjs.com/
[gsp]: ../gatsby-source-prismic
[prismic-previews]: #
[prismic-toolbar]: #
[gatsby-cloud]: https://www.gatsbyjs.com/cloud/
[gsp-migration-guide]: ./docs/migrating-from-gatsby-source-prismic.md
[dotenv]: https://github.com/motdotla/dotenv
[gatsby-env-vars]: https://gatsby.dev/env-vars
[prismic-link-resolver]:
  https://prismic.io/docs/technologies/link-resolver-gatsby
[prismic-how-to-set-up-a-preview]:
  https://user-guides.prismic.io/en/articles/781294-how-to-set-up-a-preview
[gatsby-graphql-aliasing]:
  https://www.gatsbyjs.com/docs/graphql-reference/#aliasing
