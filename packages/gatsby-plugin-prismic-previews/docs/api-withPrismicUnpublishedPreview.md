# withPrismicUnpublishedPreview

This [higher order component][hoc] (HOC) is used to preview unpublished pages
within your app. It automatically renders a page template component with content
from a document that yet to be published. This HOC relies on being added to your
app's
[404 page](https://www.gatsbyjs.com/docs/how-to/adding-common-features/add-404-page/)
to correctly detect an unpublished page.

If you choose to keep your access token private by not providing it as part of
the plugin's options, this HOC will also display a modal allowing an editor to
provide it. It will save the token locally within the browser for future preview
updates.

**Note**: When viewing your unpublished preview page during development, Gatsby
will display its default development 404 page. To preview content on the
unpublished preview page, click the "Preview custom 404 page" button that
appears toward the top of the page. This will hide Gatsby's default development
404 component and render your page instead.

```typescript
function withPrismicUnpublishedPreview(
	WrappedComponent: React.ComponentType,
	repositoryConfigs: {
		repositoryName: string;
		linkResolver: LinkResolver;
		htmlSerializer?: HTMLSerializer;
		transformFieldName?: FieldNameTransformer;
		componentResolver: (
			nodes: PrismicNode[],
		) => React.ComponentType | undefined | null;
		dataResolver?: (
			nodes: PrismicNode[],
			data: Record<string, unknown>,
		) => Record<string, unknown>;
	}[],
): React.ComponentType;
```

- **`WrappedComponent`**<br/>The page component to which Prismic unpublished
  previews will be connected. This should be your app's 404 page.

- **`repositoryConfigs`**<br/>A set of configuration values for each Prismic
  repository used in your app.

The following configuration should be provided for each Prismic repository used
in your app:

- **`linkResolver`**<br/>The [Link Resolver][link-resolver] used for the Prismic
  repository. This should be the same Link Resolver provided to
  [`gatsby-source-prismic`][gsp] in your app's `gatsby-config.js`.

- **`htmlSerializer`**<br/>The optional [HTML Serializer][html-serializer] used
  for the configured Prismic repository. This should be the same HTML Serializer
  provided to [`gatsby-source-prismic`][gsp] in your app's `gatsby-config.js`.

- **`transformFieldName`**<br/>The optional field name transformer for the
  configured Prismic repository. This should be the same `transformFieldName`
  function provided to [`gatsby-source-prismic`][gsp] in your app's
  `gatsby-config.js` if used. Most projects will not need to provide a value for
  this option.

- **`componentResolver`**<br/>A function that determines the component to render
  during an unpublished preview. This function will be provided a list of nodes
  that match the URL of the page. Using the list of nodes, the appropriate page
  template component should be returned

  The components returned from this function must be wrapped in
  [`withPrismicPreview`](./api-withPrismicPreview.md) in order for the component
  to properly resolve the preview.

  In most cases, the [`componentResolverFromMap()`](#componentResolverFromMap)
  helper function can be used as an easy way to map a Prismic document type to a
  component.

- **`dataResolver`**<br/>A function that determines the data provided to the
  resolved component's `data` prop. This function will be provided a list of
  nodes that match the URL of the page and the wrapped component's original
  `data` prop. Using the list of nodes and the original data, an object of data
  should be returned that matches the shape of the resolved page template's
  GraphQL query.

  In most cases, this can be left empty. The default `dataResolver` will
  automatically retrieve the first matching node and add it to the existing
  `data` prop using the node's typename.

## `componentResolverFromMap()`

This helper function is a simple method to determine which component to display
during an unpublished preview. While `componentResolver` provides you with a
list of nodes that match the URL of the previewed document, this list will
usually only include one node. `componentResolverFromMap()` uses this assumption
to allow you to provide just set of document types and their matching components
to render. The first node's type in the list is used to select the component.

See the the next section for an example of `componentResolverFromMap()`.

## Typical Example

This example uses `withPrismicUnpublishedPreview()` to automatically display an
unpublished document's content. The HOC is used on the app's 404 page to allow
any non-existent page to be converted into a preview.

The 404 page component is written as a standard Gatsby page without any special
preview-specific code. In most cases, you can simply add
`withPrismicUnpublishedPreview()` around the default export to an existing page
template to enable unpublished preview support.

Note that this means your 404 page can still use its own GraphQL query to
display Prismic content. When an unpublished preview is active, this data will
continue to be accessible within the previewed component.

```javascript
// src/pages/404.js

import * as React from "react";
import { graphql } from "gatsby";
import {
	withPrismicUnpublishedPreview,
	componentResolverFromMap,
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

[hoc]: https://reactjs.org/docs/higher-order-components.html
[link-resolver]: https://prismic.io/docs/technologies/link-resolver-gatsby
[gsp]: https://github.com/angeloashmore/gatsby-source-prismic
[html-serializer]: https://prismic.io/docs/technologies/html-serializer-javascript
[usemergeprismicpreviewdata]: ./useMergePrismicPreviewData.md
