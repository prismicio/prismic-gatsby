# Define Routes

In this article, you’ll learn how to create routes and generate links for your Gatsby project.

---

## Routing in Gatsby

Gatsby serves pages statically. You can create your page URL routes in different ways:

- Create **dynamic pages** programmatically for your repeatable pages like blog posts, articles, and author pages. Or if your repository has more than one language.
- Create a **single page** manually if your documents are singletons like the homepage, an about us, or a contact page.

The routes option of your plugin configuration populates URLs for internal links and documents in Prismic API responses. Learn more about [Gatsby routing](https://www.gatsbyjs.com/docs/reference/routing/creating-routes/).

## Create a Route Resolver

The Route Resolver will help you build your project URL routes and manage links in field types such as a [Link](https://prismic.io/docs/field#link) or a [Rich Text](https://prismic.io/docs/field#rich-text) in a Gatsby project.

Create a routes array in the `routes` option of the `gatsby-config.js` file. Our example resolves page routes for three Custom Types: the homepage, blog posts, and pages. Adapt it or write your own, depending on the routes on your website.

Also, add the `routes` option to the `gatsby-plugin-prismic-previews` plugin if you have it configured.

```javascript
require("dotenv").config();

module.exports = {
	plugins: [
		// ...
		{
			resolve: "gatsby-source-prismic",
			/**
			 * @type {import("gatsby-source-prismic").PluginOptions}
			 */
			options: {
				repositoryName: process.env.GATSBY_PRISMIC_REPO_NAME,
				accessToken: process.env.PRISMIC_ACCESS_TOKEN,
				customTypesApiToken: process.env.PRISMIC_CUSTOM_TYPES_API_TOKEN,
				routes: [
					{
						type: "page",
						uid: "homepage",
						path: "/lang?",
					},
					{
						type: "page",
						path: "/:lang?/:uid",
					},
					{
						type: "blog_post",
						locale: "en-us",
						path: "/blog/:uid",
					},
				],
			},
		},
	],
};
```

> **Using Amazon S3 or Gatsby Cloud?**
>
> If your site uses `gatsby-plugin-prismic-previews` and is hosted on [Gatsby Cloud](https://www.gatsbyjs.com/products/cloud) or [Amazon S3](https://aws.amazon.com/s3), ensure the **Preview Route** URL has a trailing slash (for example, `/preview/`, not `/preview`). The trailing slash guarantees that Gatsby Cloud or Amazon S3 sends the required URL parameters to the preview page.
>
> Other hosts, like [Netlify](https://www.netlify.com), do not require particular configurations.

## Usage

Now that the Route Resolver is created and registered in the plugin, the routes become available in the queries with the `url` field of the document's metadata to create internal links and URLs.

### URLs

Use the URLs to create dynamic pages. You can use [Gatsby Node APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/) or the [File System Route API](https://www.gatsbyjs.com/docs/reference/routing/file-system-route-api/).

For instance, say we have documents of the type Blog. With the File System Route API, we create a file such as `/src/pages/{PrismicBlog.url}.js`. The Route Resolver will create a unique URL path using each document's UID, like so: `/blog/${doc.uid}`.

### Links

The `url` field is also available on Link and Content Relationship fields. A Content Relationship field pointed to a Page document, for example, will provide the page's URL using the `url` field. This URL can be used to link to pages.

Internal links must be linked using [Gatsby's `<Link>` component](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-link/). You can use `@prismicio/react`'s [`<PrismicLink>` component](https://prismic.io/docs/technical-reference/prismicio-react#prismiclink) to automatically use Gatsby's `<Link>` component by configuring [`<PrismicProvider>`'s `internalLinkComponent` option](https://prismic.io/docs/technical-reference/prismicio-react#prismicprovider) in `gatsby-browser.js` and `gatsby-ssr.js`.

Learn more in the [Template Links and Content Relationships](https://prismic.io/docs/template-fields-gatsby#links-and-content-relationships) section.

- **Next article**: [Template Content](./05-template-content.md)
- **Previous article**: [Query Data](./03-fetch-data.md)
