# Preview Drafts

Learn how to configure the `gatsby-plugin-prismic-previews` plugin to Integrate live Prismic previews into your Gatsby project.

---

There are two ways to set up Prismic previews: with the dedicated preview plugin or Gatsby Cloud Previews. Both options require the following preview resolver setup.

If you are using Gatsby Cloud Previews, follow this guide. About halfway through the guide, you'll see a warning that notifies you when to stop and to continue in the [dedicated guide for Gatsby Cloud](./08-use-gatsby-cloud.md).

## Set up Previews in your repository

Setup up previews in your Prismic repository. If you haven't done it yet, follow the dedicated guide:

> **Domain for Your Application in Gatsby Cloud**
>
> If you are using Gatsby Cloud Previews, ensure the Domain for your Application is the same as the CMS Preview URL copied from your Gatsby Cloud dashboard.

> **Using Amazon S3 or Gatsby Cloud?**
>
> If you are hosting your site with [Gatsby Cloud](https://www.gatsbyjs.com/products/cloud/) or [Amazon S3](https://aws.amazon.com/s3/), set the **Route Resolver** option with a trailing slash (for example, `/preview/`, not `/preview`) to ensure they send the URL parameters to the preview page.
>
> Other hosts, like [Netlify](https://www.netlify.com/), do not require particular configurations.

## Configure the preview plugin

The `gatsby-plugin-prismic-previews` plugin provides ready-to-use [Higher-Order Components (HOC)](https://reactjs.org/docs/higher-order-components.html) to wrap pages. Refer to the technical reference if you want to learn how these components work.

### 1. Prerequisites

This preview plugin requires you to first install and configure the source plugin in your project. Also, you must have set up your routes with a Route Resolver function to resolve your URLs and work with links.

If you're missing these steps, refer to the dedicated articles to configure them and then return.

### 2. Install the plugin

**npm**:

```bash
npm install gatsby-plugin-prismic-previews
```

**Yarn**:

```graphql
yarn add gatsby-plugin-prismic-previews
```

As explained in [the source plugin installation guide](./02-set-up-prismic.md), ensure you're using [Environment variables](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/) so secrets and other secured data aren't committed to source control.

### 3. Configure the plugin

Define the plugin configuration in the `gatsby-config.js` file. If you have multiple repositories, duplicate the plugin configuration for each repository and add the `typePrefix` plugin option to differentiate the schemas.

The following table indicates all the basic required fields of the plugin:

| Property                                                                                                           | Description                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <strong><strong>Plugin option</strong></strong><br/>                                                               | <p><strong>Description</strong></p>                                                                                                                                                                                   |
| <strong>resolve</strong><br/><strong><span class="highlight">string (required)</span></strong><br/>                | <p>The name of the plugin. It must be <span class="codespan">gatsby-plugin-prismic-previews</span>.</p>                                                                                                               |
| <strong>options</strong><br/><strong><span class="highlight">object (required)</span></strong><br/>                | <p>Property that holds all the plugin configuration.</p>                                                                                                                                                              |
| <strong>options.repositoryName</strong><br/><strong><span class="highlight">string (required)</span></strong><br/> | <p>The name of your Prismic repository. If your Prismic URL is <span class="codespan">https://my-cool-website.prismic.io/api/v2</span>, your repo name is <span class="codespan">my-cool-website</span>.</p>          |
| <strong>options.accessToken</strong><br/><strong><span class="highlight">string</span></strong><br/>               | <p>The access token for private APIs. Only needed if the API of <a href="https://user-guides.prismic.io/en/articles/1036153-generating-an-access-token" rel="noopener noreferrer">your repository is private</a>.</p> |

Additionally, the following list indicates the options you** must provide to both plugins**. For example, if you configure a `lang` option in `gatsby-source-prismic`, then you must also provide it to `gatsby-plugin-prismic-previews`:

- `graphQuery`
- `lang`
- `pageSize`
- `imageImgixParams`
- `imagePlaceholderImgixParams`
- `typePrefix`
- `routes`

Refer to the technical references to see all the available plugin options for the [gatsby-source-prismic](./technical-reference-gatsby-source-prismic-v5.md) and [gatsby-plugin-prismic-previews](./technical-reference-gatsby-plugin-prismic-previews-v5.md) plugins.

### Example configuration

In this example, we use the basic setup options. Update it with the ones that apply to your project. For instance, if your repository's API is public, you don't need an `accessToken`:

```javascript
require("dotenv").config();

module.exports = {
	plugins: [
		{
			resolve: "gatsby-plugin-prismic-previews",
			options: {
				repositoryName: process.env.GATSBY_PRISMIC_REPO_NAME,
				accessToken: process.env.PRISMIC_ACCESS_TOKEN,
				routes: [
					{
						type: "article",
						path: "/articles/:uid",
					},
					{
						type: "page",
						path: "/:uid",
					},
				],
			},
		},
		// All other plugins and configurations
	],
};
```

## Configure your project code

Now connect your app to the plugin's system. The following steps explain which files will need to be created or updated.

### 1. Set the preview provider

Wrap your application with the `<PrismicPreviewProvider>` component. Create the following two files at the root of your project and set them up the same way. Following [Gatsby's recommendation](https://www.gatsbyjs.org/docs/browser-apis/#wrapRootElement), they both share the same pieces of code:

1. `gatsby-ssr.js`
1. `gatsby-browser.js`

Then, update the values to match your repository information and project details:

```javascript
import * as React from "react";
import { PrismicPreviewProvider } from "gatsby-plugin-prismic-previews";

const repositoryConfigs = [
	{
		repositoryName: "your-repo-name",
		componentResolver: {
			page: React.lazy(() => import("../templates/page.js")),
		},
	},
];

export const wrapRootElement = ({ element }) => (
	<PrismicPreviewProvider repositoryConfigs={repositoryConfigs}>
		{element}
	</PrismicPreviewProvider>
);
```

### 2. Add a preview resolver page

The preview page redirects to the correct page with preview content. For example, if an editor clicks the preview button for a blog post in the writing room, they will land on the preview resolver page within your app, which then redirects them to the blog post with previewed content.

Inside the `src/pages` folder, create a `preview.js` file. This page's name should be the same as the Preview Route field of your repository's Settings > Previews configuration.

Here's an example of a preview resolver page:

```javascript
import * as React from "react";
import { withPrismicPreviewResolver } from "gatsby-plugin-prismic-previews";

const PreviewPage = () => {
	return (
		<div>
			<h1>Loading preview…</h1>
		</div>
	);
};

export default withPrismicPreviewResolver(PreviewPage);
```

> **☁️ Are you using Gatsby Cloud?**
>
> If you are using Gatsby Cloud for previews, **you can stop here** and follow the [dedicated guide to configuring Gatsby Cloud](./08-use-gatsby-cloud.md).
>
> Continue if you are using a different hosting service like Netlify or Vercel.

### 3. Update content pages and templates

Add a `_previewable` field to the query and declare the [withPrismicPreview()](./technical-reference-gatsby-plugin-prismic-previews-v5.md#withprismicpreview) function. This setup will automatically detect an active preview session and update the content with the preview data.

This example shows a preview-connected page template:

```javascript
import * as React from "react";
import { graphql } from "gatsby";
import { withPrismicPreview } from "gatsby-plugin-prismic-previews";

const PageTemplate = ({ data }) => {
	const document = data.prismicPage.data;

	return (
		<div>
			<h1>{document.title.text}</h1>
		</div>
	);
};

export const query = graphql`
	query PageTemplate($id: String) {
		prismicPage(id: { eq: $id }) {
			_previewable
			data {
				title {
					text
				}
			}
		}
	}
`;

export default withPrismicPreview(PageTemplate);
```

### 4. 404 Not found page

Your app's 404 page is displayed any time a user visits a page that doesn't exist. This can be used to our advantage when trying to preview a page that has yet to be published. Because the page is not yet published, a page for it does not exist in your app. As a result, we can override the standard 404 page and render the previewed document instead.

This is what an unpublished preview 404 page could look like:

```javascript
import * as React from "react";
import { withPrismicUnpublishedPreview } from "gatsby-plugin-prismic-previews";

const NotFoundPage = () => {
	return (
		<div>
			<h1>Not found</h1>
		</div>
	);
};

export default withPrismicUnpublishedPreview(NotFoundPage);
```

### 5. Merge preview data when using `useStaticQuery`

If you have components that use Gatsby's `useStaticQuery`, they must be followed by the plugin's `useMergePrismicPreviewData` hook. This will merge previewed content into the static query's data.

When using this hook, queries must have a `_previewable` field, and the page must still be wrapped in `withPrismicPreview` as described in the [Update content pages and templates](./06-preview-drafts.md#2.-update-content-pages-and-templates) section.

This is what a `useStaticQuery` could look like:

```javascript
import * as React from "react";
import { graphql, useStaticQuery } from "gatsby";
import { useMergePrismicPreviewData } from "gatsby-plugin-prismic-previews";

const NonPageComponent = () => {
	const staticData = useStaticQuery(graphql`
		query NonPageQuery {
			prismicSettings {
				_previewable
				data {
					site_title {
						text
					}
				}
			}
		}
	`);
	const data = useMergePrismicPreviewData(staticData);

	return <h1>{data.prismicSettings.data.site_title.text}</h1>;
};

export default NonPageComponent;
```

Note that the component is not wrapped in `withPrismicPreview`. The page which contains this component, however, must use the `withPrismicPreview` higher-order component.

---

## Technical reference

If you'd like to get more in-depth information about how the `gatsby-plugin-prismic-previews` plugin options works, refer to the dedicated article:

- [**null**](./technical-reference-gatsby-plugin-prismic-previews-v5.md)<br/>Technical reference for the Gatsby and Prismic previews plugin.

- **Next article**: [Deploy your App](./07-deploy.md)
- **Previous article**: [Template Content](./05-template-content.md)
