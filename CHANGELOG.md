# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.0](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.26...v3.0.0) (2020-03-11)


### Bug Fixes

* upgrade dependencies ([ac4b9d2](https://github.com/angeloashmore/gatsby-source-prismic/commit/ac4b9d2344c17d1cf4f150e369b52b98a8f40fe6))

## [3.0.0-beta.26](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.25...v3.0.0-beta.26) (2020-03-11)


### Features

* support Boolean fields ([8c4ca4c](https://github.com/angeloashmore/gatsby-source-prismic/commit/8c4ca4ce6a19065f6fb0c825c1c68efbde6d9841))

## [3.0.0-beta.25](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.24...v3.0.0-beta.25) (2020-03-01)


### Bug Fixes

* remove image URL decoding ([800431c](https://github.com/angeloashmore/gatsby-source-prismic/commit/800431c01972edd9da17ac4ecf6e1f5459c1bdf6))
* restore automatic compression and format ([ebf9b82](https://github.com/angeloashmore/gatsby-source-prismic/commit/ebf9b823c40f156e829781b0b343fce778d776c8))
* restore width and height oembed fields ([c919a3a](https://github.com/angeloashmore/gatsby-source-prismic/commit/c919a3a2230efee8a9e8c2d75a4176c34299c17f))
* use correct scaled height for fluid ([dad48b9](https://github.com/angeloashmore/gatsby-source-prismic/commit/dad48b940dd9b1ee3b181191f6c5143e82984fdc))

## [3.0.0-beta.24](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.23...v3.0.0-beta.24) (2020-02-10)


### Bug Fixes

* typo ([9021009](https://github.com/angeloashmore/gatsby-source-prismic/commit/9021009468a4d1da1712f672671f2ca5ab2625aa))

## [3.0.0-beta.23](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.22...v3.0.0-beta.23) (2020-02-10)


### Bug Fixes

* add thumbnail resolvers ([9268dff](https://github.com/angeloashmore/gatsby-source-prismic/commit/9268dff4c2de41d1651579d4197721f33b685d48))

## [3.0.0-beta.19](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.18...v3.0.0-beta.19) (2019-12-13)


### Features

* add alternate languages support ([7680981](https://github.com/angeloashmore/gatsby-source-prismic/commit/7680981a9df4ad3b59b2714c14b88b7e0d768c78))

## [3.0.0-beta.18](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.17...v3.0.0-beta.18) (2019-12-09)


### Features

* export getFixedGatsbyImage and getFluidGatsbyImage ([d53f8aa](https://github.com/angeloashmore/gatsby-source-prismic/commit/d53f8aa92b0fb204cc7088bf47784252a7133d5a))

## [3.0.0-beta.17](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.16...v3.0.0-beta.17) (2019-12-08)


### Bug Fixes

* restore link field size property ([dd02aeb](https://github.com/angeloashmore/gatsby-source-prismic/commit/dd02aeb70c4841b61ca2f3e574a4068ca3477504))

## [3.0.0-beta.16](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.15...v3.0.0-beta.16) (2019-12-05)


### Features

* add imgix gatsby-image integration ([#170](https://github.com/angeloashmore/gatsby-source-prismic/issues/170)) ([25fc981](https://github.com/angeloashmore/gatsby-source-prismic/commit/25fc981215cf7ac7223bdfa2e9ad0fea0c4fd72e))


### Bug Fixes

* graphql introspection on `PrismicDocument`'s `Date` fields ([87f758a](https://github.com/angeloashmore/gatsby-source-prismic/commit/87f758a0eec4986da346b8fd9a92beee55d4fc81))

## [3.0.0-beta.15](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.14...v3.0.0-beta.15) (2019-11-26)

### Bug Fixes

- ensure error message is an error object
  ([5a76af4](https://github.com/angeloashmore/gatsby-source-prismic/commit/5a76af445145e48540ed66e1013b4a935f6a87de))
- replace broken link check with isBroken property
  ([4f6a3a8](https://github.com/angeloashmore/gatsby-source-prismic/commit/4f6a3a83a38896d68c8fd0e449b1296a708443ff))
- update all dependencies
  ([3914bba](https://github.com/angeloashmore/gatsby-source-prismic/commit/3914bba080895817dc1ca305ebafff18b62deeff))
- **preview:** check for broken_type before trying to get linked document
  ([f557025](https://github.com/angeloashmore/gatsby-source-prismic/commit/f557025cf8e263cec75c53fa6e3af5e714ca1ef7))

## [3.0.0-beta.14](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.13...v3.0.0-beta.14) (2019-11-11)

### Bug Fixes

- ensure null values skipped on traversal merge
  ([fe10fb6](https://github.com/angeloashmore/gatsby-source-prismic/commit/fe10fb6))

## [3.0.0-beta.13](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.12...v3.0.0-beta.13) (2019-11-11)

### Bug Fixes

- add tags to PrismicDocument interface
  ([a5a5eae](https://github.com/angeloashmore/gatsby-source-prismic/commit/a5a5eae))
- handle schemas with no thumbnails properly
  ([f010fe9](https://github.com/angeloashmore/gatsby-source-prismic/commit/f010fe9))
- use cached images if available
  ([7787a45](https://github.com/angeloashmore/gatsby-source-prismic/commit/7787a45))

### Features

- don't infer fields
  ([dd66296](https://github.com/angeloashmore/gatsby-source-prismic/commit/dd66296))

## [3.0.0-beta.12](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.10...v3.0.0-beta.12) (2019-11-11)

### Bug Fixes

- only provide thumbnails field if present
  ([744914d](https://github.com/angeloashmore/gatsby-source-prismic/commit/744914d))
- restore option defaults
  ([690fa9b](https://github.com/angeloashmore/gatsby-source-prismic/commit/690fa9b))
- restore thumbnail localFile support under thumbnail key
  ([d1e2c45](https://github.com/angeloashmore/gatsby-source-prismic/commit/d1e2c45))

## [3.0.0-alpha.1](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2019-05-19)

## [3.0.0-beta.11](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.10...v3.0.0-beta.11) (2019-09-21)

### Bug Fixes

- restore option defaults
  ([690fa9b](https://github.com/angeloashmore/gatsby-source-prismic/commit/690fa9b))

## [3.0.0-beta.10](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.9...v3.0.0-beta.10) (2019-08-26)

### Bug Fixes

- decode image URL
  ([f9eba0f](https://github.com/angeloashmore/gatsby-source-prismic/commit/f9eba0f))

### Features

- shareLink implementation and tests
  ([dbfcf76](https://github.com/angeloashmore/gatsby-source-prismic/commit/dbfcf76))
- shareLink support
  ([bd910d3](https://github.com/angeloashmore/gatsby-source-prismic/commit/bd910d3))
- shareLink support
  ([da2b99b](https://github.com/angeloashmore/gatsby-source-prismic/commit/da2b99b))

## [3.0.0-beta.9](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0-beta.7...v3.0.0-beta.9) (2019-08-24)

### Bug Fixes

- strengthen plugin options schema
  ([5010a4e](https://github.com/angeloashmore/gatsby-source-prismic/commit/5010a4e))
- use cloneDeep to prevent mutation of static data
  ([b77ec93](https://github.com/angeloashmore/gatsby-source-prismic/commit/b77ec93))
- use common validatePluginOptions
  ([20ff655](https://github.com/angeloashmore/gatsby-source-prismic/commit/20ff655))
- use correct default linkResolver
  ([bd28a6e](https://github.com/angeloashmore/gatsby-source-prismic/commit/bd28a6e)),
  closes
  [#124](https://github.com/angeloashmore/gatsby-source-prismic/issues/124)
