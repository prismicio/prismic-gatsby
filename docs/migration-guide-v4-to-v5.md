# Migration Guide: gatsby-source-prismic V4 to V5

The following guide describes how to upgrade your Gatsby + Prismic project from V4 of the integration to V5.

---

> **Prismic React Templating**
>
> These docs use the latest version `@prismicio/react`. Follow [the migration guide](https://prismic.io/docs/prismic-react-v2-migration-guide) to update your project if you're still using `prismic-reactjs` V1.

The following versions are referenced in this guide:

- "Gatsby 4" will refer to [Gatsby version 4](https://www.gatsbyjs.com/gatsby-4/).
- "V4" and "V5" will refer to Prismic's Gatsby plugins, `gatsby-source-prismic,` and `gatsby-plugin-prismic-previews`. Both plugins use the same version numbers.

> **🕙 Before Reading**
>
> If your project uses a version of `gatsby-source-prismic` or `gatsby-plugin-prismic-previews` older than V4, perform the previous migration guides before proceeding.
>
> - [V3 to V4 Migration Guide](https://prismic.io/docs/gatsby-source-prismic-v3-to-v4)
> - [V2 to V3 Migration Guide](https://prismic.io/docs/gatsby-source-prismic-v2-to-v3)
> - [gatsby-source-prismic-graphql Migration Guide](https://prismic.io/docs/migrate-to-gatsby-source-prismic-gatsby)

## Update your dependencies

To update your project to V5. First, you'll need to update your dependencies.

### Update Gatsby

The latest version of Gatsby 4 is highly recommended when using `gatsby-source-prismic` V5. Update your `package.json`.

```json
{
	"dependencies": {
		"gatsby": "^4.0.0"
	}
}
```

### Update gatsby-source-prismic

Update your `package.json` to use the latest version of `gatsby-source-prismic`.

```json
{
	"dependencies": {
		"gatsby-source-prismic": "^5.0.0"
	}
}
```

### Update gatsby-plugin-prismic-previews

If your project uses `gatsby-plugin-prismic-previews`, update your `package.json` to use the latest version of the plugin.

```json
{
	"dependencies": {
		"gatsby-plugin-prismic-previews": "^5.0.0"
	}
}
```

## Handling breaking changes

The following changes are required when upgrading to the latest version of Gatsby and its Prismic plugins.

### Only download files listed in the shouldDownloadFiles plugin option

Affected plugin: `gatsby-source-prismic`

> **🖼 Are you using Imgix?**
>
> This change only affects sites using the `localFile` field for Image and Link fields. If you are using the Imgix fields, no change is required.
>
> Using Imgix URLs for images or the Prismic CDN for files is recommended for the quickest development startup-time and production build-time. See the [Image processing](https://prismic.io/docs/technologies/template-images-gatsby#image-processing) section for more details on using Imgix URLs.

In **V4**, files can be downloaded from Prismic and served from your host. This is done by querying the `localFile` field within an Image or Link field. The plugin only downloads the file once it is returned from a query, meaning not queried files aren't downloaded.

In **V5**, files get downloaded as soon as Gatsby's server starts to make the startup and build times quicker. To download files locally, you must list which files should be downloaded. By default, no files are downloaded.

You can tell the plugin to download a file by giving its full field path and one of the following:

- `true`: Downloads the file.
- `false`: Does not download the file (default).
- A function that returns true or false and determines if the file should be downloaded. The function receives the field as an argument.

See the following sample `gatsby-config.js` for examples:

```javascript
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

### Remove manually imported CSS file

**Affected plugin: `gatsby-plugin-prismic-previews`**

In **V4**, you need a CSS file to style the preview plugin's modals. Modals appear when a preview is loading or when prompting an access token. You import this CSS file in `gatsby-browser.js` and `gatsby-ssr.js`.

In **V5**, these styles are automatically added. They are also scoped using a [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM), which will not affect your site's styling.

Remove the CSS import from `gatsby-browser.js` and `gatsby-ssr.js` when updating.

```diff
- import 'gatsby-plugin-prismic-previews/dist/styles.css'
```

## New Features

### Provide all preview repository configurations to <PrismicPreviewProvider>

Affected plugin:** `gatsby-plugin-prismic-previews`**

In **V4**, setting up in-browser previews with `gatsby-plugin-prismic-previews` requires providing configuration to individual page templates. In most cases, the configuration is identical among all templates, making it tedious to set up and make changes.

In **V5**, You can provide the repository configuration in one shared location: `<PrismicPreviewProvider>`. Like the following example, you can pass each configuration to the provider's `repositoryConfigs` prop.

Note that you should provide `componentResolver` to support unpublished previews.

```javascript
import * as React from "react";
import {
	PrismicPreviewProvider,
	componentResolverFromMap,
} from "gatsby-plugin-prismic-previews";

import { linkResolver } from "./src/linkResolver";
import BlogPostTemplate from "./src/pages/{PrismicBlogPost.url}";
import PageTemplate from "./src/pages/{PrismicPage.url}";

export const wrapRootElement = ({ element }) => (
	<PrismicPreviewProvider
		repositoryConfigs={[
			{
				repositoryName: process.env.GATSBY_REPOSITORY_NAME,
				linkResolver,
				componentResolver: componentResolverFromMap({
					page: PageTemplate,
					blog_post: BlogPostTemplate,
				}),
			},
		]}
	>
		{element}
	</PrismicPreviewProvider>
);
```

In the page templates that use `withPrismicPreview`, `withPrismicUnpublishedPreview`, and `withPrismicPreviewResolver` you can leave off the repository configuration argument. You can continue to use it if you need to override the configuration provided to the root provider.

```diff
  import { withPrismicPreview } from 'gatsby-plugin-prismic-previews'

  const PageTemplate = () => {
    // Your template
  }

- export default withPrismicPreview(PageTemplate, [{
-   repositoryName: process.env.GATSBY_REPOSITORY_NAME,
-   linkResolver
- }])
+ export default withPrismicPreview(PageTemplate)
```

### Query for Rich Text fields with richText

**Affected plugin: `gatsby-source-prismic`**

In **V4**, querying for Rich Text fields can be done using three fields:

- `text`: The plain text version of the content.
- `html`: The HTML version of the content.
- `raw`: The raw Prismic Rich Text data. Used with `@prismicio/react`'s `<PrismicRichText>` component.

In **V5**, the `raw` field is now renamed to `richText`. The new name more better describes the data contained within the field. A page GraphQL query using the `richText` field could look like the following:

```diff
  query PageTemplate($id: String) {
    prismicPage(id: { eq: $id }) {
      data {
        title {
-         raw
+         richText
        }
      }
    }
  }
```

The `richText` field can then be passed to the `<PrismicRichText>` component in place of the `raw` field:

```diff
  import { PrismicRichText } from '@prismicio/react'

  const PageTemplate = (doc) => {
    return (
-     <PrismicRichText field={doc.data.example_rich_text.raw} />
+     <PrismicRichText field={doc.data.example_rich_text.richText} />
    )
  }
```

The `raw` field will continue to be available but is deprecated and should be replaced with the `richText` field.
