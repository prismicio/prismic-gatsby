# gatsby-source-prismic - v5

> **Upgrade your version**
>
> Are you on `prismic-reactjs` v1? Follow [our migration guide](https://prismic.io/docs/prismic-react-v2-migration-guide) to upgrade to `prismicio/react` v2.
>
> Are you on `gatsby-source-prismic` v4? Follow our [migration guide](https://prismic.io/docs/gatsby-prismic-v4-to-v5) to upgrade to v5.

## Overview

The `gatsby-source-prismic` plugin allows you to pull data from your Prismic repository into a static [Gatsby](https://www.gatsbyjs.com/) site.

## Dependencies and requirements

This plugin works with [gatsby-plugin-prismic-previews](https://prismic.io/docs/technical-reference/gatsby-plugin-prismic-previews) to configure live previews in your Gatsby project

Also, the `gatsby-plugin-image` plugin helps you add responsive images to your site and is required to support Gatsby's automatic image optimization component, `<GatsbyImage>`.

And, the `@prismicio/react` library helps to render certain structured fields like Rich Text, Dates, and Links to your templates.

## Installation

### Install packages

Add the `gatsby-source-prismic` plugin and its peer dependencies to your Gatsby project via the command line:

**npm**:

```javascript
npm install gatsby-source-prismic@5.2.10 gatsby-plugin-image @prismicio/react
```

**Yarn**:

```javascript
yarn add gatsby-source-prismic@5.2.10 gatsby-plugin-image @prismicio/react
```

### Configure the plugin

Define the plugin configuration in the `gatsby-config.js` file. The following table indicates all the fields that the plugin accepts:

| Property                                                                                                                                                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <strong><strong>Plugin option</strong></strong><br/>                                                                                                       | <p><strong>Description</strong></p>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| <strong>resolve</strong><br/><strong><span class="highlight">string (required)</span></strong><br/>                                                        | <p>The name of the plugin. It must be <strong>&#39;gatsby-source-prismic&#39;.</strong></p>                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| <strong>options</strong><br/><strong><span class="highlight">object (required)</span></strong><br/>                                                        | <p>Property that holds all the plugin configuration.</p>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| <strong>options.repositoryName</strong><br/><strong><span class="highlight">string (required)</span></strong><br/>                                         | <p>The name of your Prismic repository. If your Prismic URL is &#39;https://my-cool-website.prismic.io/api/v2&#39;, your repository name is <strong>&#39;my-cool-website&#39;.</strong></p>                                                                                                                                                                                                                                                                                                                                                       |
| <strong>options.accessToken</strong><br/><strong><span class="highlight">string</span></strong><br/>                                                       | <p>The access token for private APIs. Only needed if the API of <a href="https://user-guides.prismic.io/en/articles/1036153-generating-an-access-token" rel="noopener noreferrer">your repository is private</a>.</p>                                                                                                                                                                                                                                                                                                                             |
| <strong>options.schemas</strong><br/><strong><span class="highlight">object (required if customTypesApiToken isn&#39;t defined)</span></strong><br/>       | <p>Provide an object with all the Custom Type JSON schemas of your repository to load into Gatsby. <em>If both <strong>customTypesApiToken</strong> and <strong>schemas</strong> are provided, the <strong>schemas</strong> object will take priority.</em></p>                                                                                                                                                                                                                                                                                   |
| <strong>options.apiEndpoint</strong><br/><strong><span class="highlight">string</span></strong><br/>                                                       | <p>The API endpoint used to fetch content from Prismic. You can omit this option in most cases unless you require an API proxy or need to mock network responses. By default, your repository&#39;s standard endpoint will be used.</p>                                                                                                                                                                                                                                                                                                           |
| <strong>options.customTypesApiEndpoint</strong><br/><strong><span class="highlight">string</span></strong><br/>                                            | <p>The API endpoint is used to fetch Custom Types from Prismic. You can omit this option in most cases unless you require an API proxy or need to mock network responses. By default, your repository&#39;s standard endpoint will be used.</p>                                                                                                                                                                                                                                                                                                   |
| <strong>options.customTypesApiToken</strong><br/><strong><span class="highlight">string</span></strong><br/>                                               | <p>An API token for your Prismic repository allows your Custom Type schemas to be automatically fetched from <a href="https://prismic.io/docs/custom-types-api">The Custom Types API</a>. <em>If both <strong>customTypesApiToken</strong> and <strong>schemas</strong> are provided, the <strong>schemas</strong> object will take priority.</em></p>                                                                                                                                                                                            |
| <strong>options.releaseID</strong><br/><strong><span class="highlight">string</span></strong><br/>                                                         | <p>If you provide a release ID, the plugin will fetch data from a specific <a href="https://prismic.io/docs/core-concepts/draft-plan-and-schedule-content">Release</a> in your repository. Note that if you add changes to a release, you&#39;ll need to rebuild your website to see them.</p>                                                                                                                                                                                                                                                    |
| <strong>options.linkResolver</strong><br/><strong><span class="highlight">function</span></strong><br/>                                                    | <p>Set a <a href="https://prismic.io/docs/route-resolver">Link Resolver</a> to resolve document URLs. You&#39;ll use it to process links in your content. Rich Texts, Links, and Content Relationship fields use this to generate the correct link URLs.</p>                                                                                                                                                                                                                                                                                      |
| <strong>options.routes</strong><br/><strong><span class="highlight">array of objects</span></strong><br/>                                                  | <p>An array of <a href="https://prismic.io/docs/route-resolver">Route Resolver</a> objects to resolve document URLs. This option can be used in combination with the <span class="codespan">linkResolver</span> option (Link Resolver will take priority if both are used for a specific document type).</p>                                                                                                                                                                                                                                      |
| <strong>options.graphQuery</strong><br/><strong><span class="highlight">string with GraphQuery syntax</span></strong><br/>                                 | <p>GraphQuery syntax allows you to fetch linked documents content fields. Provide a GraphQuery if you need to fetch nested content to make it available in your Link Resolver. All top-level fields are fetched for all documents by default.</p>                                                                                                                                                                                                                                                                                                 |
| <strong>options.htmlSerializer</strong><br/><strong><span class="highlight">function</span></strong><br/>                                                  | <p>The <a href="https://prismic.io/docs/html-serializer">HTMLSerializer</a> helps you customize the HTML output of a Rich Text field.</p>                                                                                                                                                                                                                                                                                                                                                                                                         |
| <strong>options.lang</strong><br/><strong><span class="highlight">string</span></strong><br/>                                                              | <p>Set a default language when fetching documents. The default value is <strong>&#39;\*&#39;,</strong> which will fetch all languages. Read <a href="https://prismic.io/docs/internationalization-gatsby">Multilingual content</a>.</p>                                                                                                                                                                                                                                                                                                           |
| <strong>options.pageSize</strong><br/><strong><span class="highlight">number</span></strong><br/>                                                          | <p>Set the maximum page size used when fetching documents from the Prismic API. If you are reaching API limits due to large documents, set this to a number less than the maximum (100). By default, the maximum page size of 100 is used.</p>                                                                                                                                                                                                                                                                                                    |
| <strong>options.imageImgixParams</strong><br/><strong><span class="highlight">object</span></strong><br/>                                                  | <p>Provide a default set of <a href="https://docs.imgix.com/apis/url" rel="noopener noreferrer">Imgix image transformations</a> to your images. These options will override the default <a href="https://user-guides.prismic.io/en/articles/3309829-image-optimization-imgix-integration" rel="noopener noreferrer">Imgix transformations set by Prismic</a>.</p>                                                                                                                                                                                 |
| <strong>options.imagePlaceholderImgixParams</strong><br/><strong><span class="highlight">object</span></strong><br/>                                       | <p>Provide a default set of <a href="https://docs.imgix.com/apis/url" rel="noopener noreferrer">Imgix image transformations</a> applied to the placeholder of your images. These parameters will override those provided in the above <strong>imageImgixParams</strong> option.</p>                                                                                                                                                                                                                                                               |
| <strong>options.shouldDownloadFiles</strong><br/><strong><span class="highlight">object</span></strong><br/>                                               | <p>Provide a list of image or media fields that should be downloaded locally. This is required to use the <strong>localFile</strong> field for local image processing.</p>                                                                                                                                                                                                                                                                                                                                                                        |
| <strong>options.typePrefix</strong><br/><strong><span class="highlight">string (required when sourcing from more than one repository)</span></strong><br/> | <p>A prefix used for all GraphQL types for your Prismic repository. If you are sourcing from multiple repositories, each plugin should have a unique <strong>typePrefix</strong> to avoid type conflicts.</p>                                                                                                                                                                                                                                                                                                                                     |
| <strong>options.webhookSecret</strong><br/><strong><span class="highlight">string</span></strong><br/>                                                     | <p>If your Prismic repository&#39;s Webhooks are configured to send a secret, provide the secret here. Using a secret allows you to confirm the Webhook is from Prismic. This is optional and only used if your site is integrated with <strong>Gatsby Cloud.</strong></p>                                                                                                                                                                                                                                                                        |
| <strong>options.transformFieldName</strong><br/><strong><span class="highlight">function</span></strong><br/>                                              | <p>Transforms unsupported GraphQL characters into compatible ones. For example, <strong>&quot;my-field&quot;</strong> will get converted to <strong>&quot;my*field&quot;. </strong>Usually, you won&#39;t need to provide a value for this option. By default, fields with <strong>&quot;-&quot; </strong>will be converted to <strong>&quot;*&quot;.</strong></p>                                                                                                                                                                                |
| <strong>options.fetch</strong><br/><strong><span class="highlight">function</span></strong><br/>                                                           | <p>Provide a custom <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" target="_blank" rel="noopener noreferrer">fetch-compliant function</a> for making network requests. This allows for custom request handling, like using an <a href="https://nodejs.org/api/http.html#http_class_http_agent" target="_blank" rel="noopener noreferrer">HTTP Agent</a> for working behind a firewall. By default, <a href="https://github.com/node-fetch/node-fetch" target="_blank" rel="noopener noreferrer">node-fetch</a> is used.</p> |

## Downloading images and files locally

Gatsby can download images and files when sourcing content from Prismic. This is required if `gatsby-transformer-sharp` is used to process images at build time. By default, no images or files are downloaded.

You can determine which files are downloaded by providing a `shouldDownloadFiles` option in `gatsby-config.js`. This option should be an object mapping a field's full path to one of the following:

- `true` or `false`: If set to `true`, the file will be downloaded
- A function returning `true` or `false`: If the function returns `true`, the file will be downloaded

When using a function, the field is provided as an argument. This enables you to conditionally return true or false based on the field's contents if needed.

See the following snippet for an example:

```javascript
// Example gatsby-config.js file

module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				// Alongside your other options...
				shouldDownloadFiles: {
					// Download an Author's `photo` image:
					"author.data.photo": true,
					// Do not download a Page's `attachment` file:
					"page.data.body.attachments.items.attachment": false,
					// Only download a BlogPost's `attachment`
					// file if it is smaller than 10 MB:
					"blog_post.data.attachments.attachment": ({ size }) => size < 10000,
				},
			},
		},
	],
};
```

## Releases

You can provide a `releaseID` option to the plugin to build a [release](https://prismic.io/docs/core-concepts/draft-plan-and-schedule-content#releases) version of your website. You can get a release ID by using the Prismic REST API:

```javascript
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

In the `refs` array of the response, the `id` property of the `refs` object is a release ID. The label identifies the release's purpose. Master, for example, is the latest published version of all your documents. Your other Prismic Releases will be listed here with their names.

Note that a release build is totally compatible with live client-side previews. Building with a release is a way to view another version of your website, but it works the same way as the default build under the hood.

## Manual Custom Type schemas setup

This is required only if you do not provide a value to `customTypesApiToken`.

Follow these steps to enable the manual setup:

1. At the root of your project, create a `custom_type`s folder
1. Open the new folder and create JSON files for each Custom Type that exists in your repository
1. In your repository, go to each of your Custom Type, click on the *JSON editor tab*, copy the object and paste it into each file
1. Import each Custom Type JSON in the `schemas` of the plugin configuration

In this example, we have one repeatable Custom Type with the API ID of 'Page'. We copy the JSON object from our repository's *Custom Type editor > JSON Editor tab* and paste it into the file. See how we declare this schema in the `custom_types` folder and the plugin configuration.

**〜/custom_types/page.json**:

```json
// Example json schema configuration
{
	"Main": {
		"uid": {
			"type": "UID",
			"config": {
				"label": "uid"
			}
		},
		"title": {
			"type": "StructuredText",
			"config": {
				"single": "heading1, heading2, heading3, heading4, heading5, heading6",
				"label": "Title",
				"placeholder": "Title"
			}
		},
		"description": {
			"type": "StructuredText",
			"config": {
				"multi": "paragraph, preformatted, heading1, heading2, heading3, heading4, heading5, heading6, strong, em, hyperlink, image, embed, list-item, o-list-item, rtl",
				"label": "description",
				"placeholder": "description"
			}
		}
	}
}
```

**〜/gatsby-config.js**:

```javascript
// Example plugin configuration
plugins: [
	{
		resolve: "gatsby-source-prismic",
		options: {
			// ...
			schemas: {
				page: require("./custom_types/page.json"),
			},
			// ...
		},
	},
];
```

## Usage

In this example plugin configuration, we are declaring all the possible available options.

```javascript
const linkResolver = require("./example-route-to-linkResolver");
const htmlSerializer = require("./example-route-to-htmlSerializer");

require("dotenv").config({
	path: `.env.${process.env.NODE_ENV}`,
});

module.exports = {
	plugins: [
		// ...
		"gatsby-plugin-image",
		{
			resolve: "gatsby-source-prismic",
			options: {
				repositoryName: process.env.GATSBY_PRISMIC_REPO_NAME,
				accessToken: process.env.PRISMIC_ACCESS_TOKEN,
				customTypesApiToken: process.env.PRISMIC_CUSTOM_TYPES_API_TOKEN,
				schemas: {
					example_type: require("./custom_types/example_type.json"),
				},
				apiEndpoint: process.env.PRISMIC_API_ENDPOINT,
				customTypesApiEndpoint: process.env.PRISMIC_CUSTOM_TYPES_API_ENDPOINT,
				releaseID: process.env.PRISMIC_RELEASE_ID,
				linkResolver: (doc) => linkResolver(doc),
				graphQuery: `
          {
            // Your graphQuery
          }
        `,
				htmlSerializer: (type, element, content, children) => {
					// Return HTML for an piece of content.
				},
				lang: "*",
				imageImgixParams: {
					auto: "compress,format",
					fit: "max",
					q: 50,
				},
				imagePlaceholderImgixParams: {
					w: 100,
					blur: 15,
					q: 50,
				},
				typePrefix: "Prefix",
				webhookSecret: process.env.PRISMIC_WEBHOOK_SECRET,
				transformFieldName: (fieldName) => fieldName.replace(/-/g, "_"),
			},
		},
	],
};
```
