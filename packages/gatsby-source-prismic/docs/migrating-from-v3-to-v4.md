# Migrating from V3 to V4

## Handling breaking changes

### Provide all custom type schemas

In V3, providing your custom type schemas was required but they were not
validated to ensure all custom type schemas were provided. If your repository
contained a custom type called "Page" and another called "Blog", but only
provided the schema for "Page", the plugin would continue to function. Fields
within the "Blog" custom type, however, would not work correctly, leading to
confusing results.

In V4, providing all custom type schemas is required. The plugin will check your
repository for all configured custom types and ensure a schema has been provided
for each.

**Note**: If at any point a custom type was created and used at least once, its
schema must be provided. If a custom type has since been disabled and/or removed
from your repository, even if all documents of that type have been deleted, you
**still** need to provide its schema. Deleted documents can be fetched using a
previous revision of your repository data, thus requiring the schema to be
available.

If you no longer have access to the schema, you may provide an empty object as
its schema.

```diff
// gatsby-config.js

  plugins: [
    {
      resolve: 'gatsby-source-prismic',
      options: {
        schemas: {
          page: require('./schemas/page.json'),

+         // If you are missing any custom type schemas, add them to the
+         // `schemas` plugin option.
+         blog_post: require('./schemas/page.json'),

+         // If a custom type was used at one point but has since been removed,
+         // you may pass an empty schema.
+         an_unused_type: {},
        },
      },
    },
  ]
```

### Update GraphQL queries to use new type names

In V3, GraphQL types for your document types and fields use the following
pattern:

```
Prismic${customType}${...fieldSpecificIdentifier}
```

Where `${fieldSpecificIdentifier}` is based on a document's field name. For
example:

- `PrismicPage`: A "Page" document
- `PrismicPageBodyImages`: An "Images" Slice in a "Body" Slice Zone for a "Page"
  document
- `PrismicPageBodyImagesItemType`: An item for an "Images" Slice for a "Page"
  document

In V4, GraphQL types follow the same pattern, but adds the word "Data" after
custom type. This allows for better organization of types. If your project
references GraphQL types with your queries, such as in fragments, add "Data" to
the type names. For example:

- `PrismicPage`: A "Page" document
- `PrismicPageDataBodyImages`: An "Images" Slice in a "Body" Slice Zone in a
  "Page" document
- `PrismicPageDataBodyImagesItemType`: An item for an "Images" Slice

### Remove `shouldDownloadFile` plugin option

In V3, the `shouldDownloadFile` plugin option allowed for determining if a
document's image should be downloaded locally. This makes the file's data
available by querying for the `localFile` field.

In V4, the `shouldDownloadFile` plugin option has been removed. Instead of
relying on that plugin option to determine if a file should be downloaded,
querying for the `localFile` field represents "opting in" to downloading the
file. Conversely, not querying for the `localFile` field means the file will not
be downloaded locally.

```diff
// gatsby-config.js

  plugins: [
    {
      resolve: 'gatsby-source-prismic',
      options: {
-       shouldDownloadFile: () => true,
      },
    },
  ]
```

### Remove field data from Link Resolver and HTML Serializer functions

In V3, Link Resolvers and HTML Serializers were provided extra data that is not
normally available when working with Prismic. The extra data, comprised of the
field’s root document, the field’s name, and the field’s value, could be used to
customize the responses on a per-document-type or per-field basis. While this
can be helpful, it is non-standard, is a common source of issues, and is not
widely used.

In V4, the `linkResolver` and `htmlSerializer` plugin options accept a standard
Prismic Link Resolver and HTML Serializer function, respectively. Remove the
extra function wrapper from your Link Resolver and HTML Serializer to make them
compatible with V4.

