# gatsby-plugin-prismic-previews - v4

## Overview

The `gatsby-plugin-prismic-previews` plugin allows you to integrate live Prismic Previews into a static [Gatsby](https://www.gatsbyjs.com/) site.

- Integrates tightly with the [gatsby-source-prismic](https://prismic.io/docs/technical-reference/gatsby-source-prismic) plugin.
- Refreshes preview content automatically as changes are saved in Prismic.
- Adds the [Prismic Toolbar](https://prismic.io/docs/preview) with an in-app edit button and preview link sharing.
- No extra infrastructure or costs are required (specifically, [Gatsby Cloud](https://www.gatsbyjs.com/cloud/) is not required).

This page describes the technical aspects of the plugin which may help you configure it for your needs.

If you are looking for an introduction to adding the plugin to your app, see the [Previews](https://prismic.io/docs/previews-gatsby) guide in the Gatsby documentation.

## Dependencies and requirements

This package works along with the [gatsby-source-prismic](https://prismic.io/docs/technical-reference/gatsby-source-prismic) plugin.

## Installation

Add the `gatsby-plugin-prismic-previews` plugin to your Gatsby project via the command line:

**npm**:

```plaintext
npm install gatsby-plugin-prismic-previews@4.2.0
```

**Yarn**:

```plaintext
yarn add gatsby-plugin-prismic-previews@4.2.0
```

### Configure the plugin

Define the plugin configuration in the `gatsby-config.js` file. The following table indicates all the fields that the plugin accepts:

| Property                                                                                                                                                   | Description                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <strong>resolve</strong><br/><strong><span class="highlight">string (required)</span></strong><br/>                                                        | <p>The name of the plugin. It must be &#39;<strong>gatsby-plugin-prismic-previews</strong>&#39;.</p>                                                                                                                  |
| <strong>options</strong><br/><strong><span class="highlight">object (required)</span></strong><br/>                                                        | <p>Property that holds all the plugin configuration.</p>                                                                                                                                                              |
| <strong>options.repositoryName</strong><br/><strong><span class="highlight">string (required)</span></strong><br/>                                         | <p>The name of your Prismic repository. If your Prismic URL is &#39;https://my-cool-website.prismic.io/api/v2&#39;, your repository name is <strong>&#39;my-cool-website&#39;.</strong></p>                           |
| <strong>options.accessToken</strong><br/><strong><span class="highlight">string</span></strong><br/>                                                       | <p>The access token for private APIs. Only needed if the API of <a href="https://user-guides.prismic.io/en/articles/1036153-generating-an-access-token" rel="noopener noreferrer">your repository is private</a>.</p> |
| <strong>options.toolbar</strong><br/><strong><span class="highlight">string</span></strong><br/>                                                           | <p>Determines the type of Prismic Toolbar that the plugin will add to your site. It defaults to &quot;new.&quot; If your repository uses a past version of the Toolbar, set it to &quot;legacy.&quot;</p>             |
| <strong>options.typePrefix</strong><br/><strong><span class="highlight">string (required when sourcing from more than one repository)</span></strong><br/> | <p>A prefix used for all GraphQL types for your Prismic repository. If you are sourcing from multiple repositories, each plugin should have a unique <strong>typePrefix</strong> to avoid type conflicts.</p>         |

Additionally, the following list\*\* **of options** must be provided if set in both plugins\*\*. For example, if a lang option is configured in `gatsby-source-prismic`, then that option must also be provided to `gatsby-plugin-prismic-previews`:

- `graphQuery`
- `lang`
- `pageSize`
- `imageImgixParams`
- `imagePlaceholderImgixParams`
- `typePrefix`

Read the `gatsby-source-prismic` technical reference for details about each option.

## withPrismicPreview

import { withPrismicPreview } from 'gatsby-plugin-prismic-previews'

This [higher-order component](https://reactjs.org/docs/higher-order-components.html) (HOC) connects the preview content to your app. It automatically updates a page's `data` prop with content from an active preview session as needed.

If you choose to keep your access token private by not providing it as part of the plugin's options, this HOC will also display a modal allowing an editor to provide it. It will save the token locally within the browser for future preview updates.

For this HOC to add preview content to your existing page data, you must mark documents in your query as "previewable." This involves adding a `_previewable` field to your query. See an example of this [below](https://prismic.io/docs/technologies/gatsby-plugin-prismic-previews-technical-reference#typical-example).

```javascript
function withPrismicPreview(
  WrappedComponent: React.ComponentType,
  repositoryConfigs: {
    repositoryName: string
    linkResolver: LinkResolver
    htmlSerializer?: HTMLSerializer
    transformFieldName?: FieldNameTransformer
  }[],
  config: {
    mergePreviewData?: boolean
  },
): React.ComponentType
```

| Property                                                                                                                        | Description                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <strong>WrappedComponent</strong><br/><strong><span class="highlight">React.ComponentType (required)</span></strong><br/>       | <p>The page component to which Prismic previews will be connected.</p>                                                                                                                                                                                                                                                                                                                                           |
| <strong>repositoryConfigs</strong><br/><strong><span class="highlight">object (required)</span></strong><br/>                   | <p>A set of configuration values for each Prismic repository used in your app.</p>                                                                                                                                                                                                                                                                                                                               |
| <strong>repositoryConfigs[n].repositoryName</strong><br/><strong><span class="highlight">string (required)</span></strong><br/> | <p>The name of your Prismic repository. If your Prismic URL is &#39;https://my-cool-website.prismic.io/api/v2&#39;, your repository name is <strong>&#39;my-cool-website&#39;.</strong></p>                                                                                                                                                                                                                      |
| <strong>repositoryConfigs[n].linkResolver</strong><br/><strong><span class="highlight">function (required)</span></strong><br/> | <p>The same <a href="https://prismic.io/docs/define-routes-gatsby">Link Resolver</a> provided to <a href="https://prismic.io/docs/technical-reference/gatsby-source-prismic">gatsby-source-prismic</a> in your app&#39;s <strong>gatsby-config.js</strong>.</p>                                                                                                                                                  |
| <strong>repositoryConfigs[n].htmlSerializer</strong><br/><strong><span class="highlight">function</span></strong><br/>          | <p>The same <a href="https://prismic.io/docs/html-serializer">HTML Serializer</a> provided to <a href="https://prismic.io/docs/technical-reference/gatsby-source-prismic">gatsby-source-prismic</a> in your app&#39;s <strong>gatsby-config.js</strong>.</p>                                                                                                                                                     |
| <strong>repositoryConfigs[n].transformFieldName</strong><br/><strong><span class="highlight">function</span></strong><br/>      | <p>The optional field name transformer for the configured Prismic repository. This should be the same <strong>transformFieldName</strong> function provided to <a href="https://prismic.io/docs/technical-reference/gatsby-source-prismic">gatsby-source-prismic</a> in your app&#39;s <strong>gatsby-config.js </strong>if used.<br /><br />Most projects will not need to provide a value for this option.</p> |
| <strong>config</strong><br/><strong><span class="highlight">object</span></strong><br/>                                         | <p>A set of configuration values that determine how the preview data is prepared and provided.</p>                                                                                                                                                                                                                                                                                                               |
| <strong>config.mergePreviewData</strong><br/><strong><span class="highlight">boolean</span></strong><br/>                       | <p>A boolean that determines if previewed content automatically blends into the page&#39;s <strong>data</strong> prop. This option defaults to <strong>true</strong>. If this option is <strong>false</strong>, the <strong>data</strong> prop will remain unmodified during previews. In that situation, preview data can be manually merged using useMergePrismicPreviewData().</p>                            |

### Typical example

This example uses `withPrismicPreview()` to automatically update a page template's data to include preview content during a preview session.

The page template component is a standard Gatsby page without any preview-specific code. In most cases, you can add `withPrismicPreview()` around the default export to an existing page template to enable preview support.

The page's query includes a `_previewable` field for the queried document that tells the HOC to replace the document's data with preview content if available. You must include this field any time a document is queried, including documents within Content Relationship fields.

```javascript
// src/pages/{PrismicPage.url}.js
import * as React from "react";
import { graphql } from "gatsby";
import { withPrismicPreview } from "gatsby-plugin-prismic-previews";

import { linkResolver } from "../linkResolver";

const PageTemplate = ({ data }) => {
	const page = data.prismicPage;

	return (
		<div>
			<h1>{page.data.title.text}</h1>
		</div>
	);
};

export default withPrismicPreview(PageTemplate, [
	{
		repositoryName: "my-repository-name",
		linkResolver,
	},
]);

export const query = graphql`
	query PageTemplate($id: ID!) {
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
```

## withPrismicPreviewResolver

import { withPrismicPreviewResolver } from 'gatsby-plugin-prismic-previews'

This [higher-order component](https://reactjs.org/docs/higher-order-components.html) (HOC) redirects from the Prismic writing room to a previewed document within your app. For example, if an editor clicks the preview button for a blog post in the writing room, they will land on the preview resolver page within your app, which then redirects them to the blog post with previewed content.

Every app must have a preview resolver page to preview content. This page usually will be created as `/preview` by creating a page at `/src/pages/preview.js`. You should configure this page as the preview resolver page in your Prismic repository's settings.

For more information on updating this setting within Prismic, see [the dedicated guide on setting up previews](https://prismic.io/docs/preview).

If you choose to keep your access token private by not providing it as part of the plugin's options, this HOC will display a modal allowing an editor to provide it. It will save the token locally within the browser for future preview updates.

```javascript
function withPrismicPreviewResolver(
  WrappedComponent: React.ComponentType,
  repositoryConfigs: {
    repositoryName: string
    linkResolver: LinkResolver
  }[],
  config: {
    autoRedirect?: boolean
  },
): React.ComponentType
```

| Property                                                                                                                        | Description                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <strong>WrappedComponent</strong><br/><strong><span class="highlight">React.ComponentType (required)</span></strong><br/>       | <p>The page component which will direct editors during preview sessions.</p>                                                                                                                                                                                                                                                                                                                              |
| <strong>repositoryConfigs</strong><br/><strong><span class="highlight">object (required)</span></strong><br/>                   | <p>A set of configuration values for each Prismic repository used in your app.</p>                                                                                                                                                                                                                                                                                                                        |
| <strong>repositoryConfigs[n].repositoryName</strong><br/><strong><span class="highlight">string (required)</span></strong><br/> | <p>The name of your Prismic repository. If your Prismic URL is &#39;https://my-cool-website.prismic.io/api/v2&#39;, your repository name is <strong>&#39;my-cool-website&#39;.</strong></p>                                                                                                                                                                                                               |
| <strong>repositoryConfigs[n].linkResolver</strong><br/><strong><span class="highlight">function (required)</span></strong><br/> | <p>The same Link Resolver provided to gatsby-source-prismic in your app&#39;s <strong>gatsby-config.js</strong>.</p>                                                                                                                                                                                                                                                                                      |
| <strong>config</strong><br/><strong><span class="highlight">object</span></strong><br/>                                         | <p>A set of configuration values that determine how editors are directed during preview sessions.</p>                                                                                                                                                                                                                                                                                                     |
| <strong>config.autoRedirect</strong><br/><strong><span class="highlight">boolean</span></strong><br/>                           | <p>An optional boolean that determines if editors should be automatically redirected to the previewed content&#39;s page within your app. This option defaults to <strong>true</strong>. If this option is set to <strong>false</strong>, editors will remain on the preview resolver page. In that situation, you can set up a redirect manually using the <strong>prismicPreviewPath</strong> prop.</p> |

### Typical example

This example uses `withPrismicPreviewResolver()` to automatically direct an editor from the Prismic writing room to the previewed content's page during a preview session.

The page template component is a standard Gatsby page without any preview-specific code. In most cases, you can add `withPrismicPreviewResolver()` around the default export to a placeholder page to enable preview support.

```javascript
// src/pages/preview.js
import * as React from "react";
import { withPrismicPreviewResolver } from "gatsby-plugin-prismic-previews";

import { linkResolver } from "../linkResolver";

const PreviewPage = () => {
	return (
		<div>
			<h1>Loading preview…</h1>
		</div>
	);
};

export default withPrismicPreviewResolver(PreviewPage, [
	{
		repositoryName: "my-repository-name",
		linkResolver,
	},
]);
```

## withPrismicUnpublishedPreview

import { withPrismicUnpublishedPreview } from 'gatsby-plugin-prismic-previews'

This [higher-order component](https://reactjs.org/docs/higher-order-components.html) (HOC) previews unpublished pages within your app. It automatically renders a page template component with content from a document that is yet to be published. This HOC relies on being added to your app's [404 page](https://www.gatsbyjs.com/docs/how-to/adding-common-features/add-404-page/) to detect an unpublished page correctly.

If you choose to keep your access token private by not providing it as part of the plugin's options, this HOC will also display a modal allowing an editor to provide it. It will save the token locally within the browser for future preview updates.

> **Note**: When viewing your unpublished preview page during development, Gatsby will display its default development 404 page.
>
> To preview content on the unpublished preview page, click the "Preview custom 404 page" button that appears toward the top of the page. This will hide Gatsby's default development 404 component and render your page instead.

```javascript
function withPrismicUnpublishedPreview(
  WrappedComponent: React.ComponentType,
  repositoryConfigs: {
    repositoryName: string
    linkResolver: LinkResolver
    htmlSerializer?: HTMLSerializer
    transformFieldName?: FieldNameTransformer
    componentResolver: (
      nodes: PrismicNode[],
    ) => React.ComponentType | undefined | null
    dataResolver?: (
      nodes: PrismicNode[],
      data: Record<string, unknown>,
    ) => Record<string, unknown>
  }[],
): React.ComponentType
```

| Property                                                                                                                             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <strong>WrappedComponent</strong><br/><strong><span class="highlight">React.ComponentType (required)</span></strong><br/>            | <p>The page component to which Prismic unpublished previews will be connected. This should be your app&#39;s 404 page.</p>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| <strong>repositoryConfigs</strong><br/><strong><span class="highlight">object (required)</span></strong><br/>                        | <p>A set of configuration values for each Prismic repository used in your app.</p>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| <strong>repositoryConfigs[n].repositoryName</strong><br/><strong><span class="highlight">string (required)</span></strong><br/>      | <p>The name of your Prismic repository. If your Prismic URL is &#39;https://my-cool-website.prismic.io/api/v2&#39;, your repository name is <strong>&#39;my-cool-website&#39;.</strong></p>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| <strong>repositoryConfigs[n].linkResolver</strong><br/><strong><span class="highlight">function (required)</span></strong><br/>      | <p>The same Link Resolver provided to gatsby-source-prismic in your app&#39;s <span class="codespan">gatsby-config.js</span>.</p>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| <strong>repositoryConfigs[n].htmlSerializer</strong><br/><strong><span class="highlight">function</span></strong><br/>               | <p>The same HTML Serializer provided to gatsby-source-prismic in your app&#39;s <span class="codespan">gatsby-config.js</span>.</p>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| <strong>repositoryConfigs[n].transformFieldName</strong><br/><strong><span class="highlight">function</span></strong><br/>           | <p>The optional field name transformer for the configured Prismic repository. This should be the same <span class="codespan">transformFieldName</span><strong> </strong>function provided to gatsby-source-prismic in your app&#39;s <span class="codespan">gatsby-config.js</span> if used.<br /><br />Most projects will not need to provide a value for this option.</p>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| <strong>repositoryConfigs[n].componentResolver</strong><br/><strong><span class="highlight">function (required)</span></strong><br/> | <p>A function that determines the component to render during an unpublished preview. This function will be provided a list of nodes that match the URL of the page. Using the list of nodes, the appropriate page template component should be returned<br /><br />The components returned from this function must be wrapped in <a href="https://prismic.io/docs/technologies/gatsby-plugin-prismic-previews-technical-reference#withprismicpreview" rel="noopener noreferrer">withPrismicPreview()</a> in order for the component to properly resolve the preview.<br /><br />In most cases, the <a href="https://prismic.io/docs/technologies/gatsby-plugin-prismic-previews-technical-reference#componentresolverfrommap" rel="noopener noreferrer">componentResolverFromMap()</a> helper function can be used as a way to map a Prismic document type to a component.</p> |
| <strong>repositoryConfigs[n].dataResolver</strong><br/><strong><span class="highlight">function</span></strong><br/>                 | <p>A function that determines the data provided to the resolved component&#39;s <strong>data</strong> prop. This function will be provided a list of nodes that match the URL of the page and the wrapped component&#39;s original <strong>data</strong> prop. Using the list of nodes and the original data, an object of data should be returned that matches the shape of the resolved page template&#39;s GraphQL query.<br /><br />In most cases, this can be left empty. The default <strong>dataResolver</strong> will automatically retrieve the first matching node and add it to the existing data prop using the node&#39;s typename.</p>                                                                                                                                                                                                                           |

### componentResolverFromMap()

import { componentResolverFromMap } from 'gatsby-plugin-prismic-previews'

This helper function is a method to determine which component to display during an unpublished preview. While the componentResolver option from [withPrismicUnpublishedPreview()](https://prismic.io/docs/technologies/gatsby-plugin-prismic-previews-technical-reference#withprismicunpublishedpreview) provides you with a list of nodes that match the URL of the previewed document, this list will usually only include one node. `componentResolverFromMap()` uses this assumption to allow you to provide just a set of document types and their matching components to render. The first node's type in the list selects the component.

```javascript
function componentResolverFromMap(
  componentMap: Record<string, React.ComponentType>,
): PrismicRepositoryConfig['componentResolver']
```

| Property                                                                                                 | Description                                                           |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| <strong>componentMap</strong><br/><strong><span class="highlight">object (required)</span></strong><br/> | <p>A record mapping a Prismic document type to a React component.</p> |

### Typical example

This example uses `withPrismicUnpublishedPreview()` to display an unpublished document's content automatically. The HOC is used on the app's 404 page to allow any non-existent page to be converted into a preview.

The 404 page component is written as a standard Gatsby page without any special preview-specific code. In most cases, you can add `withPrismicUnpublishedPreview()` around the default export to an existing page template to enable unpublished preview support.

Note that this means your 404 page can still use its own GraphQL query to display Prismic content. When an unpublished preview is active, this data will continue to be accessible within the previewed component.

```javascript
// src/pages/404.js
import * as React from "react";
import { graphql } from "gatsby";
import {
	componentResolverFromMap,
	withPrismicUnpublishedPreview,
} from "gatsby-plugin-prismic-previews";

import { linkResolver } from "../linkResolver";

import PageTemplate from "./PageTemplate";

const NotFoundPage = ({ data }) => {
	const page = data.prismicPage;

	return (
		<div>
			<h1>{page.data.title.text}</h1>
		</div>
	);
};

export default withPrismicUnpublishedPreview(PageTemplate, [
	{
		repositoryName: "my-repository-name",
		linkResolver,
		componentResolver: componentResolverFromMap({
			page: PageTemplate,
		}),
	},
]);

export const query = graphql`
	query NotFoundPage {
		prismicPage(id: { eq: "404" }) {
			_previewable
			data {
				title {
					text
				}
			}
		}
	}
`;
```

## useMergePrismicPreviewData

import { useMergePrismicPreviewData } from 'gatsby-plugin-prismic-previews'

This [React hook](https://reactjs.org/docs/hooks-intro.html) merges static data with preview data during a preview session. `withPrismicPreview()` uses this hook in its implementation to seamlessly update your page's `data` prop.

You can use `useMergePrismicPreviewData()` manually if needed. A common use case is to update data from Gatsby's [useStaticQuery()](https://www.gatsbyjs.com/docs/recipes/querying-data/#querying-data-with-the-usestaticquery-hook) hook. Because `useStaticQuery()` runs within a component, `withPrismicPreview()` cannot automatically update the data with previewed content. `useMergePrismicPreviewData()` can be used immediately after `useStaticQuery()` to do so.

```javascript
function useMergePrismicPreviewData(
  staticData: Record<string, unknown>,
  config?: {
    skip?: boolean
  },
): {
  data: Record<string, unknown>
  isPreview: boolean
}
```

| Property                                                                                               | Description                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <strong>staticData</strong><br/><strong><span class="highlight">object (required)</span></strong><br/> | <p>Static data from Gatsby&#39;s GraphQL layer.</p>                                                                                                                                                                     |
| <strong>config</strong><br/><strong><span class="highlight">object</span></strong><br/>                | <p>Configuration that determines how the hook merges preview data.</p>                                                                                                                                                  |
| <strong>config.skip</strong><br/><strong><span class="highlight">boolean</span></strong><br/>          | <p>Determines if preview data is merged during a preview session. This option defaults to <strong>false</strong>. If this option is set to <strong>true</strong>, the provided static data will always be returned.</p> |

### Typical Example

`This example uses useMergePrismicPreviewData()` to merge data from `useStaticQuery()` within a component.

Like page queries, include the `_previewable` field to update any nodes that will have preview content.

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
	const { data, isPreview } = useMergePrismicPreviewData(staticData);

	return <h1>{data.prismicSettings.data.site_title.text}</h1>;
};

export default NonPageComponent;
```
