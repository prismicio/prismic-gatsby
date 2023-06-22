# Migration Guide: gatsby-source-prismic V3 to V4

This migration guide is going to help you upgrade the gatsby-source-prismic plugin from version V3 to V4 on your Gatsby project.

---

> **🕙 Before Reading**
>
> If your site is using V2, in Gatsby and the gatsby-source-prismic plugin, please migrate both to V3 first:
>
> - [Gatsby V2 to V3 migration guide](https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v2-to-v3/)
> - [gatsby-source-prismic V2 to V3 migration guide](https://prismic.io/docs/gatsby-source-prismic-v2-to-v3)

The V4 release of `gatsby-source-prismic` brings several new features and fixes that make working with Prismic within Gatsby easier and more flexible. The changes result from real-world use cases from [user feedback shared on GitHub](https://github.com/angeloashmore/gatsby-source-prismic/issues) and the [Prismic community forum](https://community.prismic.io/).

## What has changed?

Prismic's Gatsby support is split into two plugins: [gatsby-source-prismic](https://prismic.io/docs/technical-reference/gatsby-source-prismic) and [gatsby-plugin-prismic-previews](https://prismic.io/docs/technical-reference/gatsby-plugin-prismic-previews). Read about the new features and changes for each below.

### gatsby-source-prismic

This plugin pulls CMS data into Gatsby using Prismic's REST API.

- Multiple repository support
- Validate plugin options
- Automatic Custom Types schema fetching (via the beta [Custom Types API](https://prismic.io/docs/custom-types-api))
- [gatsby-plugin-image](https://www.gatsbyjs.com/plugins/gatsby-plugin-image/) support
- [GraphQuery](https://prismic.io/docs/graphquery-rest-api) support (replacement for `fetchLinks` option)
- Serve media files from Link fields locally via `localFile` field
- Download image and media files only when queried for faster start-up times
- Full support for Embed fields with oEmbed data
- Full support for [Integration Fields](https://prismic.io/feature/integration-field)
- Private plugin options, including repository names, access tokens, and schemas

### gatsby-plugin-prismic-previews

This plugin provides live previews client-side directly from the Prismic editor. The following changes are made over the preview functionality previously provided by the `gatsby-source-prismic` plugin.

- Live refreshing as document changes are saved
- Preview changes across all data and pages, not just the previewed document's page
- Preview a release with multiple documents
- Shareable preview links
- Easier to use hooks and higher-order-components to integrate with your site
- Private access tokens (optional)

## Update your dependencies

To update your project to V4, first, you'll need to update your dependencies.

### Update Gatsby

We highly recommend using the latest version of Gatsby V3 when using `gatsby-source-prismic` V4. Update your `package.json`.

```json
{
	"dependencies": {
		"gatsby": "^3.3.0"
	}
}
```

### Update gatsby-source-prismic

Then, update your `package.json` to use the latest version of `gatsby-source-prismic`.

```json
{
	"dependencies": {
		"gatsby-source-prismic": "^4.0.0"
	}
}
```

### Add gatsby-plugin-image

Gatsby's image processing plugin, `gatsby-plugin-image`, is a dependency of `gatsby-source-prismic`. Install and [Configure the plugin in your gatsby-config.js file](https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/using-a-plugin-in-your-site/#step-2-configure-the-plugin-in-your-gatsby-configjs-file).

**npm**:

```bash
npm install gatsby-plugin-image
```

**Yarn**:

```bash
yarn add gatsby-plugin-image
```

### Add gatsby-plugin-prismic-previews

Now, the Preview functionality has its plugin called [gatsby-plugin-prismic-previews](https://prismic.io/docs/technical-reference/gatsby-plugin-prismic-previews). Install and [Configure the plugin in your gatsby-config.js file](https://prismic.io/docs/previews-gatsby).

**npm**:

```bash
npm install gatsby-plugin-prismic-previews
```

**Yarn**:

```bash
yarn add gatsby-plugin-prismic-previews
```

If your site has the previous preview implementation provided by `gatsby-source-prismic`, you'll need to migrate it at the end of this guide. See the **Migrate Previews to the preview plugin** section below for more details.

## Handling breaking changes

### The dataRaw field is deprecated

The `dataRaw` is now deprecated. You will need to replace it by specifying each field you want to return in your documents.

### Provide all Custom Type schemas

In **V3**, providing your Custom Type schemas was required, but the plugin made no validation to ensure you supplied all Custom Type schemas to it. If your repository contained a Custom Type called "Page" and another called "Blog", but only provided the schema for "Page", the plugin would continue to function. However, fields within the "Blog" Custom Type would not work correctly, leading to confusing results.

In **V4**, providing all Custom Type schemas is required. The plugin will check your repository for all configured Custom Types and ensure you've provided a schema for each.

> **Note**: **You need to provide all Custom Type schemas** even in the following cases: you created a Custom Type and used it at least once and then disabled or deleted it. Or if you've deleted all documents of that type.
>
> You can fetch deleted documents using a previous revision of your repository data, thus requiring the schema to be available.
>
> If you no longer have access to the schema, you may provide an empty object as its schema.

**After**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				schemas: {
					// Include all your custom typeschemas
					page: require("./custom_types/page.json"),

					// If a custom type was used at one point,
					// but has since been removed,
					// you may pass an empty schema object.
					an_unused_type: {},
				},
				// All other plugin options...
			},
		},
	],
};
```

**Before**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				schemas: {
					page: require("./custom_types/page.json"),
				},
				// All other plugin options...
			},
		},
	],
};
```

### Update the queries

In **V3**, GraphQL types for your document types and fields use the following pattern:

```plaintext
PrismicExampleTypeSpecificIdentifier
```

Where `SpecificIdentifier` is based on a document's field name. For example:

- PrismicPage: A "Page" document
- PrismicPageBodyImages: An "Images" Slice in a "Body" Slice Zone for a "Page" document
- PrismicPageBodyImagesItemType: An item for an "Images" Slice for a "Page" document

In **V4**, GraphQL types follow the same pattern, but adds the word "Data" after Custom Type. This allows for better organization of types. If your project references GraphQL types with your queries, such as in fragments, add "Data" to the type names. For example:

- PrismicPage: A "Page" document
- PrismicPageDataBodyImages: An "Images" Slice in a "Body" Slice Zone in a "Page" document
- PrismicPageDataBodyImagesItemType: An item for an "Images" Slice

### Remove shouldDownloadFile

In **V3**, the `shouldDownloadFile` plugin option determines if it should download a document's image locally and make the file's data available by querying the localFile field.

In **V4**, the `shouldDownloadFile` plugin option doesn't exist. Instead of relying on that plugin option to determine if it should download a file, querying for the localFile field represents "opting in" to download the file. Conversely, not querying for the localFile field means the file will not be downloaded locally.

**After**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				// All other plugin options...
			},
		},
	],
};
```

**Before**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				shouldDownloadFile: () => true,
				// All other plugin options...
			},
		},
	],
};
```

