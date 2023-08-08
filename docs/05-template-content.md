# Template Content

On this page, you'll learn how to template Prismic content in your Gatsby application.

---

> **🕙 Before reading**
>
> This page assumes that you have [saved the response](./03-fetch-data.md#save-the-response) of your queries in a variable named `document`.

## Intro to templating

[Prismic content](https://prismic.io/docs/core-concepts#fields) comes in more than a dozen field types. Most of those fields contain primitive values, like Numbers or Booleans. Others contain more complex structured values, like Titles, Rich Texts, and Links.

Before starting to template your content, you need to query [data from your documents](./03-fetch-data.md#structure-of-the-api-response). Once you've queried your data, you might access a single data field like this:

**Multiple documents**:

```javascript
documents[0].data.example_key_text;
```

**Single document**:

```javascript
document.data.example_key_text;
```

If you queried for multiple documents, you will likely want to loop over the results array and template each data field, like this:

```html
<ul>
	{documents.map((item) =>{
	<li key="{item.id}">{item.data.example_key_text}</li>
	})}
</ul>
```

### Primitive value fields

These are the fields that retrieve primitive values:

- Boolean
- Color
- Key Text
- Number
- Select
- Date
- Timestamp

The Date and Timestamp fields are both delivered as Strings on the API, but they can do more with a bit of parsing. You can use Gatsby's built-in [date and timestamp formatting capabilities](https://www.gatsbyjs.com/docs/graphql-reference/#dates).

Once you've already learned how to [retrieve fields](./03-fetch-data.md) from a query, you can inject them directly into your application:

**Boolean**:

```javascript
<span>{document.data.example_boolean}</span>
// Output: "<span>true</span>"
```

**Color**:

```javascript
<span>{document.data.example_color}</span>
// Output: "<span>#a24196</span>"
```

**Key Text**:

```javascript
<span>{document.data.example_key_text}</span>
// Output: "<span>Lorem ipsum</span>"
```

**Number**:

```javascript
<span>{document.data.example_number}</span>
// Output: "<span>7</span>"
```

**Select**:

```javascript
<span>{document.data.example_select}</span>
// Output: "<span>Lorem</span>"
```

**Date**:

```javascript
<span>{document.data.example_date}</span>
// Output: "<span>2023-10-22</span>"
```

**Timestamp**:

```javascript
<span>{document.data.example_timestamp}</span>
// Output: "<span>2023-10-22T05:00:00+0000</span>"
```

### Structured fields

The rest of the fields in Prismic are objects that you need to parse. Below, we'll explain how to work with the following structured fields:

- Geopoint
- Embed
- Group
- Rich Text
- Link
- Image

## Geopoint

The GeoPoint field is an object with two properties: `latitude` and `longitude`. Access these properties directly:

```javascript
const lat = document.data.example_geopoint.latitude;
const long = document.data.example_geopoint.longitude;

const text = `Coordinates for this location: Latitude ${lat}, longitude is ${long}.`;
// Output: "Coordinates for this location: Latitude is 48.85392410000001, longitude is 2.2913515000000073."
```

## Embed

You can template an Embed field using the `html` value from the response:

```javascript
<div dangerouslySetInnerHTML={{ __html: document.data.example_embed.html }} />

// Outputs as raw html
```

## Group

To template a Group, you can use a `map()` method to loop over the results. Here's a usage example:

```html
<ul>
	{document.data.example_group.map((item) => (
	<li key="{item.id}">{item.example_key_text} {item.example_number}</li>
	))}
</ul>

// Outputs as a list of items
```

## Rich Text and Titles

Rich Text and Titles are delivered in an array that contains information about the text structure. Use the `richText` field and the [`<PrismicRichText>`](https://prismic.io/docs/technical-reference/prismicio-react#prismicrichtext) component from the `@prismicio/react` package.

```javascript
import { PrismicRichText } from "@prismicio/react";

<PrismicRichText field={document.data.example_rich_text.richText} />;
```

> **Using custom React components**
>
> To modify the output of a Rich Text field, provide a `component` list to override the components prop. The list of components maps an element type to its React component. Here is an example using a custom component for first-level headings and paragraphs.
>
> ```
> <PrismicRichText
>   field={document.data.example_rich_text}
>   components={{
>     heading1: ({ children }) => <Heading>{children}</Heading>,
>     paragraph: ({ children }) => <p className="paragraph">{children}</p>,
>   }}
> />
> ```
>
> Learn more about customizing Rich Text output in [HTML Serializing](https://prismic.io/docs/html-serializer).

## Links and Content Relationships

The Link field allows you to link to an external webpage, an internal Prismic document, or an item in your Media Library (like a PDF). The Content Relationship field allows you to link specifically to an internal Prismic document.

There are two things that you might want to do with a link:

- Link to the web (To an internal document, to an external page, or media item)
- Pull in content from another document

### Link to the web

`<PrismicLink>` automatically resolves your external links, but you need to use [Gatsby's Link](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-link/) component to create links between internal pages.

Wrap your app with `<PrismicProvider>` in a centralized location such as the `gatsby-browser.js` and `gatsby-ssr.js` files, and configure the `internalLinkComponent` prop to use Gatsby's `<Link>` for internal links made with [Content Relationship fields](https://prismic.io/docs/core-concepts/link-content-relationship#content-relationship-configuration).

```javascript
import * as React from "react";
import { PrismicProvider } from "@prismicio/react";
import { Link } from "gatsby";

function App({ children }) {
	return (
		<PrismicProvider
			internalLinkComponent={({ href, ...props }) => (
				<Link to={href} {...props} />
			)}
		>
			{children}
		</PrismicProvider>
	);
}
```

After that, pass your Link or Content Relationship field to `<PrismicLink>` and it will automatically render the correct route:

```javascript
import { PrismicLink } from "@prismicio/react";

<PrismicLink field={document.data.example_content_relationship}>
	Example Link
</PrismicLink>;
```

### Pull content from a linked document

To access the data from a linked document, access the `document.data` node from the linked doc retrieved from the query.

For example, here we have a Content Relationship field called `example_content_relationship` linked to another Custom Type. We retrieve a Key Text field that has an API ID of `author_name`:

```javascript
<p>Written by: {document.data.example_content_relationship.data.author_name}</p>
// <strong>Written by: Jane Doe</strong>
```

## Images

[Image fields](https://prismic.io/docs/image) can have alt text, copyright, and alternate responsive views, which can also have their alt text. If an Image field is configured with multiple sizes, its images can be queried using the `thumbnails` field. Each thumbnail within the field can be queried just like its primary image.

You can template images using an `img` tag, or a `picture` tag if you have multiple responsive thumbnail views:

**<img/>**:

```javascript
<img
	src={document.data.example_image.url}
	alt={document.data.example_image.alt}
/>
```

**<picture/>**:

```javascript
<picture>
   <source
     srcSet={document.data.example_image.thumbnails.mobile.url : ''}
     alt={document.data.example_image.thumbnails.mobile.alt : ''}
     media="(max-width: 500px)"
   />
   <source
     srcSet={document.data.example_image.thumbnails.tablet.url : ''}
     alt={document.data.example_image.thumbnails.tablet.alt : ''}
     media="(max-width: 1100px)"
   />
   <img
     src={document.data.example_image.url : ''}
     alt={document.data.example_image.alt : ''}
   />
</picture>
```

## Image processing

Images from Prismic can be automatically optimized and scaled using Gatsby's image plugin, [gatsby-plugin-image](https://www.gatsbyjs.com/plugins/gatsby-plugin-image).

You can process image data for `gatsby-plugin-image` using one of the following methods:

- **On-the-fly transformed using Imgix (recommended)**: Images are not downloaded to your computer or server and instead are transformed using Prismic's [Imgix](https://imgix.com/) integration to resize images on the fly.
- **Locally transformed at build-time**: Images are downloaded to your computer or server, resizing images at build-time.

You can apply image processing to any Image field and its thumbnails on a document. Image processing of inline images added to Rich Text fields is currently not supported.

### Imgix transformed images

This method manipulates images on Imgix's servers at request time, eliminating the need to download and resize images on your computer or server. This results in faster build times.

You can query the image and its alt for `gatsby-plugin-image` like in the following example:

```graphql
query Home {
	prismicPage {
		data {
			example_image {
				gatsbyImageData
				alt
			}
		}
	}
}
```

Then, pass your Image and alt values to `<GatsbyImage>` component:

```javascript
import { GatsbyImage } from "gatsby-plugin-image";

const Page = ({ data }) => {
	return (
		<div>
			<GatsbyImage
				image={data.prismicPage.data.example_image.gatsbyImageData}
				alt={data.prismicPage.data.example_image.alt}
			/>
		</div>
	);
};
```

Arguments can be passed to the `gatsbyImageData` field to change its presentation. See [Gatsby's official documentation on the Gatsby Image plugin](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/) to learn more about the available arguments.

### Locally transformed images

This method allows images to be downloaded to your computer or server and resized locally. Images are served from the same host as the rest of your app. This incurs additional build time as image processing is time-consuming.

To use local image processing, you need the following plugins in your project's `gatsby-config.js`:

- [gatsby-plugin-image](https://www.gatsbyjs.com/plugins/gatsby-plugin-image)
- [gatsby-plugin-sharp](https://www.gatsbyjs.com/plugins/gatsby-plugin-sharp/)
- [gatsby-transformer-sharp](https://www.gatsbyjs.com/plugins/gatsby-transformer-sharp/)

You must list which files should be downloaded in the [`shouldDownloadFiles`](./technical-reference-gatsby-source-prismic-v5.md) option of the plugin config in `gatsby-config.js`. By default, no files are downloaded. Then you can query image data for `gatsby-plugin-image`'s `GatsbyImage` component like in the following example.

**sample query**:

```graphql
query Pages {
	allPrismicPage {
		nodes {
			data {
				photo {
					localFile {
						childImageSharp {
							gatsbyImageData
						}
					}
				}
			}
		}
	}
}
```

**Sample gatsby-config.js**:

```javascript
module.exports = {
	plugins: [
		{
			resolve: "gatsby-source-prismic",
			options: {
				// Alongside your other options...
				shouldDownloadFiles: {
					// Download a Page `photo` image:
					"page.data.photo": true,
				},
			},
		},
		"gatsby-plugin-image",
		"gatsby-plugin-sharp",
		"gatsby-transformer-sharp",
	],
};
```

Arguments can be passed to the `gatsbyImageData` field to change its presentation. See [Gatsby's official documentation on the Gatsby Image plugin](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/) to learn more about the available arguments.

## Slices

To render Slices, use the `<SliceZone>` component from `@prismicio/react` to iterate over each Slice and pass them props to render the correct one.

The following example has two Slices: `image_gallery` and `quote`. First, we create an `index.js` file in a `slices` folder. This will gather an object with all the Slice components.

```javascript
import * as React from "react";

export const components = {
	quote: React.lazy(() => import("./QuoteSlice")),
	image_gallery: React.lazy(() => import("./ImageGallerySlice")),
};
```

Then, we import that file into the page where we render the Slice Zone. The `components` prop receives the list of React components for each type of Slice while the `slices` prop receives the Slice Zone array:

```javascript
// Truncated page file example
import { SliceZone } from "@prismicio/react";

import { components } from "../slices";

const PageTemplate = ({ data }) => {
	const pageContent = data.prismicPage;

	return <SliceZone slices={pageContent.data.body} components={components} />;
};

// ...
```

- **Next article**: [Preview Drafts](./06-preview-drafts.md)
- **Previous article**: [Define Routes](./04-define-routes.md)