```diff
// gatsby-config.js

  plugins: [
    {
      resolve: 'gatsby-source-prismic',
      options: {
-       linkResolver: ({ node, key, value }) => (doc) => `/${doc.id}`,
+       linkResolver: (doc) => `/${doc.id}`,

-       htmlSerializer: ({ node, key, value }) => (
-         type,
-         element,
-         content,
-         children,
-       ) => {
-         // Your HTML Serializer
-       },
+       htmlSerializer: (type, element, content, children) => {
+         // Your HTML Serializer
+       },
      },
    },
  ]
```

### Optional: Replace `fetchLinks` plugin option with `graphQuery`

In V3, the `fetchLinks` plugin option allowed for providing a list of document
fields to make available in your app's Link Resolver. This is necessary if your
Link Resolver requires data from a linked document, such as a parent or category
document.

In V4, the `graphQuery` plugin option provides the same functionality with
greater control. The value provided to the `graphQuery` plugin option looks
similar to a GraphQL query in that you can define exactly which fields you need
in a document, included nested content. You can learn more at
[Prismic's GraphQuery documentation](prismic-graphquery).

The `fetchLinks` option will continue to work in V4, but `graphQuery` is
recommend over `fetchLinks` as it provides more control over the fields fetched
for a document.

```javascript
  // gatsby-config.js

  plugins: [
    {
      resolve: 'gatsby-source-prismic',
      options: {
-       fetchLinks: ['page.parent'],
+       graphQuery: `
+         {
+           page {
+             ...pageFields
+             parent {
+               ...parentFields
+             }
+           }
+         }
+       `,
+     },
    },
  ]
```

### Remove `typePathsFilenamePrefix` plugin option

In V3, the `typePathsFilenamePrefix` plugin option allowed for customizing the
filename of a preview-specific file saved in your site's public folder. This
file is used during client-side previews to restructure document data to match
Gatsby's GraphQL API.

In V4, all preview functionality is moved to a new plugin called
[`gatsby-plugin-prismic-previews`][gppp]. The new preview plugin will always use
a hashed filename and is not customizable. As this file is only used internally
to make previews work correctly, direct access is not supported and as such, the
filename does not need to be known.

```diff
// gatsby-config.js

  plugins: [
    {
      resolve: 'gatsby-source-prismic',
      options: {
-       typePathsFilenamePrefix: 'prismic-typepaths---my-prefix',
      },
    },
  ]
```

### Remove `prismicToolbar` plugin option

In V3, the `prismicToolbar` plugin option allowed for opting in to loading the
[Prismic Toolbar](https://prismic.io/docs/technologies/previews-and-the-prismic-toolbar-javascript)
on all pages. The Prismic Toolbar was optional and disabled by default.

In V4, all preview functionality is moved to a new plugin called
[`gatsby-plugin-prismic-previews`][gppp]. The new preview plugin requires the
use of the Prismic Toolbar and can only be customized to load either the legacy
version or the new/current version. See the
[`gatsby-plugin-prismic-previews`][gppp] documentation for more details.

```diff
// gatsby-config.js

  plugins: [
    {
      resolve: 'gatsby-source-prismic',
      options: {
-       prismicToolbar: true,
      },
    },
  ]
```

### Migrate Prismic Previews to `gatsby-plugin-prismic-previews`

In V3, optional client-side previews could be integrated using higher order
components like `withPreview` or React Hooks like `usePrismicPreview`.

In V4, all preview functionality is moved to a new plugin called
[`gatsby-plugin-prismic-previews`][gppp]. The new preview plugin provides
greatly improved preview functionality and better API security while keeping the
API relatively similar to V3. All imports and usage will need to be migrated to
the new plugin if you are using previews currently. See the
[`gatsby-plugin-prismic-previews`][gppp] migration guide for more details.

```diff
// src/pages/{PrismicPage.uid}.js

- import { withPreview } from 'gatsby-source-prismic'
+ import { withPrismicPreview } from 'gatsby-plugin-prismic-previews'
```

[gppp]: #
[prismic-graphquery]: https://prismic.io/docs/technologies/graphquery-rest-api
