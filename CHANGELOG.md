# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.3.3](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.3.2...v3.3.3) (2021-02-02)


### Bug Fixes

* error when link fields are null ([b742a57](https://github.com/angeloashmore/gatsby-source-prismic/commit/b742a57dfb68ab9e635d88059785caf2c7872fe2)), closes [#312](https://github.com/angeloashmore/gatsby-source-prismic/issues/312)

### [3.3.2](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.3.1...v3.3.2) (2021-01-20)

### Bug Fixes

- use consistent node IDs to better support Gatsby Preview ([4bfef99](https://github.com/angeloashmore/gatsby-source-prismic/commit/4bfef99aa186f27ff1877f32ffae7f9ab812e34e)), closes [#297](https://github.com/angeloashmore/gatsby-source-prismic/issues/297)

### [3.3.1](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.3.0...v3.3.1) (2020-12-10)


### Bug Fixes

* restore document link ([#298](https://github.com/angeloashmore/gatsby-source-prismic/issues/298)) ([4d94c3b](https://github.com/angeloashmore/gatsby-source-prismic/commit/4d94c3b02a9cbe5365ad9ee4292231d6578bc574))

## [3.3.0](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.2.1...v3.3.0) (2020-12-08)


### Features

* support for Gatsby Cloud ([#255](https://github.com/angeloashmore/gatsby-source-prismic/issues/255)) ([2badd85](https://github.com/angeloashmore/gatsby-source-prismic/commit/2badd85936511c21d61761da2d9b1daece40af94))

### [3.2.1](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.2.0...v3.2.1) (2020-07-26)


### Bug Fixes

* support repositories without image fields ([#250](https://github.com/angeloashmore/gatsby-source-prismic/issues/250)) ([1f68757](https://github.com/angeloashmore/gatsby-source-prismic/commit/1f68757d7759861cdf6bdcbfdd4259eb42471a7b)), closes [#238](https://github.com/angeloashmore/gatsby-source-prismic/issues/238)

## [3.2.0](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.1.4-previews-fix.1...v3.2.0) (2020-07-25)


### Bug Fixes

* ensure legacy preview toolbar has correct repo endpoint URL ([c64aab3](https://github.com/angeloashmore/gatsby-source-prismic/commit/c64aab3c72026a9308f557796c4ea9e87782ec1b))
* ensure legacy prismicId nested preview data merging still works ([575414e](https://github.com/angeloashmore/gatsby-source-prismic/commit/575414ea6502fd97f30c4ce4221863a97ae873f7))
* remove mention of _previewable docs (not yet written) ([0dc6014](https://github.com/angeloashmore/gatsby-source-prismic/commit/0dc6014edd53b6c131096944ffee0066289fbbad))
* update all dependencies ([4e16769](https://github.com/angeloashmore/gatsby-source-prismic/commit/4e16769220e3e38a0ea8393b5fdb22e84d5190d3))
* update missing _previewable warning message ([fbcd4b9](https://github.com/angeloashmore/gatsby-source-prismic/commit/fbcd4b98ee5d42a4eef4d608d8799debe7859e93))

### [3.1.4](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.1.3...v3.1.4) (2020-06-06)

### [3.1.3](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.1.2...v3.1.3) (2020-06-06)


### Bug Fixes

* compile nullish-coalescing-operator ([4ec2688](https://github.com/angeloashmore/gatsby-source-prismic/commit/4ec26883a9845d5587da3fe3b04fc91ac7b57147))

### [3.1.2](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.1.1...v3.1.2) (2020-06-05)


### Bug Fixes

* correct fluid fragments ([9a50ae4](https://github.com/angeloashmore/gatsby-source-prismic/commit/9a50ae44ac902908b81509f3caae628a92f0da55))
* prevent Imgix metadata request ([2338ce0](https://github.com/angeloashmore/gatsby-source-prismic/commit/2338ce0cc5d070333fab8372e38206ef04e52ed8)), closes [#236](https://github.com/angeloashmore/gatsby-source-prismic/issues/236)
* remove WebP fields from non-WebP image fragments ([676eea1](https://github.com/angeloashmore/gatsby-source-prismic/commit/676eea12e3158a9a698d1ebe7993ac74cfd7d9cb)), closes [#237](https://github.com/angeloashmore/gatsby-source-prismic/issues/237)

### [3.1.1](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.1.0...v3.1.1) (2020-06-01)


### Bug Fixes

* remove underscore before numbers in type names (regression) ([e0505f7](https://github.com/angeloashmore/gatsby-source-prismic/commit/e0505f74497357d0d867ff2b59fcdbd1a0811f02)), closes [#235](https://github.com/angeloashmore/gatsby-source-prismic/issues/235)

## [3.1.0](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.2...v3.1.0) (2020-06-01)


### Features

* add initial gatsby-plugin-imgix integration ([2a1e56c](https://github.com/angeloashmore/gatsby-source-prismic/commit/2a1e56c7c0d5de3a21468604b7df27b0ea49fb3e))
* add preview HOCs ([ccef925](https://github.com/angeloashmore/gatsby-source-prismic/commit/ccef92570a33d673e03ade3d870aae8b921e6a3e))
* add prismic-toolbar script to gatsby-ssr.js ([cf8cf60](https://github.com/angeloashmore/gatsby-source-prismic/commit/cf8cf60118537b160babf35186f8db62bc2c9f2e))
* add releaseID option ([992d604](https://github.com/angeloashmore/gatsby-source-prismic/commit/992d604164752b958afc37a6f695d1d33c57eac3))
* adding the prismic script can be disabled ([32820b2](https://github.com/angeloashmore/gatsby-source-prismic/commit/32820b2304a3e44f4bdfb8c586fbac9d4388bd7b))
* convert PrismicImageType to gatsby-plugin-imgix ([813f975](https://github.com/angeloashmore/gatsby-source-prismic/commit/813f97585c1935ebcd781d7678a70c2675834198))
* include legacy support for Prismic Toolbar ([d0c8270](https://github.com/angeloashmore/gatsby-source-prismic/commit/d0c8270d85a33ea716151379d98a04745e386fa1))
* optionally include prismicToolbar, default to false ([6534d42](https://github.com/angeloashmore/gatsby-source-prismic/commit/6534d4219a1ea8c28c63dbc3f3aba2ebf51f499c))
* support placeholder imgix params ([36bb9e2](https://github.com/angeloashmore/gatsby-source-prismic/commit/36bb9e27be07f1919f8d5077caf4ec0315a4135c))
* update to dev imgix plugin ([cbcae70](https://github.com/angeloashmore/gatsby-source-prismic/commit/cbcae70b144b805fff1dd087e95b51570628a955))
* upgrade gatsby-plugin-imgix ([b8b70a2](https://github.com/angeloashmore/gatsby-source-prismic/commit/b8b70a268c211da4d294bb2f87ec193a82c09fda))


### Bug Fixes

* add missing parts to HOCs ([00dae2d](https://github.com/angeloashmore/gatsby-source-prismic/commit/00dae2dd1313bcfba4558dae880cea7ff59c0022))
* add omirPrismicScript to validateOptions ([4368897](https://github.com/angeloashmore/gatsby-source-prismic/commit/43688974baa799975ade69eaf4b01adf199e11d0))
* correct prismicToolbar option name ([f575057](https://github.com/angeloashmore/gatsby-source-prismic/commit/f5750573122cb574493dd567653141cbe1c51708))
* different fix for the last error due to this error ([d6ec00e](https://github.com/angeloashmore/gatsby-source-prismic/commit/d6ec00eaddaa3324ea44ab77935356e76d5ab307))
* download full-quality image from Prismic for localFile ([e4d6298](https://github.com/angeloashmore/gatsby-source-prismic/commit/e4d62988825ef4bb652f42b14c510ae2fa81ae3b)), closes [#233](https://github.com/angeloashmore/gatsby-source-prismic/issues/233)
* error when trying to build ([b1866a9](https://github.com/angeloashmore/gatsby-source-prismic/commit/b1866a9c9e0935469d17a71702a1475d3c9b5c19))
* featch script using https protocol ([07dba6a](https://github.com/angeloashmore/gatsby-source-prismic/commit/07dba6a7a0a003a5a4920a0dff327734a3803117))
* gatsby-ssr not correctly exported ([aa607d7](https://github.com/angeloashmore/gatsby-source-prismic/commit/aa607d71841f584b38e883d2d5e0d200dc882082))
* import ssr function from dist ([5d45740](https://github.com/angeloashmore/gatsby-source-prismic/commit/5d45740ecc9c51855ea7f6a60281adc020f1e1f1))
* load and configure toolbar correctly ([eea005a](https://github.com/angeloashmore/gatsby-source-prismic/commit/eea005a2576f1353c172ecb0d19f84ca0c588ea6))
* move explicit for when to omit prismic script ([a806007](https://github.com/angeloashmore/gatsby-source-prismic/commit/a806007091e23e9da353f1e95dac1cea345bf6fb))
* remove devDependencies from build. ([5012bcc](https://github.com/angeloashmore/gatsby-source-prismic/commit/5012bcc9efb979c0325aeeaed881f59c4470e3bd))
* remove package-lock.json ([bfae1ea](https://github.com/angeloashmore/gatsby-source-prismic/commit/bfae1ea2e63979a363fe5c310a1ca96841e81df7))
* rename option to include prismic-toolbar ([6025f1c](https://github.com/angeloashmore/gatsby-source-prismic/commit/6025f1cacc02cd6baa1d6d76e7988d9a6258cc53))
* support all usePrismicPreview options on withPreviewResolver ([0099d06](https://github.com/angeloashmore/gatsby-source-prismic/commit/0099d066f620387415ca6c7e19b61744fb1dfa66))
* type error ([132ccb3](https://github.com/angeloashmore/gatsby-source-prismic/commit/132ccb35e710970fc265422ef285ad20d58b19d0))
* update gatsby-plugin-imgix ([cfa7b17](https://github.com/angeloashmore/gatsby-source-prismic/commit/cfa7b17d75461735b5fd363bf0949b1a043f4742))
* upgrade infrastructure and packages ([574431e](https://github.com/angeloashmore/gatsby-source-prismic/commit/574431efa76217672684704df2c2a33b7c4aeb37))
* use old version of the toolbar ([b1f8122](https://github.com/angeloashmore/gatsby-source-prismic/commit/b1f812232caccb575c3dc8c3b956d04fe33b53d4))
* use reporter for invalid release ID ([793dec3](https://github.com/angeloashmore/gatsby-source-prismic/commit/793dec32de13959a652aeb865865239e878d4a05))

### [3.0.2](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.1...v3.0.2) (2020-05-12)


### Bug Fixes

* enable description field on PrismicEmbedType ([#225](https://github.com/angeloashmore/gatsby-source-prismic/issues/225)) ([8f5ce90](https://github.com/angeloashmore/gatsby-source-prismic/commit/8f5ce907a0404cf6eaf94c83449fa3f4bc8d7ae8))

### [3.0.1](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.0.0...v3.0.1) (2020-04-06)


### Bug Fixes

* ensure gatsby-image fluid srcset uses integer descriptors ([d149d89](https://github.com/angeloashmore/gatsby-source-prismic/commit/d149d8924ec9701f371afe56535dbefd439c72fa))
* update dependencies ([#211](https://github.com/angeloashmore/gatsby-source-prismic/issues/211)) ([879bc76](https://github.com/angeloashmore/gatsby-source-prismic/commit/879bc7680aacfcebc619cf7c645455322751cf80))
* wait for linked documents to fully load in browser environment ([5bd6840](https://github.com/angeloashmore/gatsby-source-prismic/commit/5bd684069363038d989c990aed4e53940e19985e))

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
