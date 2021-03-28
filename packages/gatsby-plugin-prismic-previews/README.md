# gatsby-plugin-prismic-previews

Integrate live [Prismic Previews][prismic-previews] into a static Gatsby site to
enable editors a seamless content editing experience.

- Integrates tightly with the [Gatsby Prismic source plugin][gsp]
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

- Link Resolver function
- Preview resolver page
- Content pages and templates
- 404 Not Found page

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
      return `/`
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
page in your Prismic repository's settings. For more information on updating
this setting within Prismic, see [Prismic's documentation on setting up
previews][how-to-set-up-a-preview].

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

## Prismic Toolbar

[gsp]: ../gatsby-source-prismic
[prismic-previews]: #
[prismic-toolbar]: #
[gatsby-cloud]: https://www.gatsbyjs.com/cloud/
[gsp-migration-guide]: ./docs/migrating-from-gatsby-source-prismic.md
[dotenv]: https://github.com/motdotla/dotenv
[gatsby-env-vars]: https://gatsby.dev/env-vars
[prismic-link-resolver]:
  https://prismic.io/docs/technologies/link-resolver-gatsby
