# gatsby-source-prismic

Source plugin for pulling data into [Gatsby][gatsby] from [Prismic][prismic]
repositories.

- Supports Rich Text fields, [Slices][prismic-slices], and content relation
  fields
- Supports `gatsby-image` using [Imgix][prismic-imgix] or
  `gatsby-transformer-sharp`
- Utilizes `prismic-dom` to convert content into HTML so you don't have to use
  `prismic-dom` directly
- Supports live, client-side [Prismic previews][prismic-previews] using
  [`gatsby-plugin-prismic-previews`][gppp]

## Install

```sh
npm install --save gatsby-source-prismic
```

Or if you use Yarn:

```sh
yarn add gatsby-source-prismic
```

## Migration Guide

Read the migration guide to learn why and how to upgrade from v3 to v4.

**Guide**: [Migrating from v3 to v4](./docs/migrating-from-v3-to-v4.md)

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
    /*
     * Gatsby's data processing layer begins with “source”
     * plugins. Here the site sources its data from Prismic.
     */
    {
      resolve: 'gatsby-source-prismic',
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
        accessToken: process.env.PRISMIC_ACCESS_TOKEN,

        // If you provide a release ID, the plugin will fetch data from Prismic
        // for a specific release. A Prismic release is a way to gather a
        // collection of changes for a future version of your website. Note that
        // if you add changes to a release, you'll need to rebuild your website
        // to see them.
        //
        // See: https://user-guides.prismic.io/en/articles/778358-what-is-a-release
        releaseID: process.env.PRISMIC_RELEASE_ID,

        // Provide an object of Prismic custom type JSON schemas to load into
        // Gatsby. This is required.
        schemas: {
          // Your custom type JSON schemas.
        },

        // Set a Link Resolver function used to process links in your content.
        // Fields with Rich Text formatting or links to internal content use this
        // function to generate the correct link URL.
        //
        // See: https://prismic.io/docs/javascript/query-the-api/link-resolving
        linkResolver: (doc) => {
          // Return a URL for the document.
        },

        // Define a set of documents fields to fetch from Prismic. By default,
        // all top-level fields will be fetched for all documents. If you need
        // to fetch nested content to make available in your Link Resolver
        // function, provide a GraphQuery here.
        //
        // See: https://prismic.io/docs/technologies/graphquery-rest-api
        graphQuery: `
          {
            // Your graphQuery
          }
        `,

        // Set an HTML Serializer function used to process formatted content.
        // Fields with Rich Text formatting use this function to generate its
        // HTML.
        //
        // See: https://prismic.io/docs/technologies/html-serializer-javascript
        htmlSerializer: (type, element, content, children) => {
          // Return HTML for an piece of content.
        },

        // Set a default language when fetching documents. The default value is
        // '*' which will fetch all languages.
        //
        // See: https://prismic.io/docs/javascript/query-the-api/query-by-language
        lang: '*',

        // Provide a default set of Imgix image transformations applied to
        // Imgix-backed gatsby-image fields. These options will override the
        // defaults set by Prismic.
        //
        // See: https://docs.imgix.com/apis/url
        imageImgixParams: {
          auto: 'compress,format',
          fit: 'max',
          q: 50,
        },

        // Provide a default set of Imgix image transformations applied to
        // the placeholder images of Imgix-backed gatsby-image fields. These
        // parameters will be applied over those provided in the above
        // `imageImgixParams` option.
        //
        // See: https://docs.imgix.com/apis/url
        imagePlaceholderImgixParams: {
          w: 100,
          blur: 15,
          q: 50,
        },

        // The API endpoint used to fetch content from Prismic. You can omit
        // this option in most cases unless you require an API proxy or need to
        // mock network responses. By default, your repository's standard
        // endpoint will be used.
        apiEndpoint: process.env.PRISMIC_API_ENDPOINT,

        // A prefix used for all GraphQL types for your Prismic repository. If
        // you are sourcing from multiple repositories, each plugin should have
        // a unique typePrefix to avoid type conflicts. This is optional if you
        // are sourcing from a single repository.
        typePrefix: 'Prefix',

        // If your Prismic repository's webhooks are configured to send a
        // secret, provide the secret here. Using a secret allows you to confirm
        // the webhook is from Prismic. This is optional and only used if your
        // site is integrated with Gatsby Cloud.
        //
        // See: https://user-guides.prismic.io/en/articles/790505-webhooks
        webhookSecret: process.env.PRISMIC_WEBHOOK_SECRET,
      },
    },
  ],
}
```

## Providing JSON schemas

In order for Gatsby to know about your Prismic custom types, you must provide
the full JSON schema of each custom type. This is done via the plugin's
`schemas` option in `gatsby-config.js`.

The recommended approach is to create a `schemas` directory in your project and
import them into your `gatsby-config.js` file.

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: 'gatsby-source-prismic',
    options: {
      // ...
      schemas: {
        page: require('./src/schemas/page.json'),
        blog_post: require('./src/schemas/blog_post.json'),
      },
      // ...
    },
  },
]
```

