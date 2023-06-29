# gatsby-source-prismic - v4

## Overview

The `gatsby-source-prismic` plugin allows you to pull data from your Prismic repository into a [Gatsby](https://www.gatsbyjs.com/) site.

## Dependencies and requirements

The `gatsby-plugin-image` plugin helps you adding responsive images to your site and is required to support Gatsby's automatic image optimization component, `<GatsbyImage>`. And, the `prismic-reactjs` library helps to render specific structured fields like Rich Text, Dates, and Links.

Also, this plugin works with [gatsby-plugin-prismic-previews](https://prismic.io/docs/technical-reference/gatsby-plugin-prismic-previews) to configure live previews in your Gatsby project

## Installation

### Install packages

Add the `gatsby-source-prismic` plugin and its peer dependencies to your Gatsby project via the command line:

**npm**:

```javascript
npm install gatsby-source-prismic@4.2.0 gatsby-plugin-image prismic-reactjs
```

**Yarn**:

```javascript
yarn add gatsby-source-prismic@4.2.0 gatsby-plugin-image prismic-reactjs
```

### Configure the plugin

Define the plugin configuration in the `gatsby-config.js` file. The following table indicates all the fields that the plugin accepts:

| Property                                                                                                                                                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <strong><strong>Plugin option</strong></strong><br/>                                                                                                       | <p><strong>Description</strong></p>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| <strong>resolve</strong><br/><strong><span class="highlight">string (required)</span></strong><br/>                                                        | <p>The name of the plugin. It must be <strong>&#39;gatsby-source-prismic&#39;.</strong></p>                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| <strong>options</strong><br/><strong><span class="highlight">object (required)</span></strong><br/>                                                        | <p>Object that holds all the plugin configuration.</p>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| <strong>options.repositoryName</strong><br/><strong><span class="highlight">string (required)</span></strong><br/>                                         | <p>The name of your Prismic repository. If your Prismic URL is &#39;https://my-cool-website.prismic.io/api/v2&#39;, your repo name is <strong>&#39;my-cool-website&#39;.</strong></p>                                                                                                                                                                                                                                                                                                                                                                 |
| <strong>options.accessToken</strong><br/><strong><span class="highlight">string</span></strong><br/>                                                       | <p>The access token for private APIs. Only needed if the API of <a href="https://user-guides.prismic.io/en/articles/1036153-generating-an-access-token" rel="noopener noreferrer">your repository is private</a>.</p>                                                                                                                                                                                                                                                                                                                                 |
| <strong>options.customTypesApiToken</strong><br/><strong><span class="highlight">string</span></strong><br/>                                               | <p>Provide an API token for your Prismic repository to allow your Custom Type schemas to be automatically fetched from <a href="https://prismic.io/docs/custom-types-api">The Custom Types API</a>. <em>If you provide both <strong>customTypesApiToken</strong> and <strong>schemas</strong>, the <strong>schemas</strong> object will take priority.</em></p>                                                                                                                                                                                       |
| <strong>options.schemas</strong><br/><strong><span class="highlight">object (required if customTypesApiToken isn&#39;t defined)</span></strong><br/>       | <p>Provide an object with all the Custom Type JSON schemas of your repository. <em>If you provide both <strong>customTypesApiToken</strong> and <strong>schemas</strong>, the <strong>schemas</strong> object will take priority.</em></p>                                                                                                                                                                                                                                                                                                            |
| <strong>options.customTypesApiEndpoint</strong><br/><strong><span class="highlight">string</span></strong><br/>                                            | <p>Provide the API endpoint used to fetch Custom Types from Prismic. In most cases, you can omit this option unless you require an API proxy or need to mock network responses. By default, your repository&#39;s standard endpoint will be used.</p>                                                                                                                                                                                                                                                                                                 |
| <strong>options.apiEndpoint</strong><br/><strong><span class="highlight">string</span></strong><br/>                                                       | <p>Provide the API endpoint used to fetch content from Prismic. In most cases, you can omit this option unless you require an API proxy or need to mock network responses. By default, your repository&#39;s standard endpoint will be used.</p>                                                                                                                                                                                                                                                                                                      |
| <strong>options.releaseID</strong><br/><strong><span class="highlight">string</span></strong><br/>                                                         | <p>If you provide a release ID, the plugin will fetch data from your repository&#39;s specific release. Note that if you add changes to a release, you&#39;ll need to rebuild your website to see them.</p>                                                                                                                                                                                                                                                                                                                                           |
| <strong>options.linkResolver</strong><br/><strong><span class="highlight">function</span></strong><br/>                                                    | <p>Set a <a href="https://prismic.io/docs/route-resolver">Link Resolver</a> to process links in your documents. You&#39;ll use it to process links in your content. Rich Texts, Links, and Content Relationship fields use this to generate the correct link URLs.</p>                                                                                                                                                                                                                                                                                |
| <strong>options.graphQuery</strong><br/><strong><span class="highlight">string with GraphQuery syntax</span></strong><br/>                                 | <p><a href="https://prismic.io/docs/graphquery-rest-api">GraphQuery</a> syntax allows you to fetch linked documents&#39; content fields. Provide GraphQuery if you need to fetch nested content to make it available in your Link Resolver. All top-level fields are fetched for all documents by default.</p>                                                                                                                                                                                                                                        |
| <strong>options.htmlSerializer</strong><br/><strong><span class="highlight">function</span></strong><br/>                                                  | <p>The <a href="https://prismic.io/docs/html-serializer">HTMLSerializer</a> helps you customize the HTML output of a Rich Text field.</p>                                                                                                                                                                                                                                                                                                                                                                                                             |
| <strong>options.lang</strong><br/><strong><span class="highlight">string</span></strong><br/>                                                              | <p>Set a default language when fetching documents. The default value is <strong>&#39;\*&#39;,</strong> which will fetch all languages. Read <a href="https://prismic.io/docs/internationalization-gatsby">Multilingual content</a>.</p>                                                                                                                                                                                                                                                                                                               |
| <strong>options.pageSize</strong><br/><strong><span class="highlight">number</span></strong><br/>                                                          | <p>Set the maximum page size used when fetching documents from the Prismic API. If you reach API limits due to large documents, set this to a number less than the maximum (100). By default, the API used the maximum page size of 100.</p>                                                                                                                                                                                                                                                                                                          |
| <strong>options.imageImgixParams</strong><br/><strong><span class="highlight">object</span></strong><br/>                                                  | <p>Provide a default set of <a href="https://docs.imgix.com/apis/url" rel="noopener noreferrer">Imgix image transformations</a> to your images. These options will override the default <a href="https://user-guides.prismic.io/en/articles/3309829-image-optimization-imgix-integration" rel="noopener noreferrer">Imgix transformations set by Prismic</a>.</p>                                                                                                                                                                                     |
| <strong>options.imagePlaceholderImgixParams</strong><br/><strong><span class="highlight">object</span></strong><br/>                                       | <p>Provide a default set of <a href="https://docs.imgix.com/apis/url" rel="noopener noreferrer">Imgix image transformations</a> applied to the placeholder of your images. These parameters will override those provided in the above <strong>imageImgixParams</strong> option.</p>                                                                                                                                                                                                                                                                   |
| <strong>options.typePrefix</strong><br/><strong><span class="highlight">string (required when sourcing from more than one repository)</span></strong><br/> | <p>Provide a prefix for all GraphQL types for your Prismic repository. If you have multiple repositories, each plugin should have a unique <strong>typePrefix</strong> to avoid type conflicts.</p>                                                                                                                                                                                                                                                                                                                                                   |
| <strong>options.webhookSecret</strong><br/><strong><span class="highlight">string</span></strong><br/>                                                     | <p>If you configure your Prismic repository&#39;s Webhooks to send a secret, provide the secret here. A secret allows you to confirm the Webhook is from Prismic. This step is optional and only used if you integrate your site with <strong>Gatsby Cloud.</strong></p>                                                                                                                                                                                                                                                                              |
| <strong>options.transformFieldName</strong><br/><strong><span class="highlight">function</span></strong><br/>                                              | <p>This option transforms unsupported GraphQL characters into compatible ones. For example, <strong>&quot;my-field&quot;</strong> will get converted to <strong>&quot;my*field&quot;. </strong>Usually, you won&#39;t need to provide a value for this option. By default, fields with <strong>&quot;-&quot; </strong>will be converted to <strong>&quot;*&quot;.</strong></p>                                                                                                                                                                        |
| <strong>options.fetch</strong><br/><strong><span class="highlight">function</span></strong><br/>                                                           | <p>Provide a custom <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" target="_blank" rel="noopener noreferrer">fetch-compliant function</a> for making network requests. This allows for custom request handling, like using an <a href="https://nodejs.org/api/http.html#http_class_http_agent" target="_blank" rel="noopener noreferrer">HTTP Agent</a> for working behind a firewall. By default, it will use <a href="https://github.com/node-fetch/node-fetch" target="_blank" rel="noopener noreferrer">node-fetch</a>.</p> |
|                                                                                                                                                            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

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

The manual Custom Type setup is required if you do not provide a value to `customTypesApiToken`.

Follow these steps to enable the manual setup:

1. At the root of your project, create a `custom_types` folder
1. Open the new folder and create JSON files for each Custom Type that exists in your repository
1. In your repository, go to each of your Custom Type, click on the *JSON editor tab*, copy the object and paste it into each file
1. Import each Custom Type JSON in the `schemas` of the plugin configuration. Also, provide an empty object for each inactive Custom Type.

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
