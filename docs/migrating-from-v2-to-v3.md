# Migrating from v2 to v3

- [Why you should migrate](#why-you-should-migrate)
- [Updating your dependencies](#updating-your-dependencies)
  - [Update Gatsby version](#update-gatsby-version)
  - [Update `gatsby-source-prismic` version](#update-gatsby-source-prismic-version)
  - [Update React version](#update-react-version)
- [Handling breaking changes](#handling-breaking-changes)
  - [Provide custom type schemas](#provide-custom-type-schemas)
  - [Accessing linked documents](#accessing-linked-documents)
  - [Using `raw` fields](#using-raw-fields)
  - [Replace `dataString` with `dataRaw`](#replace-datastring-with-dataraw)
- [Setting up previews](#setting-up-previews)
- [Things to know](#things-to-know)
  - [Type paths file in `/public`](#type-paths-file-in-public)
  - [Plugin options in `window`](#plugin-options-in-window)

## Why you should migrate

The v3 release includes two major features designed to improve the developer and
content editor experience.

- **Schemas**: Custom types and their fields are fully integrated into Gatsby's
  GraphQL data system.
- **Previews**: Content editors can preview content before publishing without
  the need to rebuild the entire site.

This release also fixes several long-standing issues as a result of the new
schema processing.

- Gatsby now knows about fields that are defined on a custom type but have no
  content. This previously required developers to create "placeholder" documents
  with every field filled in with dummy content.
- Rich Text and Title fields always return the expected result. Adding an image
  or embed as the first piece of content to a Rich Text field will not confuse
  the plugin.
- Accessing linked documents on Link fields no longer requires using a strange
  single-item array.

## Updating your dependencies

The very first thing you will need to do is update your dependencies.

### Update Gatsby version

You need to update your `package.json` to use at least `v2.5.0` of Gatsby.

```js
// package.json

"dependencies": {
  "gatsby": "^2.5.0"
}
```

### Update `gatsby-source-prismic` version

Update your `package.json` to use v3 of `gatsby-source-prismic`.

```js
// package.json

"dependencies": {
  "gatsby-source-prismic": "^3.0.0"
}
```

### Update React version

Previewing Prismic documents before publishing requires [React
hooks][react-hooks]. If your project is not already on a release of React that
includes hooks, update your version of `react` and `react-dom`.

```js
// package.json

"dependencies": {
  "react": "^16.8.0",
  "react-dom": "^16.8.0"
}
```

## Handling breaking changes

### Provide custom type schemas

In v2, custom types and their fields were inferred based on the data stored in
your Prismic repository. In cases where fields were empty in Prismic, Gatsby did
not know of the fields and threw GraphQL errors if queried.

In v3, providing custom type schemas to the plugin is required. This tells
Gatsby exactly which custom types and fields are available and their types even
if they are empty in Prismic.

1. Copy the JSON schema from Prismic for each custom type into your project.
   `src/schemas/<custom_type_id>.json` is the recommended location.

2. In `gatsby-config.js`, provide the schemas to the plugin options on the
   `schemas` key as an object mapping custom type ID to the JSON.

   ```diff
     plugins: [
       {
         resolve: 'gatsby-source-prismic',
         options: {
           repositoryName: 'gatsby-source-prismic-test-site',
           accessToken: 'example-wou7evoh0eexuf6chooz2jai2qui9pae4tieph1sei4deiboj',
   +       schemas: {
   +         page: require('./src/schemas/page.json'),
   +         blog_post: require('./src/schemas/blog_post.json'),
   +       }
         }
       }
     ]
   ```

   Note that the key for each custom type is the **API ID** as set in Prismic.
   This is usually snakecase by default.

### Accessing linked documents

In v2, Link fields that point to a Prismic document provided the document data
on the `myLinkField.document` field as one item array. This was required to tell
Gatsby that the document's type could be any of your custom types.

In v3, the `myLinkField.document` field is no longer an array but instead a
direct reference to the linked document.

1. In your GraphQL queries, add the fragment syntax to your `document` field if
   not already present. The fragment type must refer to the linked document's
   type.

   ```diff
     const query = graphql`
       prismicPage {
         data {
           linkField {
             document {
   +           ... on PrismicOtherType {
                 uid
   +           }
             }
           }
         }
       }
     `
   ```

2. When accessing `document`, use it like any other object field, not an array.

   ```diff
   - const uid = data.prismicPage.data.linkField.document[0].uid
   + const uid = data.prismicPage.data.linkField.document.uid
   ```

### Namespacing image thumbnails

In v2, Image fields contained the image thumbnail data at the same level as the
primary image data. If you had a `mobile` thumbnail size, for example, the
`mobile` field would be at the same level as the `url` field of the primary
image. This could potentially cause conflicts if a thumbnail name took the name
of an existing image field.

In v3, image thumbnail fields are nested under a `thumbnails` field.

1. In your GraphQL queries, move image thumbnails under the `thumbnail` field.

   ```diff
     const query = graphql`
       prismicPage {
         data {
           imageField {
             url
   -         mobile {
   -           url
   -         }
   +         thumbnails {
   +           mobile {
   +             url
   +           }
   +         }
           }
         }
       }
     `
   ```

2. When accessing a thumbnail, access it with the `thumbnails` property.

   ```diff
   - const mobileUrl = data.prismicPage.data.imageField.mobile.url
   + const mobileUrl = data.prismicPage.data.imageField.thumbnails.mobile.uid
   ```

### Using `raw` fields

In v2, certain field types contain a `raw` field populated with an untouched
version of Prismic's data. For example, a Rich Text field's `raw` field would
contain Prismic's custom representation of formatted text. This requred you to
list out all child fields, such as `spans` for a Rich Text field.

In v3, `raw` is now a `JSON` type, removing the need to explicitly request child
fields. All child fields will automatically be returned as a JSON object.

Note that the `raw` field is still not recommended and is included as an escape
hatch if the untouched data is needed.

```diff
  const query = graphql`
    prismicPage {
      data {
        richTextField {
-         raw {
-           spans
-         }
+         raw
        }
      }
    }
  `
```

### Replace `dataString` with `dataRaw`

In v2, `dataString` was available to allow querying the raw API data as a
fallback. This was the node's data run through `JSON.stringify`.

In v3, `dataString` is deprecated and replaced by `dataRaw`. Like the `raw`
fields, `dataRaw` is now a `JSON` type, meaning you can query the field without
needing to specify the child fields. Unlike `dataString`, `dataRaw` will return
a JSON object, removing the need to run `JSON.parse`.

Note that the `dataRaw` field is still not recommended and is included as an
escape hatch if the untouched data is needed.

```diff
  const query = graphql`
    prismicPage {
-     dataString
+     dataRaw
    }
  `
```

## Setting up previews

See the [Previews guide](./previews.md) to learn how to setup previews, a new
feature in v3.

[react-hooks]: https://reactjs.org/docs/hooks-intro.html

## Things to know

### Type paths file in `/public`

The new schema system builds a map of your custom types' fields to their GraphQL
type. This is used internally to ensure fields are transformed correctly
depending on their type.

The same map is used in the front-end when previewing documents. In order for
the preview system to use the map, the plugin saves a JSON file in your public
folder. This file is then fetched in the browser during a preview.

The type paths file looks something like this:

```js
// public/prismic-typepaths---my-repo-md5hash2049b789871e9494879b29464.json

;[
  { path: ['page'], type: 'PrismicPage' },
  { path: ['page', 'uid'], type: 'String' },
  { path: ['page', 'data'], type: 'PrismicPageDataType' },
  {
    path: ['page', 'data', 'parent'],
    type: 'PrismicLinkType',
  },
  {
    path: ['page', 'data', 'title'],
    type: 'PrismicStructuredTextType',
  },
  { path: ['page', 'data', 'featured_image'], type: 'PrismicImageType' },
  {
    path: ['page', 'data', 'body'],
    type: '[PrismicPageBodySlicesType]',
  },
  { path: ['page', 'data', 'body', 'text'], type: 'PrismicPageBodyText' },
  {
    path: ['page', 'data', 'body', 'text', 'primary'],
    type: 'PrismicPageBodyTextPrimaryType',
  },
  {
    path: ['page', 'data', 'body', 'text', 'primary', 'text'],
    type: 'PrismicStructuredTextType',
  },
]
```

You can override the filename's prefix in your plugin options with the
`typePathsFilenamePrefix` option.

### Plugin options in `window`

The new preview system replicates Gatsby's data system as closely as possible in
the browser. This means minimal changes are necessary to implement previews on
sites that are already developed.

To perform previews, your site's Prismic plugin options, such as
`repositoryName`, `accessToken`, and `fetchLinks`, are needed again for the
Prismic API to fetch the preview data. Plugin options are automatically assigned
to a `window` property to allow the preview hook to reuse the options.

All options _except your custom type schemas_ are set on
`window.___PRISMIC___.pluginOptions`.

Additionally, the MD5 digest of your custom type schemas is set on
`window.___PRISMIC___.schemasDigest`.
