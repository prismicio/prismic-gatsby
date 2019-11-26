# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.0-beta.15](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.14...v3.0.0-beta.15) (2019-11-26)


### Bug Fixes

* ensure error message is an error object ([5a76af4](https://github.com/angeloashmore/gatsby-source-prismic/commit/5a76af445145e48540ed66e1013b4a935f6a87de))
* replace broken link check with isBroken property ([4f6a3a8](https://github.com/angeloashmore/gatsby-source-prismic/commit/4f6a3a83a38896d68c8fd0e449b1296a708443ff))
* update all dependencies ([3914bba](https://github.com/angeloashmore/gatsby-source-prismic/commit/3914bba080895817dc1ca305ebafff18b62deeff))
* **preview:** check for broken_type before trying to get linked document ([f557025](https://github.com/angeloashmore/gatsby-source-prismic/commit/f557025cf8e263cec75c53fa6e3af5e714ca1ef7))

## [3.0.0-beta.14](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.13...v3.0.0-beta.14) (2019-11-11)


### Bug Fixes

* ensure null values skipped on traversal merge ([fe10fb6](https://github.com/angeloashmore/gatsby-source-prismic/commit/fe10fb6))



## [3.0.0-beta.13](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.12...v3.0.0-beta.13) (2019-11-11)


### Bug Fixes

* add tags to PrismicDocument interface ([a5a5eae](https://github.com/angeloashmore/gatsby-source-prismic/commit/a5a5eae))
* handle schemas with no thumbnails properly ([f010fe9](https://github.com/angeloashmore/gatsby-source-prismic/commit/f010fe9))
* use cached images if available ([7787a45](https://github.com/angeloashmore/gatsby-source-prismic/commit/7787a45))


### Features

* don't infer fields ([dd66296](https://github.com/angeloashmore/gatsby-source-prismic/commit/dd66296))



## [3.0.0-beta.12](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.10...v3.0.0-beta.12) (2019-11-11)


### Bug Fixes

* only provide thumbnails field if present ([744914d](https://github.com/angeloashmore/gatsby-source-prismic/commit/744914d))
* restore option defaults ([690fa9b](https://github.com/angeloashmore/gatsby-source-prismic/commit/690fa9b))
* restore thumbnail localFile support under thumbnail key ([d1e2c45](https://github.com/angeloashmore/gatsby-source-prismic/commit/d1e2c45))



## [3.0.0-alpha.1](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2019-05-19)



## [3.0.0-beta.11](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.10...v3.0.0-beta.11) (2019-09-21)


### Bug Fixes

* restore option defaults ([690fa9b](https://github.com/angeloashmore/gatsby-source-prismic/commit/690fa9b))



## [3.0.0-beta.10](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.9...v3.0.0-beta.10) (2019-08-26)


### Bug Fixes

* decode image URL ([f9eba0f](https://github.com/angeloashmore/gatsby-source-prismic/commit/f9eba0f))


### Features

* shareLink implementation and tests ([dbfcf76](https://github.com/angeloashmore/gatsby-source-prismic/commit/dbfcf76))
* shareLink support ([bd910d3](https://github.com/angeloashmore/gatsby-source-prismic/commit/bd910d3))
* shareLink support ([da2b99b](https://github.com/angeloashmore/gatsby-source-prismic/commit/da2b99b))



## [3.0.0-beta.9](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.7...v3.0.0-beta.9) (2019-08-24)


### Bug Fixes

* strengthen plugin options schema ([5010a4e](https://github.com/angeloashmore/gatsby-source-prismic/commit/5010a4e))
* use cloneDeep to prevent mutation of static data ([b77ec93](https://github.com/angeloashmore/gatsby-source-prismic/commit/b77ec93))
* use common validatePluginOptions ([20ff655](https://github.com/angeloashmore/gatsby-source-prismic/commit/20ff655))
* use correct default linkResolver ([bd28a6e](https://github.com/angeloashmore/gatsby-source-prismic/commit/bd28a6e)), closes [#124](https://github.com/angeloashmore/gatsby-source-prismic/issues/124)
