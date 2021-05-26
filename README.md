> **You are viewing the Beta branch of the Gatsby + Prismic integration**
>
> A public beta is currently in progress for `gatsby-source-prismic` V4 and the
> new `gatsby-plugin-prismic-previews`.
>
> If you're starting a new project or have the ability to upgrade an existing
> project, please try out the Beta packages.
>
> See the
> [**Migrating from V3 to V4**](https://github.com/angeloashmore/gatsby-source-prismic/blob/beta/packages/gatsby-source-prismic/docs/migrating-from-v3-to-v4.md)
> guide for more information.

<div align="center">
  <br/>
  <div>
    <img width="200" height="200" src="media/gatsby-plus-prismic.svg" alt="Gatsby + Prismic" />
  </div>
</div>

# Gatsby + Prismic

Build best-in-class static websites using [Gatsby][gatsby] and
[Prismic][prismic].

**[Gatsby][gatsby] is an open-source frontend framework** for creating
integrated, blazing fast websites and apps.

**[Prismic][prismic] is a content management system** that lets you choose your
technology, framework, and language and then easily manage your content.

## Getting Started

If you are new to Gatsby, you can start by going through
[Gatsby's in-depth tutorial on creating a site](https://www.gatsbyjs.com/tutorial/).

Or if you want to dive straight into some code and see an example site using
Prismic, you can check out
[Prismic's example blog repository](https://github.com/prismicio/gatsby-blog).

## Documentation

For full documentation, see each plugin's package.

- [**gatsby-source-prismic**](./packages/gatsby-source-prismic): Gatsby source
  plugin for building websites using Prismic as a data source
- [**gatsby-plugin-prismic-previews**](./packages/gatsby-plugin-prismic-previews):
  Gatsby plugin for integrating client-side Prismic Previews

## How to Contribute

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd
love to have you as part of the Gatsby + Prismic community!

**Reporting a bug**: [Open an issue][new-issue] explaining your site's setup and
the bug you're encountering.

**Suggest an improvement**: [Open an issue][new-issue] explaining your
improvement or feature so we can discuss and learn more.

**Submitting code changes**: For small fixes (1-10 lines), feel free to [open a
PR][pull-requests] with a description of your changes. For large changes, please
first [open an issue][new-issue] so we can discuss if and how the changes should
be implemented.

### A note on how this repository is organized

This repository is a monorepo managed using Yarn workspaces. This means there
are [multiple packages](./packages) managed in this codebase, even though we
publish them to NPM as separate packages.

[gatsby]: https://gatsbyjs.com/
[prismic]: https://prismic.io/
[new-issue]: https://github.com/angeloashmore/gatsby-source-prismic/issues/new
[pull-requests]: https://github.com/angeloashmore/gatsby-source-prismic/pulls
