# Get Started with Gatsby Cloud

On this page, you'll learn how to set up and deploy your project on Gatsby Cloud with your Prismic repository.

---

> **🕙 Before Reading**
>
> This guide requires you to have:
>
> - A [Prismic](https://prismic.io/) account
> - A [GitHub](https://github.com/join) account
> - A [Gatsby Cloud](https://www.gatsbyjs.com/dashboard/signup/) account
>
> You can create them while following the steps of this guide.

## What is Gatsby Cloud?

[Gatsby Cloud](https://www.gatsbyjs.com/products/cloud/) is a platform to build, serve, and preview Gatsby projects. Let's compare its features with other services to understand how Gatsby Cloud fits into a project's stack:

- **Hosting**: Serves your site to your visitors. Gatsby Cloud Hosting is like Netlify, Vercel, or Amazon S3.
- **Build**: A continuous integration service to build your site on content changes. Gatsby Cloud Builds are like Netlify Builds.
- **Preview**: A staging site to preview your draft documents before you publish. Gatsby Cloud Previews are like [Prismic Previews](https://prismic.io/docs/core-concepts/previews). When changes are published in Prismic, Gatsby Cloud will rebuild your site.
- **Functions**: Serves your site's API routes if included in the project. Gatsby Cloud Functions is like Netlify Functions.

## Goals of this guide

After completing this guide, you will be able to preview content changes and rebuild your project.

Preview content changes by following these steps:

1. Save and publish content changes to a specific Release in Prismic.
1. Gatsby Cloud updates a preview version of your site.
1. Click the Preview button in Prismic to open the preview site.

When the changes are ready to be published, you can deploy your changes by following these steps:

1. Save and publish content changes for a document in Prismic.
1. Gatsby Cloud rebuilds the site.
1. The site is deployed with the new content.

---

## 1. Set up your Prismic repository

Complete the following steps in your Prismic repository.

### Create a Release

1. Open your [Prismic Dashboard](https://prismic.io/dashboard/) and select your repository.
1. At the top of the page, click the **Planned** tab.
1. Create a new [Release](https://prismic.io/docs/core-concepts/draft-plan-and-schedule-content#releases) named **Gatsby Cloud Preview**
1. Add or edit documents and save them to the newly created Release ([learn how to save to a Release](https://prismic.io/docs/core-concepts/draft-plan-and-schedule-content#add-a-new-or-updated-document-to-a-release)).

### Find and save the Release ID

You will need the Release's ID to set up Gatsby Cloud later in the guide.

You can find the Release ID in the API Browser of your repository. Go to the following URL, but replace `your-repository-name` with the name of your repository:

```plaintext
https://your-repository-name.prismic.io/api/v2
```

> **✅ If you receive a pop-up asking for access, accept it.**
>
> Then you will be redirected to the API Browser.

Click the unlock icon and select the corresponding ref for the **Gatsby Cloud Preview** Release from the dropdown menu. Then you'll see the release ID at the right.

![Release ID](https://images.prismic.io/prismicio-docs-v3/a03c4985-c199-429d-a5cc-b089727708e9_Dec-08-2020+18-03-36.gif?auto=compress,format&rect=0,0,956,472&w=960&h=474)

> **📌 Hold on to this Release ID**
>
> You'll use it later when adding the environment variables in Gatsby Cloud.

### Create API tokens

Next, [generate an access token](https://prismic.io/docs/access-token). In this case, you'll need two tokens: one for **builds** and one for **previews.**

- **Builds**: After generating the first token, you should see the **Access to master** token. You'll use this token for the Gatsby Cloud Builds server:

![Access to builds token](https://images.prismic.io/prismicio-docs-v3/4df6af80-7045-49c4-87c5-56a4d67c3e8a_image.png?auto=compress,format&rect=0,0,952,260&w=960&h=262)

- **Previews:** Now, create a new token below. Select **Access to Master + Releases** and then click _Add a token_. You'll use this token for the Gatsby Cloud Preview server.

![Access to previews token](https://images.prismic.io/prismicio-docs-v3/8405a5f6-5d0d-4e59-bda6-3eafedc78dcf_image+%281%29.png?auto=compress,format&rect=0,0,952,256&w=960&h=258)

Set these tokens in one of two places:

- Open the settings of your Gatsby Cloud Dashboard. Then add the tokens in the **Environment variables**.
- Or, if you prefer, you can create an `.env` file in your project's root and add them there. The source plugin settings from the `gatsby-config.js` file will consume these variables. If you set it up like this, Gatsby Cloud will automatically read these values when you set up your site.

We'll guide you through configuring these variables in Gatsby Cloud further below in this article. You can learn more about [managing environment variables in Gatsby's documentation](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/).

## 2. Set up your project code

Complete the following steps in your Gatsby project's code.

### Install the plugins

Install and configure the required plugins to build and preview your site. Follow the main installation guides for each one:

- [gatsby-plugin-gatsby-cloud](https://www.gatsbyjs.com/plugins/gatsby-plugin-gatsby-cloud/): Generates files specific to Gatsby Cloud. For example, redirects are converted with [createRedirect](https://www.gatsbyjs.com/docs/reference/config-files/actions/#createRedirect) with `gatsby-node.js` so that Gatsby Cloud can manage them.
- [gatsby-source-prismic](./02-set-up-prismic.md): The source plugin to retrieve data from your Prismic repository.

> **\*required releaseID field**
>
> Make sure to add the `releaseID` to the plugin options in the `gatsby-config.js` file when you configure the `gatsby-source-prismic` plugin.

- [gatsby-plugin-prismic-previews](./06-preview-drafts.md): This plugin allows you to Integrate live Prismic Previews*\*\* \*\*\_into your Gatsby*\*\* \*\*\_project.

> **Preview setup**
>
> When setting up `gatsby-plugin-prismic-previews`, start at "**2. Configure the preview plugin"** and stop after the "[Add a preview resolver page](https://prismic.io/docs/technologies/previews-gatsby#2.-add-a-preview-resolver-page)" step.

### Push your project to Github

[Sign up or log in to GitHub](https://github.com/login) and [push your project to a new repository](https://docs.github.com/en/free-pro-team@latest/desktop/contributing-and-collaborating-using-github-desktop/pushing-changes-to-github). We'll use this repository for the Gatsby Cloud integration.

## 3. Set up Gatsby Cloud

The following steps will take place on Gatsby Cloud.

### Configure Gatsby Cloud

Sign in to Gatsby Cloud using the [Login with GitHub](https://www.gatsbyjs.com/dashboard/signup/) option. It'll ask you to authorize the Gatsby Cloud app with your GitHub account. If you need access to one or more repositories, you can click **Request access** now or later when creating an instance.

### Add a site

Once signed in, follow the following steps:

> **💡 Repositories must contain one Gatsby project**
>
> Repositories must contain one Gatsby project configured at their root to be enabled. Gatsby Cloud works best with Gatsby version 2.20.16 and higher.

1. **Import from a GitHub repository:** Once logged in, click _+Add a site_ and select _Import from a GitHub repository_.
1. **Select Git as the provider.**
1. **Pick your Gatsby site from your list of GitHub repositories**. Then\*\* \*\*select the branch where you pushed your project, usually named `main`. Click _Next_.
1. Click\*\* \*\*_Skip this step_ to configure Prismic manually.
1. Click\*\* \*\*_Create site._ It will create your instance in Gatsby Cloud.

> **💡 If you don’t see your site**
>
> If you don’t see your site, it might be because it belongs to a GitHub organization rather than your account. You can connect to a new GitHub organization.

### Add environment variables

Environment variables are used in Gatsby Cloud to authorize your site when pulling content from Prismic.

Gatsby Cloud will automatically detect your environment variables in your `gatsby-config.js`. However, consider adding any additional variables that automatic detection may have missed.

To edit your site's environment variables on Gatsby Cloud, navigate to the following page:

1. Open your site's **Dashboard**
1. Select the **Site Settings** tab under your site's name
1. In the sidebar under General, navigate to **Environment variables**

Once there, add the following variables.

**Under the Build variables tab**:

- `PRISMIC_REPO_NAME`: Your repository name.
- `PRISMIC_API_KEY`: The [token you set up](https://prismic.io/docs/technologies/prismic-gatsby-cloud#create-api-tokens) in your Prismic repository for builds.

**Under the Preview variables tab**:

- `PRISMIC_REPO_NAME`: Your repository name.
- `PRISMIC_API_KEY`: The [token you set up](https://prismic.io/docs/technologies/prismic-gatsby-cloud#create-api-tokens) in your Prismic repository for previews.
- `PRISMIC_RELEASE_ID`: The Release ID [you previously saved](https://prismic.io/docs/technologies/prismic-gatsby-cloud#find-and-save-the-release-id-for-later).

## 4. Set up webhooks

Use Webhooks to notify Gatsby Cloud when the content in Prismic changes.

### Webhook for previews

In your Gatsby Cloud site dashboard, navigate to the **Site Settings** tab.

Scroll down to **Preview Webhook** and copy the URL listed in the box.<br/>

![Preview Webhook](https://images.prismic.io/prismicio-docs-v3/c0873da0-3a45-4f0b-982b-0bdc721531e2_previewwebhook.png?auto=compress,format&rect=0,0,1761,488&w=960&h=266)

Next, add the webhook to your Prismic repository.

1. In your Prismic repository, navigate to **Settings > Webhooks**.
1. Click the **Create a webhook** button.
1. Name the webhook "Gatsby Cloud Preview."
1. Paste the Preview webhook URL [copied from Gatsby Cloud](https://prismic.io/docs/technologies/prismic-gatsby-cloud#webhook-for-previews) into the URL field.
1. Ensure all checkboxes under **Triggers > Releases** are _checked_.
1. Click the **Add this webhook** button.

### Webhook for Builds

Back in your Gatsby Cloud site dashboard, navigate the **Site Settings** tab.

Scroll down to **Builds Webhook** and copy the URL listed in the box.

![Builds Webhook](https://images.prismic.io/prismicio-docs-v3/e96f4f44-4cd4-4ecb-974f-310b310c0f7d_buildwebhook.png?auto=compress,format&rect=0,0,1768,475&w=960&h=258)

Next, add the webhook to your Prismic repository. The process is the same as the webhook for previews but with a different URL.

1. In your Prismic repository, navigate to **Settings > Webhooks**.
1. Click the **Create a webhook** button.
1. Name the webhook "Gatsby Cloud Builds."
1. Paste the Builds webhook URL [copied from Gatsby Cloud](https://prismic.io/docs/technologies/prismic-gatsby-cloud#webhook-for-builds) into the URL field.
1. Ensure all checkboxes under **Triggers > Releases** are _unchecked_.
1. Click the **Add this webhook** button.

Now the production build will automatically update when you publish changes in Prismic.

## 5. Enable previews in your repository

Navigate to your Gatsby Cloud dashboard. Adjacent to the **Site Settings** tab, select the **CMS Preview** tab on the far right.

Copy the URL that appears in the middle of the page (it should start with "preview-").

![Preview URL](https://images.prismic.io/prismicio-docs-v3/8ff13ed6-2b2a-4511-967a-74d75eca33de_imagef3.png?auto=compress,format&rect=0,0,1480,324&w=960&h=210)

Next, set up your Prismic repository for the Preview URL.

1. In your Prismic repository, navigate to **Settings** and select **Previews** in the sidebar.
1. Click the **Create a Preview** button.

Fill out the form with the following values:

- **Site Name**: "Gatsby Cloud Preview"
- **Domain for your application**: Paste the CMS Preview URL copied from Gatsby Cloud.
- **Preview Route**: `/preview/`.

![Create a preview](https://images.prismic.io/prismicio-docs-v3/34166318-1850-4491-9a4e-4d7bf760fccd_image.png?auto=compress,format&rect=0,0,1238,854&w=960&h=662)

That's it. Now your Gatsby Cloud integration is ready to rebuild your site when you publish content in Prismic. And your Prismic repository has a dedicated Prismic Release to [preview content before publishing](https://prismic.io/docs/core-concepts/previews), plus you can share a preview URL with your team.
