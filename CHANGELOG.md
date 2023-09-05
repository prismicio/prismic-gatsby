# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.0.1](https://github.com/prismicio/prismic-gatsby/compare/v6.0.0...v6.0.1) (2023-09-05)


### Bug Fixes

* **previews:** correctly resolve the `url` property in link fields ([#542](https://github.com/prismicio/prismic-gatsby/issues/542)) ([0a426c5](https://github.com/prismicio/prismic-gatsby/commit/0a426c5f64b74af36f8b1c656355d44502c2ecfd))





# [6.0.0](https://github.com/prismicio/prismic-gatsby/compare/v5.3.1...v6.0.0) (2023-06-29)

**Note:** Version bump only for package @prismicio/gatsby





# [6.0.0-alpha.19](https://github.com/prismicio-community/prismic-gatsby-early-access/compare/v6.0.0-alpha.18...v6.0.0-alpha.19) (2022-11-17)

**Note:** Version bump only for package @prismicio/gatsby





# [6.0.0-alpha.18](https://github.com/prismicio-community/prismic-gatsby-early-access/compare/v6.0.0-alpha.17...v6.0.0-alpha.18) (2022-11-17)

### Bug Fixes

- handle nonexistent fields ([#49](https://github.com/prismicio-community/prismic-gatsby-early-access/issues/49)) ([28e9ee5](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/28e9ee551fa1a50b364d17dc19a7123c13b6971d))

# [6.0.0-alpha.17](https://github.com/prismicio-community/prismic-gatsby-early-access/compare/v6.0.0-alpha.16...v6.0.0-alpha.17) (2022-11-04)

### Bug Fixes

- allow `uid` and `lang` Route Resolver options ([#48](https://github.com/prismicio-community/prismic-gatsby-early-access/issues/48)) ([fbe8586](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/fbe858663b17098c2305793b962ce45255c0cc18))

# [6.0.0-alpha.16](https://github.com/prismicio-community/prismic-gatsby-early-access/compare/v6.0.0-alpha.0...v6.0.0-alpha.16) (2022-11-02)

### Bug Fixes

- always treat Select fields as nullable ([8e98ec4](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/8e98ec4df57a8cfb98a9365ecea0ba5c66a78128))
- builds and tests ([d664e4a](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/d664e4acd50adc61a7671181d3daddbb623686df))
- change UID field type from `ID!` to `String!` ([#12](https://github.com/prismicio-community/prismic-gatsby-early-access/issues/12)) ([8a27248](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/8a27248e4f82ab6d90b7980617e315ef3b3f0cb9))
- import fetch ([ce33026](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/ce33026d379cee7145d5a482bebda185f74e4ef6))
- **previews:** replace nanostores with Zustand ([#44](https://github.com/prismicio-community/prismic-gatsby-early-access/issues/44)) ([5e5aa05](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/5e5aa0567388dcdadb7b07c5862ff439922ddb8f))
- remove `node:` prefix from Node.js imports ([6851757](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/6851757f4669bf6b385b84d99302b2d358d9461b))
- resolve correct image thumbnail URLs ([#41](https://github.com/prismicio-community/prismic-gatsby-early-access/issues/41)) ([ef02eb0](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/ef02eb06294d2b5bd4a6ff20c54737600876edcc))
- resolve error when using `gatsbyImageData` with SVGs ([#13](https://github.com/prismicio-community/prismic-gatsby-early-access/issues/13)) ([a1ae60d](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/a1ae60dec307f7017982adec228e2e4b539623cf))
- support `gatsbyImageData` fixed layout with given dimensions ([#17](https://github.com/prismicio-community/prismic-gatsby-early-access/issues/17)) ([450864d](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/450864d085d14cf00f8f1985bebe43caf51175b0))
- support all `gatsbyImageData` parameters ([#19](https://github.com/prismicio-community/prismic-gatsby-early-access/issues/19)) ([172389a](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/172389a752123738eb06cc33d8a8dd63467ce790))
- support empty Slice Zones ([#42](https://github.com/prismicio-community/prismic-gatsby-early-access/issues/42)) ([30c1318](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/30c131860d7d72ddca467b11aa84f49f038c6e1e))
- support image thumbnails with dashes in their name ([#16](https://github.com/prismicio-community/prismic-gatsby-early-access/issues/16)) ([6ba042f](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/6ba042fe33ec0678c04f69f70d5f20c1970fc7d3))
- support Integration Field catalogs with no usage ([#14](https://github.com/prismicio-community/prismic-gatsby-early-access/issues/14)) ([2aaf89d](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/2aaf89d2816c244c1e44b261a94e5c420a0c8cbc))
- use `link_type` rather than `linkType` in `LinkField` ([1fa1b32](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/1fa1b3284114f854b8e60fa1b29dcb6d5e1a8a56))
- use `PrismicEmbedField` over `PrismicEmbed` everywhere ([fd32368](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/fd323682918343dc67242bd547d2692c724f019b))
- use correct required type name for AlternateLanguage ([7d1a658](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/7d1a65851571e95efde26cd75b7e5eaf8b3dbc70))

### Features

- 🍬 ([b7b5fdc](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/b7b5fdc441672f08f4f3ec2d8654fd2610374132))
- add `shouldDownloadFile` path to Link and Link to Media field descriptions ([#21](https://github.com/prismicio-community/prismic-gatsby-early-access/issues/21)) ([2629eb0](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/2629eb02e3b6ac6293b6c34bc2ea13f7a0b2a501))
- add debug `usePrismicPreviewState()` hook ([#43](https://github.com/prismicio-community/prismic-gatsby-early-access/issues/43)) ([a3321a4](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/a3321a45e074ebf0b49dc95c6fe48b65734305d0))
- add temporary timers to measure `sourecNodes` and preview times ([#25](https://github.com/prismicio-community/prismic-gatsby-early-access/issues/25)) ([d932796](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/d9327969bfd51ea975b9e611d4329cf2a39386dc))
- **previews:** validate plugin options ([#10](https://github.com/prismicio-community/prismic-gatsby-early-access/issues/10)) ([20e1beb](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/20e1bebf34093e1add544ab090f1ed13475f5658))
- restore Gatsby Cloud incremental builds support ([4a4a087](https://github.com/prismicio-community/prismic-gatsby-early-access/commit/4a4a087b3b94b80a46b013dfc6d9a24f64611d7c))
