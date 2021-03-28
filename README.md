<div align="center">
  <div>
    <img width="200" height="200" src="media/gatsby-plus-prismic.svg" alt="Gatsby + Prismic" />
  </div>
</div>

# Gatsby + Prismic

Build best-in-class static websites using [Gatsby](https://gatsbyjs.com/) and
[Prismic](https://prismic.io/).

**Gatsby is an open-source frontend framework** for creating integrated, blazing
fast websites and apps.

**Prismic is a content management system** that lets you choose your technology,
framework, and language and then easily manage your content.

## Getting Started

If you are new to Gatsby, you can start by going through
[Gatsby's in-depth tutorial on creating a site](https://www.gatsbyjs.com/tutorial/).

Or if you want to dive straight into some code and see an example site, you can
check out
[Prismic's example blog repository](https://github.com/prismicio/gatsby-blog).

# Documentation

For full documentation, see each plugin's package.

- [**gatsby-source-prismic**](./packages/gatsby-source-prismic): Gatsby source
  plugin for building websites using prismic.io as a data source
- [**gatsby-plugin-prismic-previews**](./packages/gatsby-plugin-prismic-previews):
  Gatsby plugin for integrating client-side Prismic Previews

# How to Contribute

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd
love to have you as part of the Gatsby + Prismic community!

**Reporting a bug**: [Open an issue](./issues/new) explaining your site's setup
and the bug your're encountering.

**Suggest an improvement**: [Open an issue](./issues/new) explaining your
improvement or feature so we can discuss and learn more.

**Submitting code changes**: For small fixes (1-10 lines), feel free to open a
PR with a description of your changes. For large changes, please first
[open an issue](./issues/new) so we can discuss if and how the changes should be
implemented.

## A note on how this repository is organized

This repository is a monorepo managed using Yarn workspaces. This means there
are [multiple packages](./packages) managed in this codebase, even though we
publish them to NPM as separate packages.
