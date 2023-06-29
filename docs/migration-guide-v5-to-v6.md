# Migration Guide: v5 to v6

This is a guide for upgrading a project using `gatsby-source-prismic` and `gatsby-plugin-prismic-previews` v5 to v6.

## Benefits of upgrading

- Development server start-up and site builds are quicker due to smarter caching between content changes.
- Bundle sizes and preview resolution times are significantly reduced in apps using `gatsby-plugin-prismic-previews`.

> 🕙 **Before reading**
>
> If your project uses a version of `gatsby-source-prismic` or `gatsby-plugin-prismic-previews` older than v5, perform the previous migration guides before proceeding.
>
> - [v4 to v5 Migration Guide](./migration-guide-v4-to-v5.md)
> - [v3 to v4 Migration Guide](./migration-guide-v3-to-v4.md)
> - [v2 to v3 Migration Guide](./migration-guide-v2-to-v3.md)
> - [gatsby-source-prismic-graphql Migration Guide](./migration-guide-from-gatsby-source-prismic-graphql.md)

# Update your dependencies

To update your project to v6, you’ll first need to update your dependencies.

## Update Gatsby

Gatsby 5 is required when using `gatsby-source-prismic` and `gatsby-plugin-prismic-previews` v6.

Update Gatsby and your `package.json` with the following command:

```bash
npm install gatsby@latest
```

## Update `gatsby-source-prismic`

Update `gatsby-source-prismic` and your `package.json` with the following command:

```bash
npm install gatsby-source-prismic@latest
```

## Update `gatsby-plugin-prismic-previews`

If you project uses `gatsby-plugin-prismic-previews`, update it and your `package.json` with the following command:

```bash
npm install gatsby-plugin-prismic-previews@latest
```

# Handling `gatsby-source-prismic` breaking changes

## Replace `gatsby-image` with `gatsby-plugin-image`

In **v5**, images could be optimized using Gatsby’s `gatsby-plugin-image` or its predecessor, `gatsby-image`.

In **v6**, support for `gatsby-image` is dropped. Gatsby has deprecated `gatsby-image` and recommends developers use its replacement, `gatsby-plugin-image`, instead.

First, uninstall `gatsby-image`. Note that `gatsby-plugin-image` should already be installed as it is a peer dependency of `gatsby-source-prismic`.

```bash
npm uninstall gatsby-image
```

Next, update your GraphQL queries by replacing `fixed` and `fluid` fields with `gatsbyImageData`.

```diff
  export const query = graphql`
    query {
      prismicPage {
        data {
          imageField {
-           fluid {
-             ...GatsbyImgixFluid
-           }
+           gatsbyImageData
          }
        }
      }
    }
  `
```

Finally, replace all image components from `gatsby-image` to `gatsby-plugin-image`.

```diff
- import GatsbyImage from 'gatsby-image'
+ import { GatsbyImage } from 'gatsby-plugin-image'

  const Page = ({ data }) => {
    return (
      <div>
        <GatsbyImage
-         fixed={data.prismicPage.data.imageField.fluid}
+         image={data.prismicPage.data.imageField.gatsbyImageData}
        />
      </div>
    )
  }
```

When using `gatsby-plugin-image`, the `alt` property is required. Be sure to query your Image fields’ `alt` field and pass it to the `alt` prop.

```diff
  <GatsbyImage
    image={data.prismicPage.data.imageField.gatsbyImageData}
+   alt={data.prismicPage.data.imageField.alt}
  />
```

```diff
  export const query = graphql`
    query {
      prismicPage {
        data {
          imageField {
            gatsbyImageData
+           alt
          }
        }
      }
    }
  `
```

