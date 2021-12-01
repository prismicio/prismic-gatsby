# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.2.3](https://github.com/prismicio/prismic-gatsby/compare/v5.2.2...v5.2.3) (2021-12-01)


### Bug Fixes

* **source:** resolve "Unable to serialize object as a key" error on empty Embed fields ([5afb496](https://github.com/prismicio/prismic-gatsby/commit/5afb496b4376b069be5f863a87de5bb2265e5425)), closes [#484](https://github.com/prismicio/prismic-gatsby/issues/484)





## [5.2.2](https://github.com/prismicio/prismic-gatsby/compare/v5.2.1...v5.2.2) (2021-11-15)


### Bug Fixes

* **previews:** restore `dataRaw` document field ([3ab85ea](https://github.com/prismicio/prismic-gatsby/commit/3ab85ea0132f71df4ba54e9a1df4f1ee5c876353))





## [5.2.1](https://github.com/prismicio/prismic-gatsby/compare/v5.2.0...v5.2.1) (2021-11-10)


### Bug Fixes

* replace `@prismicio/client`'s `getAll` with `dangerouslyGetAll` ([50c0ef2](https://github.com/prismicio/prismic-gatsby/commit/50c0ef2e1628394c29755380f26926428436dd2a))





# [5.2.0](https://github.com/prismicio/prismic-gatsby/compare/v5.1.1...v5.2.0) (2021-11-10)


### Features

* add `routes` option to support Route Resolver ([#479](https://github.com/prismicio/prismic-gatsby/issues/479)) ([731f1a1](https://github.com/prismicio/prismic-gatsby/commit/731f1a119dabf1d19c9a1bd661fd158854e22fc1))





## [5.1.1](https://github.com/prismicio/prismic-gatsby/compare/v5.1.0...v5.1.1) (2021-11-06)


### Bug Fixes

* **source:** support Slices without non-repeat/repeat models ([5821cf0](https://github.com/prismicio/prismic-gatsby/commit/5821cf0970002a63df096090aed1f3a4fdfc92fb))





# [5.1.0](https://github.com/prismicio/prismic-gatsby/compare/v5.0.4...v5.1.0) (2021-11-05)


### Features

* type Rich Text and Title fields with custom PrismicStructuredText scalar ([#473](https://github.com/prismicio/prismic-gatsby/issues/473)) ([5737479](https://github.com/prismicio/prismic-gatsby/commit/5737479f8c113341214da7b432bf70e590e294f7))





## [5.0.4](https://github.com/prismicio/prismic-gatsby/compare/v5.0.3...v5.0.4) (2021-11-03)


### Bug Fixes

* add verbose log when downloading files ([e3d4adf](https://github.com/prismicio/prismic-gatsby/commit/e3d4adf3b0ac0db1571cc03208ae2af87c87c4fd))
* **source:** restore fetching documents of all languages by defualt ([def010a](https://github.com/prismicio/prismic-gatsby/commit/def010a2ce0db5180cd3140b5368cc94c35ca4b6))





## [5.0.3](https://github.com/prismicio/prismic-gatsby/compare/v5.0.2...v5.0.3) (2021-11-03)


### Bug Fixes

* ensure cached localFile fields are not null ([#472](https://github.com/prismicio/prismic-gatsby/issues/472)) ([b2d9d01](https://github.com/prismicio/prismic-gatsby/commit/b2d9d018fa61fddc8c901c98b3040f0b1ac6214e))





## [5.0.2](https://github.com/prismicio/prismic-gatsby/compare/v5.0.1...v5.0.2) (2021-10-30)


### Bug Fixes

* **previews:** resolve CORS error with `@prismicio/client` ([1d66749](https://github.com/prismicio/prismic-gatsby/commit/1d6674912d5780de37d8cad78c56b59b0d83b92a))





## [5.0.1](https://github.com/prismicio/prismic-gatsby/compare/v5.0.0...v5.0.1) (2021-10-29)


### Bug Fixes

* allow complete opt-in file downloading ([#470](https://github.com/prismicio/prismic-gatsby/issues/470)) ([c1b27b3](https://github.com/prismicio/prismic-gatsby/commit/c1b27b3003372dc258d5d9911e748a448b0e408d))





# [5.0.0](https://github.com/prismicio/prismic-gatsby/compare/v4.2.0...v5.0.0) (2021-10-21)


### Features

* support Gatsby 4 ([#466](https://github.com/prismicio/prismic-gatsby/issues/466)) ([d391580](https://github.com/prismicio/prismic-gatsby/commit/d391580a1ef5828b8bde018126eefdd859b54ae8))


### BREAKING CHANGES

* Changes to Gatsby's query runner requires the plugin to
download local files at bootstrap. Add a `shouldDownloadFiles` plugin
option if you use the `localFile` field for Image and Link fields.

* v5.0.0-alpha.0

* chore: link test-site to local packages

* chore: add publish:next script

* fix: provide better missing schema message

* style: run prettier

* chore: update dependencies

* v5.0.0-next.0

* chore: update gatsby-plugin-image

* v5.0.0-next.1

* chore: fix duplicated changelog

* fix: include gatsby-node.js on npm

* v5.0.0-next.2

* fix(previews): remove missing styles message

* v5.0.0-next.3

* chore: update gatsby, gatsby-plugin-image peer dep

* v5.0.0-next.4

* fix(previews): optional repositoryConfigs option for withPrismicPreviewResolver

* v5.0.0-next.5

* fix: move default function plugin options to Node APIs

* v5.0.0-next.6

* fix: use non-.mjs exports

This is primarily to support Storybook without special configuration.

* v5.0.0-next.7

* feat(source): move plugin option defaults to Gatsby Node APIs

* v5.0.0-next.8

* chore: update yarn.lock

* refactor: plugin options validation

* feat: improved plugin options validation messages

* chore: merge CHANGELOG

* feat: support pageSize plugin option

* chore: update dependencies

* fix: use updated @prismicio/helpers `asLink`

* v5.0.0-next.9

* fix(source): skip data field normalization for documents without data fields

* fix(previews): upgrade gatsby-source-prismic dependency

* v5.0.0-next.10

* fix(source): skip schema validation if Custom Types API is used

* v5.0.0-next.11

* fix: update peerDependencies for Gatsby 4

* chore: update test site dependencies

* chore: do not format CHANGELOG with prettier

* test: temporarily skip snapshot tests in CI

* test: explicitly pass CI-skipped tests





# [5.0.0-next.11](https://github.com/prismicio/prismic-gatsby/compare/v5.0.0-next.10...v5.0.0-next.11) (2021-10-20)


### Bug Fixes

* **source:** skip schema validation if Custom Types API is used ([de60737](https://github.com/prismicio/prismic-gatsby/commit/de60737ee798c80dbe7deda9f74ff9e4a4d7844c))





# [5.0.0-next.10](https://github.com/prismicio/prismic-gatsby/compare/v5.0.0-next.9...v5.0.0-next.10) (2021-10-20)


### Bug Fixes

* **source:** skip data field normalization for documents without data fields ([356800a](https://github.com/prismicio/prismic-gatsby/commit/356800af11725b581d48b5952c00fc80b1f55144))





# [5.0.0-next.9](https://github.com/prismicio/prismic-gatsby/compare/v4.2.0...v5.0.0-next.9) (2021-10-15)


### Bug Fixes

* use updated @prismicio/helpers `asLink` ([9f3c93f](https://github.com/prismicio/prismic-gatsby/commit/9f3c93f520f38174724e2b74fb9cdb08a48e9e63))


### Features

* improved plugin options validation messages ([f7b7ff9](https://github.com/prismicio/prismic-gatsby/commit/f7b7ff9adb6f8f57a1f9fe52f9e79c93e7ef528c))
* support pageSize plugin option ([5cc03b3](https://github.com/prismicio/prismic-gatsby/commit/5cc03b302f5e9352fdf2472520b17e34c4cb2870))



# [5.0.0-next.8](https://github.com/prismicio/prismic-gatsby/compare/v4.1.6...v5.0.0-next.8) (2021-09-23)


### Features

* **source:** move plugin option defaults to Gatsby Node APIs ([f92b995](https://github.com/prismicio/prismic-gatsby/commit/f92b995bc36f1f1335bc8eb653e64919e1169460))



# [5.0.0-next.7](https://github.com/prismicio/prismic-gatsby/compare/v5.0.0-next.6...v5.0.0-next.7) (2021-09-18)


### Bug Fixes

* use non-.mjs exports ([318789e](https://github.com/prismicio/prismic-gatsby/commit/318789eb766f2cd97ec0c6a791183ab9bc7a72ef))



# [5.0.0-next.6](https://github.com/prismicio/prismic-gatsby/compare/v5.0.0-next.5...v5.0.0-next.6) (2021-09-17)


### Bug Fixes

* move default function plugin options to Node APIs ([d1b39d7](https://github.com/prismicio/prismic-gatsby/commit/d1b39d755ebb5f4229caded3c20d43c12c2a660d))



# [5.0.0-next.4](https://github.com/prismicio/prismic-gatsby/compare/v5.0.0-next.3...v5.0.0-next.4) (2021-09-16)



# [5.0.0-next.2](https://github.com/prismicio/prismic-gatsby/compare/v5.0.0-next.1...v5.0.0-next.2) (2021-09-15)


### Bug Fixes

* include gatsby-node.js on npm ([29eba49](https://github.com/prismicio/prismic-gatsby/commit/29eba4916deeecb388dfe83f6eb70dbe0fbe0cf5))



# [5.0.0-next.1](https://github.com/prismicio/prismic-gatsby/compare/v4.1.5...v5.0.0-next.1) (2021-09-15)



# [5.0.0-next.0](https://github.com/prismicio/prismic-gatsby/compare/v5.0.0-alpha.0...v5.0.0-next.0) (2021-09-14)


### Bug Fixes

* provide better missing schema message ([ddb1d84](https://github.com/prismicio/prismic-gatsby/commit/ddb1d843e01dc87a502f3b4d4c38afc5d53fc9ad))



# [5.0.0-alpha.0](https://github.com/prismicio/prismic-gatsby/compare/v4.1.3...v5.0.0-alpha.0) (2021-09-09)


### Bug Fixes

* correctly register UID field ([b08881b](https://github.com/prismicio/prismic-gatsby/commit/b08881ba98cca2c35f0c3c3fd4a62a857793561f))
* improve types ([05d2a6f](https://github.com/prismicio/prismic-gatsby/commit/05d2a6fd41c3062e4371a2c970e070b2f66a5390))
* mark data field as non-nullable ([2069812](https://github.com/prismicio/prismic-gatsby/commit/2069812baa216f2b75a41a6a9af0169dac7fb4ba))
* only add data type path if model contains data fields ([8025bb6](https://github.com/prismicio/prismic-gatsby/commit/8025bb68f06a29600745156c4592e7a1fbdb74c9))
* restore type path serialization ([907b3ee](https://github.com/prismicio/prismic-gatsby/commit/907b3eebb1fcf232c990c806de252f66a1a3a65a))
* sanitize runtime image URL field ([5a28488](https://github.com/prismicio/prismic-gatsby/commit/5a28488e5d0119fd538005d577efc7773f015296))
* **source:** support null link values in runtime ([09de6a6](https://github.com/prismicio/prismic-gatsby/commit/09de6a6d3e69dd85ab4a0e7df71f0209a0e10a6c))
* support object HTML Serializer ([e0a9624](https://github.com/prismicio/prismic-gatsby/commit/e0a9624029bedc7c25ad48dee7957d3a71855fd6))
* url build error ([0b6ced0](https://github.com/prismicio/prismic-gatsby/commit/0b6ced08639a2980ca34e986658b6d000231f87f))
* use correct Shared Slice type resolver ([5cbdea2](https://github.com/prismicio/prismic-gatsby/commit/5cbdea2442cf5dfa10f3f2a6e3a753a219c5f659))
* use latest `@prismicio/client` ([0ea5cef](https://github.com/prismicio/prismic-gatsby/commit/0ea5cefdbb6ba50657c006c83a9305dd84f94f84))


### Features

* add richText field to StructuredText fields ([f967015](https://github.com/prismicio/prismic-gatsby/commit/f967015382385e49bf5db0db3cb949e05bb0d000))
* add runtime manager ([f362bcb](https://github.com/prismicio/prismic-gatsby/commit/f362bcb8dfd6af948d7ff30806d166e967e91268))
* add runtime normalizer ([19c5818](https://github.com/prismicio/prismic-gatsby/commit/19c581819d3524150ab79fd646e653df6ba000b8))
* add shouldDownloadFiles plugin option ([34cc69b](https://github.com/prismicio/prismic-gatsby/commit/34cc69b9cc6071558865f8bedf1d18870f36a179))
* allow direct value normalization ([413b007](https://github.com/prismicio/prismic-gatsby/commit/413b0075ce6e6ca054d2a2e4f23828486c6dddb4))
* deprecate Rich Text `raw` for `richText` ([370f28a](https://github.com/prismicio/prismic-gatsby/commit/370f28a48ad5f50b92c912458e39e688b4e11236))
* initial parallelization support ([217c97f](https://github.com/prismicio/prismic-gatsby/commit/217c97f2242d0062b7f09c832d69c84545a600bf))
* initial Shared Slices support ([1e31d9c](https://github.com/prismicio/prismic-gatsby/commit/1e31d9c446811ef78abad0383965144e70ba2e99))
* **previews:** use new shared runtime ([0030398](https://github.com/prismicio/prismic-gatsby/commit/0030398846dc1a41fe034eb5ffc8ad784f974177))
* **previews:** use runtime throughout plugin ([937650b](https://github.com/prismicio/prismic-gatsby/commit/937650b522e06c36725f56229090d84b22307b26))
* **previews:** use shadow dom for style isolation ([f4e5448](https://github.com/prismicio/prismic-gatsby/commit/f4e5448fc6fabda20c06f3f26c0892e2a2fa59ac))
* **source:** support shared slices in type paths ([6f8c677](https://github.com/prismicio/prismic-gatsby/commit/6f8c677356443d97f2a550e2852f004664c1a48e))
* support Gatsby 4 ([600e566](https://github.com/prismicio/prismic-gatsby/commit/600e5669c8bad99f75d5fce68b8b2ba57c11592a))


### BREAKING CHANGES

* Changes to Gatsby's query runner requires the plugin to
download local files at bootstrap. Add a `shouldDownloadFiles` plugin
option if you use the `localFile` field for Image and Link fields.





# [5.0.0-next.8](https://github.com/prismicio/prismic-gatsby/compare/v5.0.0-next.7...v5.0.0-next.8) (2021-09-23)


### Bug Fixes

* **source:** correctly support Cloud Builds on Gatsby Cloud ([#450](https://github.com/prismicio/prismic-gatsby/issues/450)) ([555a37d](https://github.com/prismicio/prismic-gatsby/commit/555a37d592fee72ccf9cdc5958c5d81b45f48306))





# [5.0.0-next.7](https://github.com/prismicio/prismic-gatsby/compare/v5.0.0-next.6...v5.0.0-next.7) (2021-09-18)


### Bug Fixes

* use non-.mjs exports ([318789e](https://github.com/prismicio/prismic-gatsby/commit/318789eb766f2cd97ec0c6a791183ab9bc7a72ef))





# [5.0.0-next.6](https://github.com/prismicio/prismic-gatsby/compare/v5.0.0-next.5...v5.0.0-next.6) (2021-09-17)


### Bug Fixes

* move default function plugin options to Node APIs ([d1b39d7](https://github.com/prismicio/prismic-gatsby/commit/d1b39d755ebb5f4229caded3c20d43c12c2a660d))





# [5.0.0-next.4](https://github.com/prismicio/prismic-gatsby/compare/v5.0.0-next.3...v5.0.0-next.4) (2021-09-16)

**Note:** Version bump only for package gatsby-source-prismic





# [5.0.0-next.2](https://github.com/prismicio/prismic-gatsby/compare/v5.0.0-next.1...v5.0.0-next.2) (2021-09-15)


### Bug Fixes

* include gatsby-node.js on npm ([29eba49](https://github.com/prismicio/prismic-gatsby/commit/29eba4916deeecb388dfe83f6eb70dbe0fbe0cf5))





# [5.0.0-next.1](https://github.com/prismicio/prismic-gatsby/compare/v4.1.5...v5.0.0-next.1) (2021-09-15)



# [5.0.0-next.0](https://github.com/prismicio/prismic-gatsby/compare/v5.0.0-alpha.0...v5.0.0-next.0) (2021-09-14)


### Bug Fixes

* provide better missing schema message ([ddb1d84](https://github.com/prismicio/prismic-gatsby/commit/ddb1d843e01dc87a502f3b4d4c38afc5d53fc9ad))



# [5.0.0-alpha.0](https://github.com/prismicio/prismic-gatsby/compare/v4.1.3...v5.0.0-alpha.0) (2021-09-09)


### Bug Fixes

* correctly register UID field ([b08881b](https://github.com/prismicio/prismic-gatsby/commit/b08881ba98cca2c35f0c3c3fd4a62a857793561f))
* improve types ([05d2a6f](https://github.com/prismicio/prismic-gatsby/commit/05d2a6fd41c3062e4371a2c970e070b2f66a5390))
* mark data field as non-nullable ([2069812](https://github.com/prismicio/prismic-gatsby/commit/2069812baa216f2b75a41a6a9af0169dac7fb4ba))
* only add data type path if model contains data fields ([8025bb6](https://github.com/prismicio/prismic-gatsby/commit/8025bb68f06a29600745156c4592e7a1fbdb74c9))
* restore type path serialization ([907b3ee](https://github.com/prismicio/prismic-gatsby/commit/907b3eebb1fcf232c990c806de252f66a1a3a65a))
* sanitize runtime image URL field ([5a28488](https://github.com/prismicio/prismic-gatsby/commit/5a28488e5d0119fd538005d577efc7773f015296))
* **source:** support null link values in runtime ([09de6a6](https://github.com/prismicio/prismic-gatsby/commit/09de6a6d3e69dd85ab4a0e7df71f0209a0e10a6c))
* support object HTML Serializer ([e0a9624](https://github.com/prismicio/prismic-gatsby/commit/e0a9624029bedc7c25ad48dee7957d3a71855fd6))
* url build error ([0b6ced0](https://github.com/prismicio/prismic-gatsby/commit/0b6ced08639a2980ca34e986658b6d000231f87f))
* use correct Shared Slice type resolver ([5cbdea2](https://github.com/prismicio/prismic-gatsby/commit/5cbdea2442cf5dfa10f3f2a6e3a753a219c5f659))
* use latest `@prismicio/client` ([0ea5cef](https://github.com/prismicio/prismic-gatsby/commit/0ea5cefdbb6ba50657c006c83a9305dd84f94f84))


### Features

* add richText field to StructuredText fields ([f967015](https://github.com/prismicio/prismic-gatsby/commit/f967015382385e49bf5db0db3cb949e05bb0d000))
* add runtime manager ([f362bcb](https://github.com/prismicio/prismic-gatsby/commit/f362bcb8dfd6af948d7ff30806d166e967e91268))
* add runtime normalizer ([19c5818](https://github.com/prismicio/prismic-gatsby/commit/19c581819d3524150ab79fd646e653df6ba000b8))
* add shouldDownloadFiles plugin option ([34cc69b](https://github.com/prismicio/prismic-gatsby/commit/34cc69b9cc6071558865f8bedf1d18870f36a179))
* allow direct value normalization ([413b007](https://github.com/prismicio/prismic-gatsby/commit/413b0075ce6e6ca054d2a2e4f23828486c6dddb4))
* deprecate Rich Text `raw` for `richText` ([370f28a](https://github.com/prismicio/prismic-gatsby/commit/370f28a48ad5f50b92c912458e39e688b4e11236))
* initial parallelization support ([217c97f](https://github.com/prismicio/prismic-gatsby/commit/217c97f2242d0062b7f09c832d69c84545a600bf))
* initial Shared Slices support ([1e31d9c](https://github.com/prismicio/prismic-gatsby/commit/1e31d9c446811ef78abad0383965144e70ba2e99))
* **previews:** use new shared runtime ([0030398](https://github.com/prismicio/prismic-gatsby/commit/0030398846dc1a41fe034eb5ffc8ad784f974177))
* **previews:** use runtime throughout plugin ([937650b](https://github.com/prismicio/prismic-gatsby/commit/937650b522e06c36725f56229090d84b22307b26))
* **previews:** use shadow dom for style isolation ([f4e5448](https://github.com/prismicio/prismic-gatsby/commit/f4e5448fc6fabda20c06f3f26c0892e2a2fa59ac))
* **source:** support shared slices in type paths ([6f8c677](https://github.com/prismicio/prismic-gatsby/commit/6f8c677356443d97f2a550e2852f004664c1a48e))
* support Gatsby 4 ([600e566](https://github.com/prismicio/prismic-gatsby/commit/600e5669c8bad99f75d5fce68b8b2ba57c11592a))


### BREAKING CHANGES

* Changes to Gatsby's query runner requires the plugin to
download local files at bootstrap. Add a `shouldDownloadFiles` plugin
option if you use the `localFile` field for Image and Link fields.





# [4.2.0](https://github.com/prismicio/gatsby/compare/v4.1.7...v4.2.0) (2021-10-04)


### Features

* add `pageSize` option ([#456](https://github.com/prismicio/gatsby/issues/456)) ([72d6a68](https://github.com/prismicio/gatsby/commit/72d6a6860262293d3ade374387ac9ffa07b629da))





## [4.1.7](https://github.com/prismicio/gatsby/compare/v4.1.6...v4.1.7) (2021-10-01)


### Bug Fixes

* update dependencies ([57ceb56](https://github.com/prismicio/gatsby/commit/57ceb5625bbfb989745845c50d770bca659ae4c1))





## [4.1.6](https://github.com/prismicio/gatsby/compare/v4.1.5...v4.1.6) (2021-09-23)


### Bug Fixes

* **source:** correctly support Cloud Builds on Gatsby Cloud ([#450](https://github.com/prismicio/gatsby/issues/450)) ([555a37d](https://github.com/prismicio/gatsby/commit/555a37d592fee72ccf9cdc5958c5d81b45f48306))





## [4.1.5](https://github.com/prismicio/gatsby/compare/v4.1.4...v4.1.5) (2021-09-15)


### Bug Fixes

* **sourec:** only normalize data field if it contains fields ([1eb81a2](https://github.com/prismicio/gatsby/commit/1eb81a223d1c3f45884bfc22c04645e2047df293))





## [4.1.4](https://github.com/prismicio/gatsby/compare/v4.1.3...v4.1.4) (2021-09-15)


### Bug Fixes

* correctly resolve root document fields when using transformFieldName ([9175c7d](https://github.com/prismicio/gatsby/commit/9175c7d6681b2385abd5a7a5e2701183dd7e5515)), closes [#447](https://github.com/prismicio/gatsby/issues/447)





## [4.1.2](https://github.com/prismicio/gatsby/compare/v4.1.1...v4.1.2) (2021-08-25)


### Bug Fixes

* lock `@prismicio/client` version ([43e7795](https://github.com/prismicio/gatsby/commit/43e77957ed579ae1519699278c56522da5b8c75a))





# [4.1.0](https://github.com/prismicio/gatsby/compare/v4.0.3...v4.1.0) (2021-08-18)


### Features

* support for custom fetch function ([#432](https://github.com/prismicio/gatsby/issues/432)) ([8f4a96f](https://github.com/prismicio/gatsby/commit/8f4a96ffd0653f4b6fe9271af52d2fdd35cd7876))





## [4.0.2](https://github.com/prismicio/gatsby/compare/v4.0.1...v4.0.2) (2021-07-27)


### Bug Fixes

* correctly resolve fields with transformed names ([#415](https://github.com/prismicio/gatsby/issues/415)) ([1c7907f](https://github.com/prismicio/gatsby/commit/1c7907f420e22b99d3c6009d85c443e2a00fa414))





## [4.0.1](https://github.com/prismicio/gatsby/compare/v4.0.0...v4.0.1) (2021-07-20)

**Note:** Version bump only for package gatsby-source-prismic





# [4.0.0](https://github.com/angeloashmore/gatsby-source-prismic/compare/v3.3.6...v4.0.0) (2021-07-20)


### Features

* v4.0.0 ([#408](https://github.com/angeloashmore/gatsby-source-prismic/issues/408)) ([407887f](https://github.com/angeloashmore/gatsby-source-prismic/commit/407887f2a039346420d4238beb8866dd33d230f8)), closes [#334](https://github.com/angeloashmore/gatsby-source-prismic/issues/334) [#335](https://github.com/angeloashmore/gatsby-source-prismic/issues/335) [#349](https://github.com/angeloashmore/gatsby-source-prismic/issues/349) [#350](https://github.com/angeloashmore/gatsby-source-prismic/issues/350) [#352](https://github.com/angeloashmore/gatsby-source-prismic/issues/352) [#353](https://github.com/angeloashmore/gatsby-source-prismic/issues/353) [#359](https://github.com/angeloashmore/gatsby-source-prismic/issues/359) [#360](https://github.com/angeloashmore/gatsby-source-prismic/issues/360) [#351](https://github.com/angeloashmore/gatsby-source-prismic/issues/351) [#364](https://github.com/angeloashmore/gatsby-source-prismic/issues/364) [#371](https://github.com/angeloashmore/gatsby-source-prismic/issues/371) [#375](https://github.com/angeloashmore/gatsby-source-prismic/issues/375) [#383](https://github.com/angeloashmore/gatsby-source-prismic/issues/383) [#405](https://github.com/angeloashmore/gatsby-source-prismic/issues/405) [#406](https://github.com/angeloashmore/gatsby-source-prismic/issues/406)





# [4.0.0-beta.22](https://github.com/angeloashmore/gatsby-source-prismic/compare/v4.0.0-beta.21...v4.0.0-beta.22) (2021-07-13)


### Bug Fixes

* update all dependencies ([66f71b5](https://github.com/angeloashmore/gatsby-source-prismic/commit/66f71b5fb44e4443a1cce6de884ca6627747dab8))





# [4.0.0-beta.21](https://github.com/angeloashmore/gatsby-source-prismic/compare/v4.0.0-beta.20...v4.0.0-beta.21) (2021-07-08)


### Bug Fixes

* properly decode image URLs ([#405](https://github.com/angeloashmore/gatsby-source-prismic/issues/405)) ([6df0059](https://github.com/angeloashmore/gatsby-source-prismic/commit/6df00597389a2743b70760a6449655615f92299c))





# [4.0.0-beta.17](https://github.com/angeloashmore/gatsby-source-prismic/compare/v4.0.0-beta.16...v4.0.0-beta.17) (2021-06-09)


### Bug Fixes

* prepare imgix URLs by removing query params ([3178489](https://github.com/angeloashmore/gatsby-source-prismic/commit/3178489761b5720bde60845a71296a9955f027da))





# [4.0.0-beta.15](https://github.com/angeloashmore/gatsby-source-prismic/compare/v4.0.0-beta.14...v4.0.0-beta.15) (2021-06-08)

**Note:** Version bump only for package gatsby-source-prismic





# [4.0.0-beta.11](https://github.com/angeloashmore/gatsby-source-prismic/compare/v4.0.0-beta.10...v4.0.0-beta.11) (2021-06-01)

**Note:** Version bump only for package gatsby-source-prismic





# [4.0.0-beta.10](https://github.com/angeloashmore/gatsby-source-prismic/compare/v4.0.0-beta.9...v4.0.0-beta.10) (2021-06-01)


### Bug Fixes

* update gatsby-image fragments for @imgix/gatsby ([0ebf59e](https://github.com/angeloashmore/gatsby-source-prismic/commit/0ebf59e308830611377c4b4aa661f7b699d7e54d))





# [4.0.0-beta.8](https://github.com/angeloashmore/gatsby-source-prismic/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2021-05-29)


### Bug Fixes

* decode image URLs ([85deba5](https://github.com/angeloashmore/gatsby-source-prismic/commit/85deba5b05a7a37d5c343c05a3b1137c00988a22))





# [4.0.0-beta.7](https://github.com/angeloashmore/gatsby-source-prismic/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2021-05-28)


### Bug Fixes

* use properly escaped regex ([020717e](https://github.com/angeloashmore/gatsby-source-prismic/commit/020717e8521b2571a8b1b17ee9fedbef0107b58f))





# [4.0.0-beta.6](https://github.com/angeloashmore/gatsby-source-prismic/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2021-05-28)


### Bug Fixes

* manually handle spaces in image URLs ([2acad02](https://github.com/angeloashmore/gatsby-source-prismic/commit/2acad02975f9a0562e02b1586d5e8afea5e89d5d))





# [4.0.0-beta.1](https://github.com/angeloashmore/gatsby-source-prismic/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2021-05-28)

**Note:** Version bump only for package gatsby-source-prismic





# [4.0.0-beta.0](https://github.com/angeloashmore/gatsby-source-prismic/compare/v4.0.0-alpha.12...v4.0.0-beta.0) (2021-05-26)

**Note:** Version bump only for package gatsby-source-prismic





# [4.0.0-alpha.12](https://github.com/angeloashmore/gatsby-source-prismic/compare/v4.0.0-alpha.11...v4.0.0-alpha.12) (2021-05-26)


### Bug Fixes

* retain existing Imgix URL parameters on images ([#375](https://github.com/angeloashmore/gatsby-source-prismic/issues/375)) ([f812d2e](https://github.com/angeloashmore/gatsby-source-prismic/commit/f812d2eca08d98d1ffa93e636839404dff8ecebd))
* use more descriptive test-trigger webhook message ([7053c39](https://github.com/angeloashmore/gatsby-source-prismic/commit/7053c39bfa2d658a10032a3be84275073d4338d8))
