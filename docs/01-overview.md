# Gatsby

This guide will show you how to add Prismic to a Gatsby project in about twenty minutes. If you want to jump right in, proceed to the setup step:

- [**Set up Prismic in a Gatsby Project**](./02-set-up-prismic.md)<br/>This article explains how to install and configure a Gatsby project.

Prismic has an unlimited free tier for projects with one user. To learn more, see our pricing page:

## What skills will I need?

If you're a developer building a project with Prismic and Gatsby, we recommend that you already have a basic knowledge of React, CSS, and Gatsby.

If a developer sets up Prismic for you, you won't need any technical knowledge — anyone can use Prismic.

## Gatsby plugins and Prismic

Gatsby is a framework that offers a wide variety of plugins to customize and extend your application capabilities. Prismic has the following integration plugins:

- [`gatsby-source-prismic`](./technical-reference-gatsby-source-prismic-v5.md): This source plugin helps you to pull data from Prismic.
- [`gatsby-plugin-prismic-previews`](./technical-reference-gatsby-plugin-prismic-previews-v5.md): This plugin works together with the source plugin to integrate [Prismic Previews](./06-preview-drafts.md) into a Gatsby site.

> **Are you using `gatsby-source-prismic-graphql`?**
>
> We've moved away from supporting and documenting this plugin. Read our blog post if you're interested in the details about this process: [Gatsby-Prismic plugins: what's going on](https://prismic.io/blog/gatsby-prismic-plugins)?
>
> Follow the [migration guide](./migration-guide-from-gatsby-source-prismic-graphql.md) to `gatsby-source-prismic`.

## Steps to get started

These guides will walk you through every step, from creating content and adding it to your project to deploying it and seeing it live.

- [**Set up Prismic**](./02-set-up-prismic.md)<br/>Create a Repository and install the plugin in your project. You'll have connected your project to the source plugin and a Prismic repository by the end of this page.

- [**Query Data**](./03-fetch-data.md)<br/>Retrieve data from your Prismic API to your Gatsby app.

- [**Define Routes**](./04-define-routes.md)<br/>On this page, you'll learn how to define the URL structure of your website and create internal links.

- [**Template Content**](./05-template-content.md)<br/>In this step, you'll learn how to render the content from your Prismic API in your application.

- [**Preview Drafts**](./06-preview-drafts.md)<br/>Learn how to preview drafts before you publish them.

- [**Deploy your App**](./07-deploy.md)<br/>Here you'll learn how to deploy your site online.

- **Next article**: [Set up Prismic](./02-set-up-prismic.md)
