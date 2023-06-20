# Define Routes

In this article, you’ll learn how to create routes and generate links for your Gatsby project.

---

## Routing in Gatsby

Gatsby serves pages statically. You can create your page URL routes in different ways:

- Create **dynamic pages** programmatically for your repeatable pages like blog posts, articles, and author pages. Or if your repository has more than one language.
- Create a **single page** manually if your documents are singletons like the homepage, an about us, or a contact page.

The Link Resolver is a function that will help you define the routes of your application. Once you create it and declare it in the plugin options, the URL routes become available in the `url` field of your queries.

Read more about how Gatsby handles routes [in the Gatsby documentation](https://www.gatsbyjs.com/docs/reference/routing/creating-routes/).

## Create a Link Resolver

The Link Resolver will help you build your project URL routes and manage links in field types such as a [Link](https://prismic.io/docs/field#link) or a [Rich Text](https://prismic.io/docs/field#rich-text) in a Gatsby project.

Start by creating a `linkResolver.js` file. Our example resolves page routes for three documents Custom Types (category, product, and page). Adapt it or write your own depending on the routes on your website.

```javascript
exports.linkResolver = (doc) => {
  // URL for a category type
  if (doc.type === "category") {
    return `/category/${doc.uid}`;
  }

  // URL for a product type
  if (doc.type === "product") {
    return `/product/${doc.uid}`;
  }

  // URL for a page type
  if (doc.type === "page") {
    return `/${doc.uid}`;
  }

  // Backup for all other types
  return "/";
};
```

> **Using Amazon S3 or Gatsby Cloud?**
>
> If you are hosting your site with [Gatsby Cloud](https://www.gatsbyjs.com/products/cloud) or [Amazon S3](https://aws.amazon.com/s3), set the **Link Resolver** option with a trailing slash (for example, `/preview/`, not `/preview`) to ensure they send the URL parameters to the preview page.
>
> Other hosts, like [Netlify](https://www.netlify.com), do not require particular configurations.

## Add your Link Resolver to the plugin

After you've created the Link Resolver file, add it to the plugin configuration in the `gatsby-config.js` file. See how we do it in the following example. Remember to update the path to your Link Resolver:

```javascript
// Truncated example gatsby-config.js file

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

module.exports = {
  // ...
  plugins: [
    {
      resolve: "gatsby-source-prismic",
      options: {
        repositoryName: process.env.GATSBY_PRISMIC_REPO_NAME,
        linkResolver: require("./path-to-your-linkResolver").linkResolver,
        // ...
      },
    },
  ],
};
```

## Usage

Now that the Link Resolver is created and registered in the plugin, the routes become available in the queries with the `url` field of the document's metadata to create internal links and URLs.

### URLs

Use the URLs to create dynamic pages. You can use [Gatsby Node APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/) or the [File System Route API](https://www.gatsbyjs.com/docs/reference/routing/file-system-route-api/).

For instance, say we have documents of the type Blog. With the File System Route API, we create a file such as `〜/src/pages/{PrismicBlog.url}.js`. The Link Resolver will create a unique URL path using each document's UID, like so: `/blog/${doc.uid}`.

### Links

To resolve internal links, add the `<PrismicProvider>` with an `internalLinkComponent` prop to the `gatsby-browser.js` and `gatsby-ssr.js`. Learn more in the [Template Links and Content Relationships](https://prismic.io/docs/template-fields-gatsby#links-and-content-relationships) section

##

- **Next article**: [Template Content](./05-template-content.md)
- **Previous article**: [Query Data](./03-fetch-data.md)
