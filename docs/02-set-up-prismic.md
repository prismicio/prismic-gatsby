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
- With `@prismicio/react,` you can render Rich Text and Links.

**npm**:

```bash
npm install gatsby-source-prismic gatsby-plugin-image @prismicio/react
```

**Yarn**:

```bash
yarn add gatsby-source-prismic gatsby-plugin-image @prismicio/react
```

## Add environment variables

[Environment variables](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/) allow you to store information about your projects, like your repository name or access token. At the root of your project, create two files:

- `.env.development`
- `.env.production`

Then, add the variables on each file to match your Prismic repository's information. In this example, we set up all variables for the following plugin options:

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

| Property                                                                                                  | Description                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <code>resolve</code><strong><span class="highlight">string (required)</span></strong><br/>                | <p>The name of the plugin. It must be &#39;gatsby-source-prismic&#39;.</p>                                                                                                                                                                                      |
| <code>options</code><strong><span class="highlight">object (required)</span></strong><br/>                | <p>Property that holds the plugin configuration.</p>                                                                                                                                                                                                            |
| <code>options.repositoryName</code><strong><span class="highlight">string (required)</span></strong><br/> | <p>The name of your Prismic repository. If your URL is &#39;https://my-cool-website.prismic.io/api/v2&#39;, your repo name is &#39;my-cool-website&#39;.</p>                                                                                                    |
| <code>options.accessToken</code><strong><span class="highlight">string</span></strong><br/>               | <p>The access token for private APIs. Only needed if the API of <a href="https://prismic.io/docs/access-token">your repository is private</a>.</p>                                                                                                              |
| <code>options.customTypesApiToken</code><strong><span class="highlight">string</span></strong><br/>       | <p>An API token for your Prismic repository that allows your Custom Type schemas to automatically be fetched from <a href="https://prismic.io/docs/custom-types-api">the Custom Types API</a>.</p>                                                              |
| <code>options.routes</code><strong><span class="highlight">array of objects</span></strong><br/>          | <p>An array of <a href="https://prismic.io/docs/route-resolver">Route Resolver</a> objects to resolve document URLs. This option can be used with the linkResolver option (Link Resolver will take priority if both are used for a specific document type).</p> |
| <code>options.linkResolver</code><strong><span class="highlight">function</span></strong><br/>            | <p>A <a href="https://prismic.io/docs/route-resolver">Link Resolver</a> to process links in your documents. The Link Resolver processes links in your content.</p>                                                                                              |
| <code>options.typePrefix</code><strong><span class="highlight">string</span></strong><br/>                | <p>A prefix that is used for all GraphQL types for your Prismic repository. This is required If you are sourcing from multiple repositories, and each plugin should have a unique typePrefix to avoid type conflicts.</p>                                       |

Read the plugin's [technical reference](https://prismic.io/docs/technical-reference/gatsby-source-prismic?version={doc.data.version_id}) to learn about all the available plugin options.

> **Dashes in Custom Type names**
>
> If your Custom Type names have dashes or hyphens (`-`) you need to wrap them in 'single quotes' in the `options.schemas` configuration. Otherwise the schema won't be valid. For example: If your Custom Type name is `home-page`, you'll need to declare it like this:
>
> ```
> 'home-page': require('./custom_types/home-page.json')
> ```

This example plugin configuration, shows basic setup options:

```javascript
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const routes = [
  {
    type: "article",
    path: "/articles/:uid",
  },
  {
    type: "page",
    path: "/:uid",
  },
];

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
        routes,
      },
    },
  ],
};
```

## Add the Custom Type schemas

The plugin requires all the Custom Types from your repository. This is done automatically using the `customTypesApiToken` option, which fetches the schemas from your repository.

Once you enable the Custom Types API on your repository, create a `bearer` [permanent access token](https://prismic.io/docs/technologies/custom-types-api#permanent-token-recommended) to authenticate your request. Then add it to an environment variable and pass it to the plugin configuration:

```auto
customTypesApiToken:  process.env.PRISMIC_CUSTOM_TYPES_API_TOKEN,
```

Your Custom Types will be automatically retrieved using [the Custom Types API](https://prismic.io/docs/custom-types-api) and loaded into Gatsby. Please note that if you delete one of the Custom Types, you need to declare it as an empty object in the plugin options. Even when using the `customTypesApiToken` option:

```javascript
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-prismic",
      options: {
        customTypesApiToken: process.env.PRISMIC_CUSTOM_TYPES_API_TOKEN,
        schemas: {
          my_deleted_schema: {},
        },
      },
    },
  ],
};
```

Your project is ready to query and template data with the source plugin. You'll learn how to query content from the API on the next page.

- **Next article**: [Query Data](./03-fetch-data.md)
- **Previous article**: [Overview](./01-overview.md)
