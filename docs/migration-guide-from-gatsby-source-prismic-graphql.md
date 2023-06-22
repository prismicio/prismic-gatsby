# Migrate to gatsby-source-prismic

How to migrate from the 'gatsby-source-prismic-graphql' plugin to the officially supported 'gatsby-source-prismic' plugin.

---

> **Prismic React Templating**
>
> These docs use the latest version `@prismicio/react`. Follow [the migration guide](https://prismic.io/docs/prismic-react-v2-migration-guide) to update your project if you're still using `prismic-reactjs` V1.

## Overview

This guide helps you migrate a project using `gatsby-source-prismic-graphql` to `gatsby-source-prismic`.

## The differences between the two plugins

Both plugins work with Prismic, but the setup and usage are different. Let's quickly review the differences:

[gatsby-source-prismic](https://github.com/angeloashmore/gatsby-source-prismic)

- You create dynamic pages with either the [File System Route API](https://www.gatsbyjs.com/docs/reference/routing/file-system-route-api/) or with the [createPages](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node#createPages) API
- Fetches data using Prismic's REST
- Works with Gatsby Cloud
- You add the [Link Resolver](https://prismic.io/docs/define-routes-gatsby) and the [HTML Serializer](https://prismic.io/docs/technologies/templating-rich-text-gatsby#the-html-serializer-function) inside the plugin configuration

gatsby-source-prismic-graphql

- You generate dynamic pages inside the plugin configuration
- It fetches data using Prismic's GraphQL API
- You manually add the Link Resolver and the HTML Serializer to the Rich Text fields.

---

## How to migrate

### 1. Install the new plugin

First, uninstall the old one:

**npm**:

```bash
npm uninstall -S gatsby-source-prismic-graphql
```

**Yarn**:

```bash
yarn remove gatsby-source-prismic-graphql
```

Then, install the new plugin and its required dependencies:

**npm**:

```bash
npm install gatsby-source-prismic gatsby-plugin-image @prismicio/react
```

**Yarn**:

```bash
yarn add gatsby-source-prismic gatsby-plugin-image @prismicio/react
```

### 2. Update the plugin configuration

Open the `gatsby-config.js` file and replace the plugin configuration with the new one. Learn how to configure the source plugin:

- [**Set up Prismic**](https://prismic.io/docs/set-up-prismic-gatsby)<br/>This article will show you how to install and configure the gatsby-source-prismic plugin.

Here is an example of what the new config looks like. Update it with the details that match your project:

```javascript
const linkResolver = require("./example-route-to-linkResolver");

module.exports = {
	plugins: [
		"gatsby-plugin-image",
		{
			resolve: "gatsby-source-prismic",
			options: {
				repositoryName: "your-repo-name",
				linkResolver: (doc) => linkResolver(doc),
				schemas: {
					page: require("./custom_types/page.json"),
					blog_post: require("./custom_types/blog_post.json"),
				},
			},
		},
	],
};
```

### 3. Refactor your queries

> **✔️ Test the queries**
>
> When running your project in development, you can open the GraphQL playground tool at [http://localhost:8000/\_\_graphql](http://localhost:8000/__graphql) to test and discover the new types and properties of your GraphQL schema.

Take a look at the differences in the GraphQL query syntax.

For these examples, we query for the documents of the type `page`. Filtering them by their UID and language and retrieving a few fields, like the `uid`, a Rich Text field with the API ID of `content`, and one Slice called `embed`.

**gatsby-source-prismic**:

```graphql
query MyPages($uid: String, $lang: String) {
	allPrismicPage(uid: { eq: $uid }, lang: { eq: $lang }) {
		nodes {
			uid
			data {
				content {
					richText
				}
				body {
					... on PrismicPageDataBodyEmbed {
						slice_type
					}
				}
			}
		}
	}
}
```

**gatsby-source-prismic-graphql**:

```graphql
query MyPages($uid: String, $lang: String) {
	prismic {
		allPages(uid: $uid, lang: $lang) {
			edges {
				node {
					_meta {
						uid
					}
					content
					body {
						... on PRISMIC_PageBodyEmbed {
							type
						}
					}
				}
			}
		}
	}
}
```

### 4. Create pages dynamically

Automatic page generation is managed in different ways between the two plugins.

**New plugin**: You can generate your dynamic pages the Gatsby way. Using the [File System Route API](https://www.gatsbyjs.com/docs/reference/routing/file-system-route-api/), or if you want more control over the page creation, you can use the [createPages](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node#createPages) API.

In this example, we use the **File System Route API **to generate pages for the page type in the `〜/src/pages/{PrismicPage.url}.js` file. This filename uses the nodes from the page query to create dynamic routes using the URLs defined in your LinkResolver.

```javascript
import * as React from "react";
import { graphql } from "gatsby";

export const PageTemplate = ({ data }) => {
	if (!data) return null;
	const doc = data.prismicPage;

	return (
		<section>
			<h1>{doc.data.example_key_text}</h1>
		</section>
	);
};

export const query = graphql`
	query PageQuery($id: String) {
		prismicPage(uid: { eq: $id }) {
			data {
				example_key_text
			}
		}
	}
`;

export default PageTemplate;
```

**Deprecated plugin:** Here, you needed to create your pages by providing a mapping configuration under the `pages` option in the plugin configuration in `gatsby-config.js`, like in the next example.

```javascript
{
  resolve: 'gatsby-source-prismic-graphql',
  options: {
    repositoryName: 'your-repo-name',
    pages: [{
      type: 'Page',
      match: '/page/:uid',
      previewPath: '/page',
      component: require.resolve('./src/templates/page.js'),
    }],
  }
}
```

## Differences in the structure of the schema

In the `gatsby-source-prismic` plugin, you'll often need to go one level deep after the field's API ID.

Some fields are the same in both plugins. Here are the fields that require no changes:

- Date
- Timestamp
- Color
- Key Text
- Select
- Number

The fields that have a different structures are:

- Title
- Rich Text
- Content Relationship
- Link and Link to media
- Embed
- Geopoint
- Group
- Image
- and general document metadata fields.

Take a look at the differences listed below to know what to change in your code.

> **Example API IDs**
>
> Note: In this example, the fields' API ID is the same as the field itself with the prefix `example_` appended at the beginning. e.g., **Embed field = example_embed**.

### Metadata

**New plugin**: The doc's metadata is found at the top level of the `node` key.

**Deprecated plugin**: Go one level down to the `_meta` key.

**gatsby-source-prismic**:

```graphql
query MyQuery {
	allPrismicPost {
		nodes {
			id
			uid
			type
			lang
		}
	}
}
```

**gatsby-source-prismic-graphql**:

```graphql
query MyQuery {
	prismic {
		allPosts {
			edges {
				node {
					_meta {
						id
						uid
						type
						lang
					}
				}
			}
		}
	}
}
```

### Rich Text and Titles

**New plugin**: Specify the fields you need `text`, `html`, and `richText`.

**Deprecated plugin**: Add the API ID of the field.

**gatsby-source-prismic**:

```graphql
example_rich_text {
  text
  html
  richText
}
```

**gatsby-source-prismic-graphql**:

```graphql
example_rich_text
```

### Image

**New plugin** Specify each value you're going to use; in this case, we're calling `url`, `alt`, `dimensions`, and the responsive `thumbnails` of the image.

**Deprecated plugin**: Add the API ID of the field.

**gatsby-source-prismic**:

```graphql
example_image {
  url
  alt
  dimensions {
    width
    height
  }
  thumbnails {...}
}
```

**gatsby-source-prismic-graphql**:

```graphql
example_image
```

### Content Relationship

In this example, we query a Content Relationship field that links to a doc of the type `event`, and we're retrieving its `uid`, `type`, and `lang`.

**gatsby-source-prismic**:

```graphql
example_content_relationship {
  document {
    ... on PrismicEvent {
      uid
      type
      lang
    }
  }
}
```

**gatsby-source-prismic-graphql**:

```graphql
example_content_relationship {
  ...on PRISMIC_Event {
    _meta{
      uid
      type
      lang
    }
  }
}
```

### Link and Link to Media

**New plugin**: Specify the `link_type` and `url` of the media file or website. You can also retrieve documents as you would do with a Content Relationship field.

**Deprecated plugin:** Use a Union type to specify the fields for each link type.

**gatsby-source-prismic**:

```graphql
example_link {
  link_type
  url
}
```

**gatsby-source-prismic-graphql**:

```graphql
example_link {
  __typename
  ...on PRISMIC__ExternalLink {
    url
  }
  ...on PRISMIC__ImageLink {
    url
    size
  }
  ...on PRISMIC_Event {
    title
    _meta {
      uid
      id
      type
    }
  }
}
```

### Embed

The Embed field has numerous values that can vary depending on the type of embed we add.

**New plugin**: Specify each of the available values that you want to retrieve.

**Deprecated plugin**: Add the API ID of the field.

**gatsby-source-prismic**:

```graphql
example_embed {
  type
  url
 {...}
}
```

**gatsby-source-prismic-graphql**:

```graphql
example_embed
```

### Geopoint

**New plugin:** Specify the `latitude` and `longitude` values.

**Deprecated plugin**: Add the API ID of the field.

**gatsby-source-prismic**:

```graphql
example_geopoint {
  latitude
  longitude
}
```

**gatsby-source-prismic-graphql**:

```graphql
example_geopoint
```

### Group

The field group's usage is almost the same in both plugins; you need to call the fields that the group contains. In these examples, the group has a Title field.

**gatsby-source-prismic**:

```graphql
example_group {
  example_title {
   html
   text
  }
}
```

**gatsby-source-prismic-graphql**:

```graphql
example_group {
  example_title
}
```

## Access the retrieved data

Example of how you'd access the retrieved data for each plugin.

**gatsby-source-prismic**:

```javascript
const data = data.allPrismicPage.nodes;
```

**gatsby-source-prismic-graphql**:

```javascript
const data = data.prismic.allPages.edges[0];
```

## Previews

You can enable Previews with the `gatsby-plugin-prismic-previews` plugin. Refer to the dedicated guide to learn how to configure this plugin:

- [**Previews with Gatsby**](https://prismic.io/docs/previews-gatsby)<br/>Use the preview plugin to make previews work.
