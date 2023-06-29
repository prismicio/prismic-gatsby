# Migration Guide: gatsby-source-prismic V2 to V3

This migration guide will help you upgrade the gatsby-source-prismic plugin from version V2 to V3 on your Gatsby project.

---

## What has changed?

The v3 release includes three major features to improve the developer and content editor experience.

- **Schemas**: Custom Types and fields integrated into Gatsby's GraphQL data system.
- **Previews**: Content editors can preview content before publishing without rebuilding the entire site.
- **Imgix-backed gatsby-image**: Significantly reduce build times by utilizing Imgix's URL-based image manipulation when using gatsby-image.

This release also fixes several long-standing issues due to the new schema processing.

- Gatsby knows about fields defined on a Custom Type but with no content. This previously required developers to create "placeholder" documents with every field filled with mock content.
- Rich Text and Title fields always return the expected result. Adding an Image or Embed field as the first piece of content to a Rich Text field will not break the plugin.
- Accessing linked documents on Link fields no longer requires using a strange single-item array.

## Updating your dependencies

The very first thing you will need to do is update your dependencies.

### Update Gatsby

Update your package.json to use at least `v2.5.0` of Gatsby.

```json
{
	"dependencies": {
		"gatsby": "^2.5.0"
	}
}
```

### Update gatsby-source-prismic version

Update your `package.json` to use v3 of `gatsby-source-prismic`.

```json
{
	"dependencies": {
		"gatsby-source-prismic": "^3.0.0"
	}
}
```

### Update React

Previewing Prismic documents before publishing requires [React hooks](https://reactjs.org/docs/hooks-intro.html). If your project is not already on a release of React that includes hooks, update your version of `react` and `react-dom`.

```json
{
	"dependencies": {
		"react": "^16.8.0",
		"react-dom": "^16.8.0"
	}
}
```

## Handling breaking changes

### Provide Custom Type schemas

In **v2**, Custom Types and their fields broke in cases where fields were empty in your Prismic repository. Gatsby didn't know about these fields and threw GraphQL errors if queried.

In **v3**, providing Custom Type schemas to the plugin is required to tell Gatsby exactly which Custom Types and fields are available, even if they are empty.

1. Copy the JSON schema from Prismic for each Custom Type into your project. `〜/src/custom_types/<custom_type_id>.json` is the recommended location.
1. In `gatsby-config.js`, provide the schemas to the plugin options on the schemas key as an object of Custom Type ids.

**After**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				schemas: {
					page: require("./src/custom_types/page.json"),
					blog_post: require("./src/custom_types/blog_post.json"),
				},
				// All other plugin options...
			},
		},
	],
};
```

**Before**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				// All other plugin options...
			},
		},
	],
};
```

Note that the key for each custom type is the **API ID** set in Prismic. This is usually snake_case by default.

### Access linked documents

In **v2**, Link fields that point to a Prismic document provided the document data on the `example_link.document` field as one item array. This was required to tell Gatsby that the document's type could be any of your Custom Types.

In **v3**, the `example_link.document` field is no longer an array but a direct reference to the linked document.

In your GraphQL queries, add the fragment syntax to your document field if not already present. The fragment type must refer to the linked document's type.

**After**:

```javascript
export const query = graphql`
	query MyQuery {
		prismicPage {
			data {
				example_link {
					document {
						... on PrismicExampletype {
							uid
						}
					}
				}
			}
		}
	}
`;
```

**Before**:

```javascript
query MyQuery {
  prismicPage {
    data {
      example_link {
        document {
          uid
        }
      }
    }
  }
}
```

When accessing `document`, use it like any other object field, not an array.

**After**:

```javascript
const uid = data.prismicPage.data.example_link.document.uid;
```

**Before**:

```javascript
const uid = data.prismicPage.data.example_link.document[0].uid;
```

### Replace local images with Imgix-processed ones

In **v2**, Image fields provided a `localFile` field with a locally downloaded copy of the image to allow `gatsby-transformer-sharp` to provide `gatsby-image` integration.

In **v3**, this Imgix's URL-based image manipulation replaces it. It can significantly reduce your build times if your site is image-heavy because it doesn't do the image processing at build time.

Using Imgix is an optional but recommended change if your site does **not** use SVG placeholder images as it is currently not supported.

`localFile` will continue to be supported.

1. In your GraphQL queries, replace `localFile.childImageSharp.fluid` and` localFile.childImageSharp.fluid` with `fluid` and `fixed`, respectively. And replace `GatsbyImageFluid` and `GatsbyImageFixed` fragments with `GatsbyPrismicImageFluid` and `GatsbyPrismicImageFixed`.

**After**:

```javascript
export const query = graphql`
	query MyQuery {
		prismicPage {
			data {
				example_image {
					fluid(maxWidth: 1000) {
						...GatsbyPrismicImageFluid
					}
				}
			}
		}
	}
`;
```

**Before**:

```javascript
export const query = graphql`
	query MyQuery {
		prismicPage {
			data {
				example_image {
					localFile {
						childImageSharp {
							fluid(maxWidth: 1000) {
								...GatsbyImageFluid
							}
						}
					}
				}
			}
		}
	}
`;
```

2. When providing image data to `gatsby-image`, access the image data using the new path.

**After**:

```javascript
const fluid = data.prismicPage.data.example_image.fluid;
```

**Before**:

```javascript
const fluid =
	data.prismicPage.data.example_image.localFile.childImageSharp.fluid;
```

### Replace shouldNormalizeImage with shouldDownloadImage