### Update the Link Resolver and HTML Serializer

In **V3**, When you provide Link Resolvers and HTML Serializers, extra data becomes available when working with Prismic. The extra data, comprised of the field’s root document, the field’s name, and the field’s value, could be used to customize the responses on a per-document-type or per-field basis. While this can be helpful, it is non-standard, is a common source of issues, and is not widely used.

In **V4**, the linkResolver and htmlSerializer plugin options accept a standard Prismic Link Resolver and HTML Serializer function. Remove the extra function wrapper from your Link Resolver and HTML Serializer to make them compatible with V4.

**After**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				linkResolver: (doc) => `/${doc.id}`,
				htmlSerializer: (type, element, content, children) => {
					// Your HTML Serializer
				},
				// All other plugin options...
			},
		},
	],
};
```

**Before**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				linkResolver:
					({ node, key, value }) =>
					(doc) =>
						`/${doc.id}`,
				htmlSerializer:
					({ node, key, value }) =>
					(type, element, content, children) => {
						// Your HTML Serializer
					},
				// All other plugin options...
			},
		},
	],
};
```

### Replace fetchLinks with graphQuery

In **V3**, the fetchLinks plugin option provided a list of document fields to make available in your app's Link Resolver. If your Link Resolver requires data from a linked document, such as a parent or category document, this is necessary.

In **V4**, the graphQuery plugin option provides the same functionality with greater control. The value provided to the graphQuery plugin option looks similar to a GraphQL query in that you can define which fields you need in a document, including nested content. Read the technical reference: [GraphQuery](https://prismic.io/docs/graphquery-rest-api).

The fetchLinks option will continue to work in **V4**, but **graphQuery is recommended over fetchLinks** as it provides more control over the fields fetched for a document.

**After**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				graphQuery: `
        {
          page {
            ...pageFields
            parent {
              ...parentFields
            }
          }
        }
      `,
				// All other plugin options...
			},
		},
	],
};
```

**Before**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				fetchLinks: ["page.parent"],
				// All other plugin options...
			},
		},
	],
};
```

### Remove typePathsFilenamePrefix

In **V3**, the `typePathsFilenamePrefix` plugin option allowed customizing the filename of a preview-specific file saved in your site's public folder. This file is used during client-side previews to restructure document data to match Gatsby's GraphQL API.

In V4, all preview functionality is moved to the preview plugin: `gatsby-plugin-prismic-previews`, which will always use a hashed filename and is not customizable. As this file is only used internally to make previews work correctly, direct access is not supported, and as such, the filename does not need to be known.

**After**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				// All other plugin options...
			},
		},
	],
};
```

**Before**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				typePathsFilenamePrefix: "prismic-typepaths---my-prefix",
				// All other plugin options...
			},
		},
	],
};
```

