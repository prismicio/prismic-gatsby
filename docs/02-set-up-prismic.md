# Set up Prismic

By the end of this page, you will have a Prismic repository connected to your Gatsby project.

---

> **Prerequisites**
>
> Before you start, you will need a package manager like npm or Yarn installed globally. You'll also need a Gatsby project initiated. If you don't have those, here are some guides we recommend:
>
> - [Install Node.js and NPM on Mac - William Vincent](https://wsvincent.com/install-node-js-npm-mac/)
> - [Install Node.js and NPM on Windows - William Vincent](https://wsvincent.com/install-node-js-npm-windows/)
> - [Learn how Gatsby works](https://www.gatsbyjs.com/docs/tutorial/)

## Create a repository in Prismic

If you don't already have one, create a repository where you will create and manage your content:

[**Create repository**](https://prismic.io/dashboard/new-repository)

Then, add some content to your repository to have something to template in your Gatsby project.

## Create or open your Gatsby project

If you don't already have one, visit the Gatsby docs to learn how to [create a new project](https://www.gatsbyjs.com/docs/tutorial). When you have a project initiated, navigate to your project in your terminal.

## Install the dependencies

Install `gatsby-source-prismic`, `gatsby-plugin-image`, and `@prismicio/react`.

- `gatsby-source-prismic` is the source plugin to fetch the content from your repository.
- The `gatsby-plugin-image` helps you add responsive images to your site and is required to support Gatsby's automatic image optimization component, `<GatsbyImage>`.
- With `@prismicio/react` you can render Rich Text and Links.

**npm**:

```bash
npm install gatsby-source-prismic gatsby-plugin-image @prismicio/react
```

**Yarn**:

```bash
yarn add gatsby-source-prismic gatsby-plugin-image @prismicio/react
```

## Add environment variables

[Environment variables](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/) allow you to store information about your projects, like your repository name or access token. At the root of your project, create an `.env` file. Then add the variables of your Prismic repository. In this example, we set up variables for the following plugin options:

1. `repositoryName`
1. `accessToken`
1. `customTypesApiToken`

Update your environment variable files and add only the ones that apply to your project. Here's an example:

```bash
GATSBY_PRISMIC_REPO_NAME=your-repo-name
PRISMIC_ACCESS_TOKEN=your-access-token
PRISMIC_CUSTOM_TYPES_API_TOKEN=your-custom-types-api-token
```

Environment variables prefixed with `GATSBY_` will become available in [the browser's client-side JavaScript](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/#accessing-environment-variables-in-the-browser). All the others will only be available in the `gatsby-config.js` file.

Once you set this up, you'll be able to access your repository name variable like this: `process.env.GATSBY_PRISMIC_YOUR_VARIABLE_NAME`.

## Configure the plugin

Define the plugin configuration in the `gatsby-config.js` file. The following table describes available plugin options:

| Property                                                                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <code>resolve</code><strong><span class="highlight">string (required)</span></strong><br/>                | <p>The name of the plugin. It must be <span class="codespan">gatsby-source-prismic</span>.</p>                                                                                                                                                                                                                                                                                                       |
| <code>options</code><strong><span class="highlight">object (required)</span></strong><br/>                | <p>Property that holds the plugin configuration.</p>                                                                                                                                                                                                                                                                                                                                                 |
| <code>options.repositoryName</code><strong><span class="highlight">string (required)</span></strong><br/> | <p>The name of your Prismic repository. If your URL is <span class="codespan">https://my-cool-website.prismic.io/api/v2</span>, your repo name is <span class="codespan">my-cool-website</span>.</p>                                                                                                                                                                                                 |
| <code>options.accessToken</code><strong><span class="highlight">string</span></strong><br/>               | <p>The access token for private APIs. Only needed if the API of <a href="https://prismic.io/docs/access-token">your repository is private</a>.</p>                                                                                                                                                                                                                                                   |
| <code>options.customTypesApiToken</code><strong><span class="highlight">string</span></strong><br/>       | <p>An API token for your Prismic repository that allows your Custom Type schemas to automatically be fetched from <a href="https://prismic.io/docs/custom-types-api">the Custom Types API</a>.</p>                                                                                                                                                                                                   |
| <code>options.routes</code><strong><span class="highlight">array of objects</span></strong><br/>          | <p>An array of <a href="https://prismic.io/docs/route-resolver">Route Resolver</a> objects to resolve document URLs. This option can be used with the <a href="./technical-reference-gatsby-source-prismic-v5.md#configure-the-plugin" target="_blank" rel="noopener noreferrer"><span class="codespan">linkResolver</span> option</a> (Link Resolver will take priority if it returns a value).</p> |

Read the plugin's [technical reference](./technical-reference-gatsby-source-prismic-v5.md) to learn about all the available plugin options.

This example plugin configuration shows basic setup options:

```javascript
require("dotenv").config();

module.exports = {
	plugins: [
		// ...
		"gatsby-plugin-image",
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
	],
};
```

## Add the Custom Type schemas

The `customTypesApiToken` option fetches the Custom Type schemas from your repository.

Once you enable the Custom Types API on your repository, create a bearer [permanent access token](https://prismic.io/docs/technologies/custom-types-api#permanent-token-recommended) to authenticate your request. Then add it to an environment variable and pass it to the plugin configuration:

```auto
customTypesApiToken:  process.env.PRISMIC_CUSTOM_TYPES_API_TOKEN,
```

Your Custom Types will be automatically retrieved using [the Custom Types API](https://prismic.io/docs/custom-types-api) and loaded into Gatsby.

Now you're ready to query and template data with the source plugin. Learn how to query content from the API on the next page.

- **Next article**: [Query Data](./03-fetch-data.md)
- **Previous article**: [Overview](./01-overview.md)
