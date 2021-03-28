# gatsby-plugin-prismic-previews

Integrate live [Prismic Previews][prismic-previews] into a static Gatsby site to
enable editors a seamless content editing experience.

- Integrates tightly with the [Gatsby Prismic source
  plugin][gatsby-source-prismic]
- Adds the [Prismic Toolbar][prismic-toolbar] with an on-page edit button and
  preview link sharing.
- No extra infrastructure or costs required ([Gatsby Cloud][gatsby-cloud] not
  required)

## Install

```sh
npm install --save gatsby-plugin-prismic-previews gatsby-source-prismic
```

Or if you use Yarn:

```sh
yarn add gatsby-plugin-prismic-previews gatsby-source-prismic
```

Note that [`gatsby-source-prismic`][gatsby-source-prismic] is a peer dependency
of this plugin. The functionality of this plugin is closely connected to the
source plugin.

## Migrating from `gatsby-source-prismic`'s previews

This plugin replaces the preview functionality provided by
[`gatsby-source-prismic`]. If your site is set up for previews using the source
plugin, read the migration guide linked below to learn about the changes needed
to migrate.

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
        repositoryName: process.env.PRISMIC_REPOSITORY_NAME,

        // An API access token to your prismic.io repository. This is optional.
        // You can generate an access token in the "API & Security" section of
        // your repository settings. Setting a "Callback URL" is not necessary.
        // The token will be listed under "Permanent access tokens".
        //
        // If you choose to keep your access token private, do not provide this
        // plugin option. Editors will be prompted to enter an access token
        // during a preview session instead if required.
        //
        // Learn about environment variables: https://gatsby.dev/env-vars
        accessToken: process.env.PRISMIC_ACCESS_TOKEN,

        // Determine the type of Prismic Toolbar that is added to your site.
        // This defaults to "new". See the "Prismic Toolbar" section of the
        // plugin documentation for more details.
        // Note: The toolbar is required for previews to function and cannot be
        // disabled.
        toolbar: 'new',
      },
    },
  ],
}
```

Some options must be provided to the plugin exactly as they are provided to
`gatsby-source-prismic`. For example, if `gatsby-source-prismic` is configured
with a `lang` option, also provide the option to
`gatsby-plugin-prismic-previews`.

The following options should be provided to both `gatsby-source-prismic` and
`gatsby-plugin-prismic-previews` with the same values:

- `repositoryName`
- `apiEndpoint`
- `graphQuery`
- `fetchLinks`
- `lang`
- `imageImgixParams`
- `imagePlaceholderImgixParams`
- `typePrefix`

[gatsby-source-prismic]: ../gatsby-source-prismic
[prismic-previews]: #
[prismic-toolbar]: #
[gatsby-cloud]: https://www.gatsbyjs.com/cloud/
[gsp-migration-guide]: ./docs/migrating-from-gatsby-source-prismic.md
[dotenv]: https://github.com/motdotla/dotenv
[gatsby-env-vars]: https://gatsby.dev/env-vars
