# Upgrade from v2.x to v3.x

The following **breaking changes** will need to be handled in your code.

## Linked documents

In v2, Link fields that point to a Prismic document provided the document data
on the `myLinkField.document` field a one item array. This was required to tell
Gatsby that the document's type could be any of your custom types.

In v3, the `myLinkField.document` field is no longer an array but a direct
reference to the linked document.

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