In **v2**, the `shouldNormalizeImage` plugin option allowed enabling or disabling downloading an image locally to make it available for `gatsby-transformer-sharp`. This defaulted to true for all images.

In **v3**, `shouldNormalizeImage` is renamed to `shouldDownloadImage` and defaults to `false` for all images.

If you use Imgix for all of your images, you can remove `shouldNormalizeImage` and leave `shouldDownloadImage` as the default.

**After**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				// All other plugin options...
			},
		},
	],
};
```

**Before**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				// All other plugin options...
				shouldNormalizeImage: () => true,
			},
		},
	],
};
```

If you wish to continue using `gatsby-transformer-sharp` for image transformations, change `shouldNormalizeImage` to `shouldDownloadImage` and ensure it returns true for all images requiring modifications.

**After**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				// All other plugin options...
				shouldDownloadImage: () => true,
			},
		},
	],
};
```

**Before**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				// Along with your other options...
				shouldNormalizeImage: () => true,
			},
		},
	],
};
```

### Namespace image thumbnails

In **v2**, Image fields contained the image thumbnail data at the same level as the primary image data. For example, if you had a `mobile` thumbnail size, the `mobile` field would be the same level as the primary Image's `url` field. This could potentially cause conflicts if a thumbnail name took the name of an existing Image field.

In **v3**, Image thumbnail fields are nested under a `thumbnails` field.

In your GraphQL queries, move Image thumbnails under the `thumbnail` field.

**After**:

```javascript
export const query = graphql`
	query MyQuery {
		prismicPage {
			data {
				example_image {
					url
					thumbnails {
						mobile {
							url
						}
					}
				}
			}
		}
	}
`;
```

**Before**:

```javascript
export const query = graphql`
	query MyQuery {
		prismicPage {
			data {
				example_image {
					url
					mobile {
						url
					}
				}
			}
		}
	}
`;
```

When accessing a thumbnail, use the `thumbnails` property.

**After**:

```javascript
const mobileUrl = data.prismicPage.data.example_image.thumbnails.mobile.url;
```

**Before**:

```javascript
const mobileUrl = data.prismicPage.data.example_image.mobile.url;
```

### Using raw fields

In **v2**, certain field types contain a `raw` field populated with Prismic's custom representation of formatted text. This required you to list all child fields, such as `spans` for a Rich Text field.

In **v3**, `raw` is now a `JSON` type, removing the need to request child fields explicitly. All child fields will automatically be returned as a JSON object.

**After**:

```javascript
export const query = graphql`
	query MyQuery {
		prismicPage {
			data {
				example_rich_text {
					raw
				}
			}
		}
	}
`;
```

**Before**:

```javascript
export const query = graphql`
	query MyQuery {
		prismicPage {
			data {
				example_rich_text {
					raw {
						spans
					}
				}
			}
		}
	}
`;
```

### Replace dataString with dataRaw

> **The dataRaw field will be deprecated**
>
> We don't recommend using the `dataRaw` as it is deprecated in newer versions of the plugin

In **v2**, `dataString` was available to allow querying the raw API data as a fallback. This was the node's data run through `JSON.stringify`.

In **v3**, `dataString` is deprecated and replaced by `dataRaw`. Like the `raw` fields, `dataRaw` is now a `JSON` type, meaning you can query the field without needing to specify the child fields. Unlike `dataString`, `dataRaw` will return a JSON object, removing the need to run `JSON.parse`.

Note that the `dataRaw` field is not recommended and is included as an escape hatch if the untouched data is needed.

**After**:

```javascript
export const query = graphql`
	query MyQuery {
		prismicPage {
			dataRaw
		}
	}
`;
```

**Before**:

```javascript
export const query = graphql`
	query MyQuery {
		prismicPage {
			dataString
		}
	}
`;
```

## Things to know

### Previews have their plugin

To enable the preview configuration, you need to migrate the `gatsby-source-prismic` plugin [from v3 to v4](https://prismic.io/docs/gatsby-source-prismic-v3-to-v4) and then [configure the previews separately](https://prismic.io/docs/previews-gatsby) with the `gatsby-plugin-prismic-previews` plugin.

### Type paths file in /public

The new schema system builds a map of your Custom Types' fields to their GraphQL type. This is used internally to ensure fields are transformed correctly depending on their type.

The same map is used in the front-end when previewing documents. The plugin saves a JSON file in your public folder for the preview system to use the map. This file is then fetched in the browser during a preview.

The type paths file looks something like this:

```json
[
	{ "path": ["page"], "type": "PrismicPage" },
	{ "path": ["page", "uid"], "type": "String" },
	{ "path": ["page", "data"], "type": "PrismicPageDataType" },
	{
		"path": ["page", "data", "parent"],
		"type": "PrismicLinkType"
	},
	{
		"path": ["page", "data", "title"],
		"type": "PrismicStructuredTextType"
	},
	{ "path": ["page", "data", "featured_image"], "type": "PrismicImageType" },
	{
		"path": ["page", "data", "body"],
		"type": "[PrismicPageBodySlicesType]"
	},
	{ "path": ["page", "data", "body", "text"], "type": "PrismicPageBodyText" },
	{
		"path": ["page", "data", "body", "text", "primary"],
		"type": "PrismicPageBodyTextPrimaryType"
	},
	{
		"path": ["page", "data", "body", "text", "primary", "text"],
		"type": "PrismicStructuredTextType"
	}
]
```

You can override the filename's prefix in your plugin options with the `typePathsFilenamePrefix` option.
