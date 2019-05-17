# Upgrade from v2.x to v3.x

The following **breaking changes** will need to be handled in your code.

## Accessing linked documents

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

## Provide custom type schemas

In v2, custom and field types were inferred based on the data stored in and
provided by Prismic. In cases where fields were empty in Prismic, Gatsby did not
know of the fields and threw GraphQL errors if queried.

In v3, providing custom type schemas to the plugin is required. This tells
Gatsby exactly which fields are available and their types even if they are empty
in Prismic.

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
