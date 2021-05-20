# Architecture

This document describes the general setup and architecture of Prismic's
integration with Gatsby. This should provide a high-level overview of the flow
of data and how the integration's different plugins work together. This may help
new people joining the project to help out.

## Plugins

The Gatsby + Prismic integration is currently composed of two plugins.

- [**gatsby-source-prismic**](./packages/gatsby-source-prismic): Gatsby source
  plugin for building websites using Prismic as a data source
- [**gatsby-plugin-prismic-previews**](./packages/gatsby-plugin-prismic-previews):
  Gatsby plugin for integrating client-side Prismic Previews

`gatsby-source-prismic` is required to bring data from a Prismic content
repository into a Gatsby site.

`gatsby-plugin-prismic-previews` is an optional enhancement that allows website
content editors to preview content changes before publishing.

## gatsby-source-prismic

This plugin serves the following purposes:

- Sources content from a Prismic repository
- Provides Gatsby Cloud webhook-based builds integration
- Prepares data for `gatsby-plugin-prismic-previews`

### Bootstrap Stage

The following actions occur during Gatsby's bootstrap phase.

1. Validate plugin options in the `pluginOptionsSchema` Gatsby Node API.
1. (Optional) Fetch Custom Type schemas and inject into plugin options.
1. Create GraphQL types using schemas in the `createSchemaCustomization` Gatsby
   Node API.
1. Save Custom Type metadata to node store (used in
   `gatsby-plugin-prismic-previews`).
1. Fetch content from Prismic repository.
1. Normalize document data.
1. Create nodes for each document in the `sourceNodes` Gatsby Node API via
   `createNodes`.

### Gatsby Cloud Integration

The following actions occur during webhook events.

#### `api-update` Webhook

This webhook may fire anytime a user, depending on the user's webhook
preferences:

- Publishes a document
- Unpublishes a document
- Creates a release (a collection of changes)
- Edits a release
- Deletes a release
- Creates a tag (label for a document)
- Deletes a tag (label for a document)

If those actions are enabled for the webhook, the following occurs:

1. Validate the webhook in the `sourceNodes` Gatsby Node API.
1. Fetch documents referenced in the webhook from the Prismic repository.
1. Compute the necessary delta operations needed to incorporate the webhook
   event data (create/update/delete nodes).
1. Execute delta operations.

The Gatsby node store is now equivalent to a fresh bootstrap. A full Prismic
repository content fetch was not needed.

#### `test-trigger` Webhook

This webhook fires anytime a user clicks a "Trigger It" button for a webhook. It
allows a user to test if webhooks is being received within the Gatsby site
without performing any content action.

1. Log a success message.

## gatsby-plugin-prismic-previews

This optional plugin serves the following purposes:

- Fetches draft content from a Prismic repository client-side
- Emulates Gatsby's GraphQL API shape for Prismic content
- Recursively replaces static page data with preview data

Prismic Previews provide the following unique features:

- Unlimited concurrent preview sessions targeting different content branches
- Automatic content refreshing while editing content
- Shareable preview links

### Bootstrap Stage

The following actions occur during Gatsby's bootstrap phase.

1. Validate plugin options in the `pluginOptionsSchema` Gatsby Node API.
1. Save Custom Type metadata saved in `gatsby-source-prismic`'s bootstrap phase
   to a JSON file in `/public`.

The metadata JSON file will be referenced during client-side preview sessions.

### Client Entry

The following actions occur during the client entry phase.

1. Add plugin options to global state in the `onClientEntry` Gatsby Node API.

The plugin options will be referenced during client-side preview sessions.

### During a Preview Session

1. Determine if a preview session is active by checking for the presence of a
   Prismic-specific cookie. This cookie is set after a user clicks the preview
   button within the Prismic editor. Continue if present.
1. Fetch the previewed document.
1. Compute the document's URL using the app's [Link
   Resolver][prismic-link-resolver] function.
1. Redirect to the document's URL.

On the document's page:

1. Fetch all Prismic repository content using the preview [ref][prismic-ref],
   which includes all draft content.
1. Normalize document data.
1. Save data to a React Context store.
1. Traverse static page query data and replace with preview content where
   matches are found.

Matching static content with preview content is determined by comparing a
Gatsby-specific `_previewable` field on the static data. At the time of writing,
the `_previewable` field contains the document's unique Prismic document ID, but
this could change in the future.

Client-side data is shaped nearly identically to build-time data. Because
preview data is merged into the static data, all build-time-only data, such as
`siteMetadata` objects, are kept intact.

When a document is previewed but does not yet have a page within the app (e.g.
an unpublished document), the following flow is used.

1. After the user is redirected to the previewed document's URL, the user will
   land on the 404 page.
1. Fetch all Prismic repository content using the preview [ref][prismic-ref],
   which includes all draft content.
1. Normalize document data.
1. Save data to a React Context store.
1. Resolve the page template to render and the data to provide it using
   user-provided functions. The functions are given all nodes whose URLs resolve
   to the current URL.
1. Render the resolved component with the computed `data` prop.

[prismic-link-resolver]:
  https://prismic.io/docs/technologies/link-resolver-javascript
[prismic-ref]:
  https://prismic.io/docs/technologies/introduction-to-the-content-query-api#prismic-api-ref