Each schema file should be populated with the contents of the "JSON editor" tab
in the Prismic Custom Type editor.

**Note**: The names of your schemas in the `schemas` object should be _exactly_
the same as your custom type's API ID. For example, if your API ID is
"`blog-post`", your key should be "`blog-post`", not "`blog_post`".

See the official docs for more details on version controlling your custom types:
[How to version custom types][prismic-version-custom-types].

## How to query

You can query nodes created from Prismic using GraphQL like the following:

**Note**: Learn to use the GraphQL tool and Ctrl+Spacebar at
<http://localhost:8000/___graphql> to discover the types and properties of your
GraphQL model.

```graphql
{
  allPrismicPage {
    edges {
      node {
        id
        uid
        first_publication_date
        last_publication_date
        data {
          title {
            text
          }
          content {
            html
          }
        }
      }
    }
  }
}
```

All documents are pulled from your repository and created as
`prismic${contentTypeName}` and `allPrismic${contentTypeName}`, where
`${contentTypeName}` is the API ID of your document's content type.

For example, if you have `Product` as one of your content types, you will be
able to query it like the following:

```graphql
{
  allPrismicProduct {
    edges {
      node {
        id
        data {
          name
          price
          description {
            html
          }
        }
      }
    }
  }
}
```

### Query Rich Text fields

Data from fields with rich text formatting (e.g. headings, bold, italic) is
transformed to provide HTML and text versions. This uses the official
[prismic-dom][prismic-dom] library and the `linkResolver` and `htmlSerializer`
functions from your site's `gatsby-node.js` to create the HTML and text fields.

**Note**: If you need to access the raw data, the original data is accessible
using the `raw` field, though use of this field is discouraged.

```graphql
{
  allPrismicPage {
    edges {
      node {
        id
        data {
          title {
            text
          }
          content {
            html
          }
        }
      }
    }
  }
}
```

### Query Link fields

Link fields are processed using the official [prismic-dom][prismic-dom] library
and the `linkResolver` function from your site's `gatsby-config.js`. The
resolved URL is provided at the `url` field.

If the link type is a web link (i.e. a URL external from your site), the URL is
provided without additional processing.

All other URL fields, such as `target`, `lang`, and `isBroken`, are provided on
the field as well.

The `target` field defaults to an empty string. This allows you to always query
the `target` field even if it is not set in Prismic.

**Note**: If you need to access the raw data, the original data is accessible
using the `raw` field, though use of this field is discouraged.

```graphql
{
  allPrismicPage {
    edges {
      node {
        id
        data {
          featured_post {
            url
            target
          }
        }
      }
    }
  }
}
```

### Query Image fields

Prismic allows setting multiple images for a single image field with optional
constraints. This is useful when different versions of an image are required
based on its surrouding context. One such example could be a responsive image
where a different image may be necessary on smaller or larger screens.

Image thumbnails are available on the `thumbnail` field of all image fields.

See the official docs for more details on configuring thumbnails on your custom
types: [How to set up responsive images][prismic-responsive-images].

