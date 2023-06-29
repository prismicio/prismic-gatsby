# gatsby-source-prismic

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![Conventional Commits][conventional-commits-src]][conventional-commits-href]
[![License][license-src]][license-href]

Source plugin for pulling data into [Gatsby][gatsby] from [Prismic][prismic] repositories.

- 🍱 &nbsp;Supports [all field types][prismic-fields] including [Slices][prismic-slices], [Rich Text][prismic-rich-text], and [Content Relationships][prismic-link]
- 🖼 &nbsp;Automatic image optimization with [gatsby-plugin-image][gatsby-plugin-image] using Prismic's [Imgix] integration or [`gatsby-transformer-sharp`][gatsby-transformer-sharp]
- 👁 &nbsp;Live, client-side [Prismic previews][prismic-previews] using [gatsby-plugin-prismic-previews][gatsby-plugin-prismic-previews]

## Install

```bash
npm install gatsby-source-prismic gatsby-plugin-image
```

## Documentation

To discover what's new on this package check out [the changelog][changelog]. For full documentation, visit the [official Prismic documentation][prismic-docs].

## Contributing

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd love to have you as part of the Prismic developer community!

**Asking a question**: [Open a new topic][forum-question] on our community forum explaining what you want to achieve / your question. Our support team will get back to you shortly.

**Reporting a bug**: [Open an issue][repo-bug-report] explaining your application's setup and the bug you're encountering.

**Suggesting an improvement**: [Open an issue][repo-feature-request] explaining your improvement or feature so we can discuss and learn more.

**Submitting code changes**: For small fixes, feel free to [open a pull request][repo-pull-requests] with a description of your changes. For large changes, please first [open an issue][repo-feature-request] so we can discuss if and how the changes should be implemented.

For more clarity on this project and its structure you can also check out the detailed [CONTRIBUTING.md][contributing] document.

## License

```
Copyright 2013-2022 Prismic <contact@prismic.io> (https://prismic.io)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

<!-- Links -->

[prismic]: https://prismic.io
[gatsby]: https://www.gatsbyjs.com/
[prismic-slices]: https://prismic.io/docs/core-concepts/slices
[gatsby-plugin-image]: https://www.gatsbyjs.com/plugins/gatsby-plugin-image/
[gatsby-plugin-prismic-previews]: https://github.com/prismicio-community/prismic-gatsby-early-access/tree/main/packages/gatsby-plugin-prismic-previews
[gatsby-transformer-sharp]: https://www.gatsbyjs.com/plugins/gatsby-transformer-sharp/
[imgix]: https://imgix.com/
[prismic-previews]: https://prismic.io/docs/core-concepts/preview-setup
[prismic-fields]: https://prismic.io/docs/core-concepts#fields
[prismic-rich-text]: https://prismic.io/docs/core-concepts/rich-text-title
[prismic-link]: https://prismic.io/docs/core-concepts/link-content-relationship

<!-- TODO: Replace link with a more useful one if available -->

[prismic-docs]: https://prismic.io/docs/technologies/gatsby
[changelog]: https://github.com/prismicio-community/prismic-gatsby-early-access/blob/main/packages/gatsby-source-prismic/CHANGELOG.md
[contributing]: https://github.com/prismicio-community/prismic-gatsby-early-access/blob/main/CONTRIBUTING.md

<!-- TODO: Replace link with a more useful one if available -->

[forum-question]: https://community.prismic.io
[repo-bug-report]: https://github.com/prismicio-community/prismic-gatsby-early-access/issues/new?assignees=&labels=bug&template=bug_report.md&title=
[repo-feature-request]: https://github.com/prismicio-community/prismic-gatsby-early-access/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=
[repo-pull-requests]: https://github.com/prismicio-community/prismic-gatsby-early-access/pulls

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/gatsby-source-prismic/latest.svg
[npm-version-href]: https://npmjs.com/package/gatsby-source-prismic
[npm-downloads-src]: https://img.shields.io/npm/dm/gatsby-source-prismic.svg
[npm-downloads-href]: https://npmjs.com/package/gatsby-source-prismic
[github-actions-ci-src]: https://github.com/prismicio-community/prismic-gatsby-early-access/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/prismicio-community/prismic-gatsby-early-access/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/github/prismicio-community/prismic-gatsby-early-access.svg
[codecov-href]: https://codecov.io/gh/prismicio-community/prismic-gatsby-early-access
[conventional-commits-src]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[conventional-commits-href]: https://conventionalcommits.org
[license-src]: https://img.shields.io/npm/l/gatsby-source-prismic.svg
[license-href]: https://npmjs.com/package/gatsby-source-prismic
