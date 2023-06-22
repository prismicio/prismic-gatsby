# Migrate to the Preview Plugin

This guide will guide you though migrating your project preview configuration from gatsby-source-prismic to the preview plugin.

---

## What has changed?

Previously in versions three and below of the `gatsby-source-prismic` plugin, the preview functionality was enabled using the same plugin. Now previews are handled with the `gatsby-plugin-prismic-previews` plugin.

## Install the plugin

**npm**:

```plaintext
npm install gatsby-plugin-prismic-previews
```

**Yarn**:

```plaintext
yarn add gatsby-plugin-prismic-previews
```

## Handling breaking changes

### gatsby-browser.js and gatsby-ssr.js

In your `gatsby-browser.js` and `gatsby-ssr.js` files, replace the `PreviewStoreProvider` import with the `PrismicPreviewProvider` import. The new provider does not accept any props.

In addition to updating the context provider, you need to import a CSS file to style the preview system's interface. Users of your app will only see an interface during a preview session.

**After**:

```javascript
import * as React from "react";
import { PrismicPreviewProvider } from "gatsby-plugin-prismic-previews";

export const wrapRootElement = ({ element }) => (
	<PrismicPreviewProvider>{element}</PrismicPreviewProvider>
);
```

**Before**:

```javascript
import * as React from "react";
import { PreviewStoreProvider } from "gatsby-source-prismic";

export const wrapRootElement = ({ element }) => (
	<PreviewStoreProvider>{element}</PreviewStoreProvider>
);
```

If you have multiple repositories in your app, they will share a single provider.

### Update pages and templates

Change the `withPreview()` import to `withPrismicPreview()` and edit the arguments provided to the function in your preview-enabled page components or templates.

**After**:

```javascript
import * as React from "react";
import { graphql } from "gatsby";
import { withPrismicPreview } from "gatsby-plugin-prismic-previews";

// Update the path to your Link Resolver
import { linkResolver } from "../linkResolver";

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

export default withPrismicPreview(PageTemplate, [
	{
		repositoryName: "your-repository-name",
		linkResolver,
	},
]);
```

**Before**:

```javascript
import * as React from "react";
import { graphql } from "gatsby";
import { withPreview } from "gatsby-source-prismic";

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
			data {
				title {
					text
				}
			}
		}
	}
`;

export default withPreview(PageTemplate);
```

In most cases, you will only need to move your repository name to the function's second argument.

### Update the preview page

In your dedicated preview resolver page, update the `withPreviewResolver()` import to `withPrismicPreviewResolver()` and edit the arguments provided to the function. We usually create the preview resolver page at `〜/src/pages/preview.js`.

**After**:

```javascript
import * as React from "react";
import { withPrismicPreviewResolver } from "gatsby-plugin-prismic-previews";

// Update the path to your Link Resolver
import { linkResolver } from "../linkResolver";

const PreviewPage = ({ data }) => {
	// Your Page component
};

export default withPrismicPreviewResolver(PreviewPage, [
	{
		repositoryName: "your-repository-name",
		linkResolver,
	},
]);
```

**Before**:

```javascript
import * as React from "react";
import { withPreviewResolver } from "gatsby-source-prismic";

import { linkResolver } from "../path-to-your-linkResolver";

const PreviewPage = ({ data }) => {
	// Your Page component
};

export default withPreviewResolver(PreviewPage, {
	repositoryName: "your-repository-name",
	linkResolver,
});
```

In most cases, you will only need to move your repository name to the function's second argument.

### Update 404 page

In your dedicated unpublished preview page, update the `withUnpublishedPreview()` import to `withPrismicUnpublishedPreview()` and edit the arguments provided to the function. The unpublished preview page is typically created as part of the "Not Found" 404 page at `〜/src/pages/404.js`.

Note that you must import the page template components using their default exports (`import PageTemplate` rather than `import { PageTemplate }`) to ensure that the template is wrapped with `withPrismicPreview()` as is required.

**After**:

```javascript
import * as React from "react";
import {
	componentResolverFromMap,
	withPrismicUnpublishedPreview,
} from "gatsby-plugin-prismic-previews";

// Update the path to your Link Resolver
import { linkResolver } from "../linkResolver";
import BlogPostTemplate from "../templates/BlogPostTemplate";
import PageTemplate from "../templates/PageTemplate";

const NotFoundPage = () => (
	<section>
		<h1>Page not found!</h1>
	</section>
);

export default withPrismicUnpublishedPreview(NotFoundPage, [
	{
		repositoryname: "your-repository-name",
		linkResolver,
		componentResolver: componentResolverFromMap({
			page: PageTemplate,
			blog_post: BlogPostTemplate,
		}),
	},
]);
```

**Before**:

```javascript
import * as React from "react";
import { withUnpublishedPreview } from "gatsby-source-prismic";

import { BlogPostTemplate } from "../templates/BlogPostTemplate";
import { PageTemplate } from "../templates/PageTemplate";

const NotFoundPage = () => (
	<section>
		<h1>Page not found!</h1>
	</section>
);

export default withUnpublishedPreview(NotFoundPage, {
	templateMap: {
		page: PageTemplate,
		blog_post: BlogPostTemplate,
	},
});
```

## Technical reference

Refer to the technical reference of the preview plugin if you'd like to see the in-depth documentation of the plugin and its High Order Components.

- [**null**](https://prismic.io/docs/technical-reference/gatsby-plugin-prismic-previews)<br/>