> 💬 **Official `gatsby-plugin-image` migration guide**
>
> For more details on migrating from `gatsby-image` to `gatsby-plugin-image`, see [Gatsby’s official migration guide](https://www.gatsbyjs.com/docs/reference/release-notes/image-migration-guide/).

## Update GraphQL type names

In **v5**, a collection of GraphQL types are added to Gatsby to represent Prismic data. For example, a Link field is represented by a `PrismicLink` GraphQL type.

In **v6**, many of these types have been renamed to reduce GraphQL type name collisions and more clearly represent what the types contain.

All GraphQL types with renames are listed below:

- `PrismicSliceType` → `PrismicSlice`
- `PrismicSharedSliceType` → `PrismicSharedSlice`
- `PrismicLinkType` → `PrismicLinkField`
- `PrismicEmbed` → `PrismicEmbedField`
- `PrismicGeoPoint` → `PrismicGeoPointField`
- `PrismicImage` → `PrismicImageField`
- `PrismicRichTextFormats` → `PrismicRichTextField`
- `PrismicStructuredTextType` → `PrismicRichText`
- `Prismic${customTypeID}Data${sliceZoneID}SlicesType` → `Prismic${customTypeID}Data${sliceZoneID}` (used as the type of Slice Zone fields)

If you use any of these types in your GraphQL queries or schema customizations in `gatsby-node.js`, update their names to their replacements.

## Update Shared Slice type names

> ⚠️ This step is only required if you are using [Slice Machine](https://prismic.io/docs/slice-machine) with Gatsby, which is not yet officially supported.
>
> If your app does not contain an `sm.json` file in its root directory, you are not using Slice Machine and can safely skip this step.

In **v5**, experimental support for Shared Slices was introduced. Shared Slices are a type of Slice that can be modeled once and used across multiple Custom Types.

In **v6**, the GraphQL type names for Shared Slices have been changed to include the word “Slice” after the Slice’s ID.

- Old: `Prismic${sliceID}` (example: `PrismicGallery`)
- New: `Prismic${sliceID}Slice` (example: `PrismicGallerySlice`)

In the above examples, `${sliceID}` is the Pascal case version of the Slice’s ID.

This change was made to reduce GraphQL type name collisions and more clearly represent what the type contained.

To migrate your project, update all Shared Slice type references to use the new format.

```diff
  export const fragment = graphql`
-   fragment PrismicText on PrismicText {
-     ... on PrismicTextDefault {
+   fragment PrismicTextSlice on PrismicTextSlice {
+     ... on PrismicTextSliceDefault {
        variation
        primary {
          text {
            richText
          }
        }
      }
    }
  `
```

# Handling `gatsby-plugin-prismic-previews` breaking changes

## Remove `componentResolverFromMap()`

In **v5**, a `componentResolverFromMap()` helper is provided to configure page templates used when previewing unpublished documents. It accepts an object mapping document types to a page template component.

In **v6**, page templates can be configured by providing the object map directly, removing the need for a `componentResolverFromMap()` helper.

If your app is using `componentResolverFromMap()`, remove it and pass the helper’s object argument directly to the repository configuration.

```diff
- import { componentResolverFromMap } from 'gatsby-plugin-prismic-previews'

  export const repositoryConfigs = [
    {
      repositoryName: getRepositoryName(sm.apiEndpoint),
-     componentResolver: componentResolverFromMap({
-       page: lazy(() => import('./pages/{PrismicPage.url}')),
-       article: lazy(() => import('./pages/{PrismicArticle.url}')),
-     }),
+     componentResolver: {
+       page: lazy(() => import('./pages/{PrismicPage.url}')),
+       article: lazy(() => import('./pages/{PrismicArticle.url}')),
+     },
    },
  ]
```

The `componentResolver` option will continue to support function values for cases requiring custom component resolution.

## Update `useMergePrismicPreviewData()` hook return value

In **v5**, the `useMergePrismicPreviewData()` hook let you access preview content in data fetched using Gatsby’s `useStaticQuery` hook. It returned an object containing the merged data and information about the preview plugin’s status.

In **v6**, `useMergePrismicPreviewData()`’s return value is simplified to only include the merged data.

```jsx
  const staticData = useStaticQuery(graphql`
    query NonPageQuery {
      prismicSettings {
        _previewable
        data {
          site_title {
            text
          }
        }
      }
    }
  `)
- const { data, isPreview } = useMergePrismicPreviewData(staticData)
+ const data = useMergePrismicPreviewData(staticData)
```

## Move repository configuration to `<PrismicPreviewProvider>`

In **v5**, preview configuration for Prismic repositories could be provided in two locations:

- As the second argument to the plugin’s higher order components: `withPrismicPreview()`, `withPrismicPreviewResolver()`, and `withPrismicUnpublishedPreview()`.
- To `<PrismicPreviewProvider>`'s `repositoryConfigs` prop.

In **v6**, all preview configuration must be provided to `<PrismicPreviewProvider>` using the `repositoryConfigs` prop.

If your app provided repository configuration to the higher order components, move them to the global `<PrismicPreviewProvider>` component in `gatsby-browser.js`.

To make this change, first remove the configuration array from each higher order component.

```diff
// src/pages/home.js

- export default withPrismicUnpublishedPreview(Page, [
-   {
-     repositoryName: "your-repo-name",
-     linkResolver: yourLinkResolverFunction,
-     componentResolver: {
-       page: React.lazy(() => import ('../templates/page.js')),
-     }
-   }
- ])
+ export default withPrismicPreview(Page)
```

Next, add the configuration array to `<PrismicPreviewProvider>` in `gatsby-browser.js`.

```diff
// gatsby-browser.js

+ const repositoryConfigs = [
+   {
+     repositoryName: "your-repo-name",
+     linkResolver: yourLinkResolverFunction,
+     componentResolver: {
+       page: React.lazy(() => import("../templates/page.js")),
+     },
+   },
+ ];

  export const wrapRootElement = ({ element }) => (
-   <PrismicPreviewProvider>
+   <PrismicPreviewProvider repositoryConfigs={repositoryConfigs}>
      {element}
    </PrismicPreviewProvider>
  );
```

Defining the configuration array in a constant outside the `wrapRootElement()` function is recommended for better app performance.

> 👉 **Recommendation: Use `React.lazy()` to import page templates**
>
> If you are using Gatsby 4 and React 18 in your app, using `React.lazy()` is highly recommend when defining your `componentResolver` option.
>
> Using `React.lazy()` ensures your app’s JavaScript bundle does not include the code for each template on every page. Instead, a page’s template will only be loaded when needed.