### Remove prismicToolbar

In **V3**, the `prismicToolbar` plugin option allowed for opting into loading the Prismic Toolbar on all pages. The Prismic Toolbar was optional and disabled by default.

In **V4**, all preview functionality is moved to the preview plugin: `gatsby-plugin-prismic-previews`, which requires the Prismic Toolbar and can only be customized to load either the legacy or the current version.

**After**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				// All other plugin options...
			},
		},
	],
};
```

**Before**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				prismicToolbar: true,
				// All other plugin options...
			},
		},
	],
};
```

### Use GraphQL over getNodes helpers in gatsby-node.js

In **V3**, nodes of a certain type, such as PrismicPage, could be fetched using Gatsby's [getNodes](https://www.gatsbyjs.com/docs/reference/config-files/node-api-helpers/#getNodes) or [getNodesByType](https://www.gatsbyjs.com/docs/reference/config-files/node-api-helpers/#getNodesByType) Node API helpers in gatsby-node.js. These functions returned the nodes with most of their data transformed as it would appear in a GraphQL query.

In **V4**, using those API helpers will still return the relevant nodes, but little to no data transformations will be available. Instead, you will receive something that mostly matches what is returned by Prismic's REST API. Rich Text fields, for example, would not include HTML or text fields.

To get the same data, you would receive a GraphQL query, while in `gatsby-node.js`, replace `getNodes` and `getNodesByType` with a GraphQL query.

**After**:

```javascript
exports.createPages = async (gatsbyContext) => {
	const { getNodesByType, graphql } = gatsbyContext;

	const queryResult = await graphql(`
		query {
			allPrismicPage {
				nodes {
					uid
					url
				}
			}
		}
	`);

	for (const pageNode of queryResult.data.allPrismicPage.nodes) {
		// Do something with the page node
	}
};
```

**Before**:

```javascript
exports.createPages = (gatsbyContext) => {
	const { getNodesByType } = gatsbyContext;
	const pageNodes = getNodesByType("PrismicPage");

	for (const pageNode of pageNodes) {
		// Do something with the page node
	}
};
```

### Use Imgix's gatsby-image fragments

In **V3**, using the [gatsby-image](https://www.gatsbyjs.com/plugins/gatsby-image/) integration with Imgix URLs required the use of specific fragments.

In **V4**, these fragments are deprecated and replaced by Imgix's official gatsby-image fragments. See the following list for conversions. The previous fragments will continue to be included in V4, but will be removed in V5.

> **Deprecated gatsby-image**
>
> gatsby-image is deprecated and replaced by [gatsby-plugin-image](https://www.gatsbyjs.com/plugins/gatsby-plugin-image/). You may choose to upgrade to gatsby-plugin-image by querying for an Image field's gatsbyImageData field and passing the result to the GatsbyImage component.

| Property                                                        | Description                      |
| --------------------------------------------------------------- | -------------------------------- |
| <strong><strong>Old</strong></strong><br/>                      | <p><strong>New</strong></p>      |
| <strong>GatsbyPrismicImageFixed</strong><br/>                   | <p>GatsbyImgixFixed</p>          |
| <strong>GatsbyPrismicImageFixed_noBase64</strong><br/>          | <p>GatsbyImgixFixed_noBase64</p> |
| <strong>GatsbyPrismicImageFixed_withWebp</strong><br/>          | <p>GatsbyImgixFixed</p>          |
| <strong>GatsbyPrismicImageFixed_withWebp_noBase64</strong><br/> | <p>GatsbyImgixFixed_noBase64</p> |
| <strong>GatsbyPrismicImageFluid</strong><br/>                   | <p>GatsbyImgixFluid</p>          |
| <strong>GatsbyPrismicImageFluid_noBase64</strong><br/>          | <p>GatsbyImgixFluid_noBase64</p> |
| <strong>GatsbyPrismicImageFluid_withWebp</strong><br/>          | <p>GatsbyImgixFluid</p>          |
| <strong>GatsbyPrismicImageFluid_withWebp_noBase64</strong><br/> | <p>GatsbyImgixFluid_noBase64</p> |

## Migrate Previews to the preview plugin

In **V3**, optional client-side previews could be integrated using higher-order components like `withPreview()` or React Hooks like `usePrismicPreview()`.

In **V4**, all preview functionality is moved to the `gatsby-plugin-prismic-previews` plugin, which greatly improves preview functionality and better API security while keeping the API relatively similar to V3. All imports and usage will need to be migrated to the new plugin. If you are using previews currently, read the preview migration guide:

- [**Migrate to the Preview Plugin**](https://prismic.io/docs/migrate-to-gatsby-plugin-prismic-previews)<br/>Migrate the preview functionality to use the preview plugin.

Or, If this is the first time you configure previews, read the dedicated guide:

- [**Preview Drafts**](https://prismic.io/docs/previews-gatsby)<br/>Configure the preview functionality in your Gatsby project.