See the [Image processing](#Image-processing) section to learn how to enable
Gatsby Image support.

```graphql
{
  allPrismicPage {
    edges {
      nodes {
        data {
          image_field {
            url
            thumbnails {
              thumbnail_name {
                url
              }
            }
          }
        }
      }
    }
  }
}
```

### Query Content Relation fields

Content Relation fields relate a field to another document. Since fields from
within the related document is often needed, the document data is provided at
the `document` field. The resolved URL to the document using the official
[prismic-dom][prismic-dom] library and the `linkResolver` function from your
site's `gatsby-node.js` is also provided at the `url` field.

Querying data on the `document` field is handled the same as querying slices.
Please read the [Query slices](#query-slices) section for details.

**Note**: If you need to access the raw data, the original data is accessible
using the `raw` field, though use of this field is discouraged.

```graphql
{
  allPrismicPage {
    edges {
      node {
        id
        data {
          featured_post {
            url
            document {
              __typename
              ... on PrismicPost {
                data {
                  title {
                    text
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### Query Media fields

Media fields can be populated with files such as PDFs, ZIPs, or images. The URL
to a field's file can be served from Prismic's CDN or can be downloaded locally
to be served with your app.

Querying for the `localFile` field will tell Gatsby to download the file
locally. To add `publicURL` as an available field, which copies the file into
your app's `/static` directory, add
[`gatsby-source-filesystem`][gatsby-source-filesystem] to your project.

**Note**: `gatsby-source-filesystem` requires pointing the plugin to a directory
within your app. If you aren't using `gatsby-source-filesystem` for any other
purpose in your app, you can set its `path` parameter to any directory in your
project. Adding `gatsby-source-filesystem` is the only way to register the
`publicURL` field.

```graphql
{
  allPrismicPage {
    edges {
      nodes {
        data {
          media_field {
            url
            localFile {
              publicURL
            }
          }
        }
      }
    }
  }
}
```

### Query slices

Prismic slices allow you to build a flexible series of content blocks. Since the
content structure is dynamic, querying the content is handled differently than
other fields.

To access slice fields, you need to use GraphQL [inline
fragments][graphql-inline-fragments]. This requires you to know types of nodes.
The easiest way to get the type of nodes is to use the `/___graphql` debugger
and run the below query (adjust the document type and field name).

```graphql
{
  allPrismicPage {
    edges {
      node {
        id
        data {
          body {
            __typename
          }
        }
      }
    }
  }
}
```

When you have node type names, you can use them to create inline fragments.

Full example:

```graphql
{
  allPrismicPage {
    edges {
      node {
        id
        data {
          body {
            __typename
            ... on PrismicPageBodyRichText {
              text {
                html
              }
            }
            ... on PrismicPageBodyQuote {
              quote {
                html
              }
              credit {
                text
              }
            }
            ... on PrismicPageBodyFootnote {
              content {
                html
              }
            }
          }
        }
      }
    }
  }
}
```

### Query direct API data as a fallback

If you find you cannot query the data you need through the GraphQL interface,
you can get the raw response from the [prismic-javascript][prismic-javascript]
API using the `dataRaw` field.

This field contains the whole node's original data before processing as a single
object. You will receive a JSON object which means you cannot query for
individual fields within it.

This is absolutely discouraged as it defeats the purpose of Gatsby's GraphQL
data interface, but it is available if necessary

```graphql
{
  allPrismicPage {
    edges {
      node {
        id
        dataRaw
      }
    }
  }
}
```

### Image processing

You can process images using one of the following methods:

- **Recommended: On-the-fly transformed using Imgix**: Images are **not**
  downloaded to your computer or server and instead are transformed using
  Prismic's Imgix integration to resize images on-the-fly.
- **Locally transformed at build-time**: Images are downloaded to your computer
  or server which resizes images at build-time.

You can apply image processing to any image field and its thumbnails on a
document. Image processing of inline images added to Rich Text fields is
currently not supported.

#### Using Imgix transformed images

Using this method, images are manipulated on Imgix's servers at request time,
eliminating the need to download and resize images on your computer or server.

To access image processing in your queries, you need to use this pattern, where
`...ImageFragment` is one of the following fragments:

- `GatsbyPrismicImageFixed`
- `GatsbyPrismicImageFixed_noBase64`
- `GatsbyPrismicImageFluid`
- `GatsbyPrismicImageFluid_noBase64`

Learn about the different types of responsive images and fragments from
[`gatsby-image`'s official docs][gatsby-image-types].

```graphql
{
  allPrismicPage {
    edges {
      node {
        id
        data {
          imageFieldName {
            fluid {
              ...ImageFragment
            }
          }
        }
      }
    }
  }
}
```

Full example:

```graphql
{
  allPrismicPage {
    edges {
      node {
        id
        data {
          imageFieldName {
            fluid(maxWidth: 1000, maxHeight: 800) {
              ...GatsbyPrismicImageFluid
            }
          }
        }
      }
    }
  }
}
```

#### Using locally transformed images

To use local image processing, you need `gatsby-transformer-sharp`,
`gatsby-plugin-sharp`, and their dependencies `gatsby-image` and
`gatsby-source-filesystem` in your `gatsby-config.js`.

Note that this will incur additional build time as image processing is
time-consuming.

To access image processing in your queries, you need to use this pattern, where
`...ImageFragment` is one of the [`gatsby-transformer-sharp`
fragments][gatsby-image-fragments]:

```graphql
{
  allPrismicPage {
    edges {
      node {
        id
        data {
          imageFieldName {
            localFile {
              childImageSharp {
                ...ImageFragment
              }
            }
          }
        }
      }
    }
  }
}
```

Full example:

```graphql
{
  allPrismicPage {
    edges {
      node {
        id
        data {
          imageFieldName {
            localFile {
              childImageSharp {
                fixed(width: 500, height: 300) {
                  ...GatsbyImageSharpFixed_withWebp
                }
              }
            }
          }
        }
      }
    }
  }
}
```

To learn more about local image processing, check the documentation of
[gatsby-plugin-sharp][gatsby-plugin-sharp].

## Previews

[`gatsby-plugin-prismic-previews`][gppp] provides a way to preview document
changes directly from Prismic without rebuilding your site. By rendering
previews client-side, we can retain the benefits of Gatsby's HTML pre-rendering
while still provding the dynamic and rich content editing experience of a
traditional server setup.

For an in-depth guide on using previews, please refer to
[`gatsby-plugin-prismic-previews`'s documentation][gppp].

## Releases

You can provide a `releaseID` option to build a release version of your website.
See the [How to use](#How-to-use) section for a description of the option. To
learn more about Prismic releases, see Prismic's official documentation here:
[The basics of a release][prismic-releases].

You can get a release ID by using the Prismic REST API:

```sh
curl https://my-repository-name.prismic.io/api/v2
# =>
#   {
#     "refs": [
#       {
#         "id": "master",
#         "ref": "XoS0aRAAAB8AmarD",
#         "label": "Master",
#         "isMasterRef": true
#       },
#       {
#         "id": "Xny9FRAAAB4AdbNo",
#         "ref": "Xr024BEAAFNM2PNM~XoS0aRAAAB8AmarD",
#         "label": "My release"
#       }
#       ...
#     ],
#   }
```

In the `refs` array of the response, the `id` property of the `refs` object is a
release ID. The label identifies the release's purpose. Master, for example, is
the latest published version of all your documents. Your other Prismic Releases
will be listed here with their names.

Note that a release build is totally compatible with live client-side previews.
Building with a release is a way to view at once another version of your
website, but under the hood it works the same way as the default build.

## Limitations

### GraphQL-valid field names

All field names must adhere to GraphQL's field name requirements:

- `a-z`: Any lowercase letter.
- `A-Z`: Any uppercase letter.
- `0-9`: Any number. Name must not start with a number.
- `_`: Underscores

Note that this does not allow fields containing the following:

- Starting with a number (e.g. `0_my_field`)
- Dashes (e.g. `my-field`)
- Symbols (e.g. `!@#$%^&*()`)

## Site's `gatsby-node.js` example

```javascript
const path = require('path')

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  // Query all Pages with their IDs and template data.
  const pages = await graphql(`
    {
      allPrismicPage {
        nodes {
          id
          uid
        }
      }
    }
  `)

  // Create pages for each Page in Prismic using a template.
  for (const node of pages.data.allPrismicPage.nodes) {
    createPage({
      path: node.url,
      component: path.resolve(__dirname, 'src/templates/page.js'),
      context: {
        id: node.id,
      },
    })
  }
}
```

[gatsby]: https://www.gatsbyjs.com/
[prismic]: https://prismic.io/
[gppp]: ../gatsby-plugin-prismic-previews
[prismic-slices]: https://prismic.io/feature/dynamic-layout-content-components
[prismic-imgix]:
  https://user-guides.prismic.io/en/articles/3309829-image-optimization-imgix-integration
[prismic-dom]: https://github.com/prismicio/prismic-dom
[prismic-javascript]: https://github.com/prismicio/prismic-javascript
[prismic-previews]:
  https://user-guides.prismic.io/en/articles/781294-how-to-set-up-a-preview
[prismic-releases]:
  https://user-guides.prismic.io/en/collections/22653-releases-scheduling#the-basics-of-a-release
[prismic-version-custom-types]:
  https://user-guides.prismic.io/content-modeling-and-custom-types/version-and-changes-of-custom-types/how-to-version-custom-types
[graphql-inline-fragments]: http://graphql.org/learn/queries/#inline-fragments
[gatsby-plugin-sharp]:
  https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-sharp
[gatsby-image-fragments]:
  https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-image#gatsby-transformer-sharp
[prismic-responsive-images]:
  https://user-guides.prismic.io/en/articles/762324-how-to-set-up-responsive-images
[gatsby-image-types]:
  https://www.gatsbyjs.org/packages/gatsby-image/?=gatsby-image#two-types-of-responsive-images
[dotenv]: https://github.com/motdotla/dotenv
[gatsby-env-vars]: https://gatsby.dev/env-vars
[gatsby-source-filesystem]:
  https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-filesystem
