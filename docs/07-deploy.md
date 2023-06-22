# Deploy

Resources to help you deploy your Prismic and Gatsby project to one of the many providers that support static sites.

---

## Gatsby Cloud

You can deploy and generate automatic builds with [Gatsby Cloud](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/deploying-to-gatsby-cloud/). Read our guide to start integrating Gatsby Cloud into your project:

- [**Gatsby Cloud and Prismic ⟶**](./08-use-gatsby-cloud.md)<br/>On this page, you'll learn how to setup and deploy your project on Gatsby Cloud while being fully integrated with your Prismic repository.

## Netlify

### Deployment

First, [make an account or log in](https://app.netlify.com/signup), then push your project code to a new GitHub repo and log in with that same GitHub account. Click on *New site from Git*, select your repository and continue. You should land on step 3, **"Build options, and deploy!"**, here are the settings you need:

| Property                                | Description                                  |
| --------------------------------------- | -------------------------------------------- |
| <strong>Branch to deploy</strong><br/>  | <p>main, or which-ever branch you prefer</p> |
| <strong>Build command</strong><br/>     | <p><strong>npm run build</strong></p>        |
| <strong>Publish directory</strong><br/> | <p>dist</p>                                  |

That's it; your website should now be live!

### Automatic builds

Start by creating your [Build hooks](https://docs.netlify.com/configure-builds/build-hooks/) endpoint on Netlify. In your Netlify site dashboard at *Settings > Build & deploy > Continuous deployment > Build hooks*. Generate a build hook URL; it'll be similar to the one below:

```plaintext
https://api.netlify.com/build_hooks/XXXXXXXXXXXXXXX
```

Now [create a Webhook trigger](https://user-guides.prismic.io/en/articles/790505-webhooks) in Prismic. In your Prismic repository's *Settings > Webhooks,* create a Webhook trigger and add the URL you just copied from Netlify, and that's all you need to add to make your project detect changes and rebuild!

### Variables in Netlify

When configuring environment variables with Gatsby + Netlify, you can prefix them with `GATSBY_` if you need to make it public in the browser to be used in your client JavaScript. (exception `NODE_ENV`). Read more about [Gatsby's environment variables](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/).

```bash
GATSBY_PRISMIC_REPOSITORY_NAME=your-repo-name
```

## Other alternatives

You can also check out the [recommended Gatsby services for deploying](https://www.gatsbyjs.com/docs/deploying-and-hosting/) if you'd like to see more options.

- **Next article**: [Gatsby Cloud](./08-use-gatsby-cloud.md)
- **Previous article**: [Preview Drafts](./06-preview-drafts.md)
