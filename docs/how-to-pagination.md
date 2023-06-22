# Pagination

On this page, you'll learn how to implement pagination in your Gatsby project.

---

Pagination is helpful to break up long lists of content within your site. A list of blog posts, for example, could be split up into multiple pages, each displaying a certain number of posts per page.

There are many ways of approaching pagination. Gatsby's official page has its [pagination guide and example](https://www.gatsbyjs.com/docs/adding-pagination/). There are also dedicated plugins built by the community dedicated to pagination, for example, [gatsby-awesome-pagination](https://www.gatsbyjs.com/plugins/gatsby-awesome-pagination/).

Here we'll show you how to do it using [Gatsby Node APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#createPages). We want the homepage to display a list of titles of the existing posts, but we only want to render three posts per list, per page.

## List the pages in gatsby-node

In the `gatsby-node.js` file, we use the `createPages` method with our documents of the type Post.

We use a `posts.js` template to render the homepage with the path `'/'`. Then we create a variable called `numPages` and divide the total amount of documents (`posts.length`) between the number of documents we want on each page, in this case, three.

We loop through `numPages` and create a path using the index, like this: `/${i + 1}`. Then we pass the `limit` and `skip` values to the context.

```javascript
const path = require("path");

exports.createPages = async ({ graphql, actions }) => {
	const { createPage } = actions;

	const queryData = await graphql(`
		{
			allPrismicPost {
				nodes {
					id
					url
				}
			}
		}
	`);

	const posts = queryData.data.allPrismicPost.nodes;
	const numPages = Math.ceil(posts.length / 3);

	// Create the homepage
	createPage({
		path: "/",
		component: path.resolve(__dirname, "src/templates/posts.js"),
		context: {
			limit: 3,
			skip: 0,
		},
	});

	// Create listing pages
	Array.from({ length: numPages }).forEach((_, i) => {
		createPage({
			path: `/${i + 1}`,
			component: path.resolve(__dirname, "src/templates/posts.js"),
			context: {
				limit: 3,
				skip: i * 3,
			},
		});
	});
};
```

## Write the page query with pagination

In the `posts.js` file, we create a query that uses the `limit` and `skip` values from the context. It will retrieve a title from each post, and the `currentPage` and `pageCount` fields.

Then, we import and render the `<Pagination />` component (we'll create it in the next step) and pass the `pageInfo` data to it.

By default, the results will not be sorted in any particular order. You can change that change by using the [sort argument](./03-fetch-data.md#sort-order-your-results).

```javascript
import * as React from "react";
import { graphql } from "gatsby";

import { Pagination } from "../components/pagination";

export const query = graphql`
	query MyQuery($limit: Int!, $skip: Int!) {
		allPrismicPost(
			sort: { fields: data___date, order: DESC }
			limit: $limit
			skip: $skip
		) {
			nodes {
				data {
					title {
						text
					}
				}
			}
			pageInfo {
				currentPage
				pageCount
			}
		}
	}
`;

const Homepage = ({ data }) => {
	if (!data) return null;
	const docs = data.allPrismicPost;
	return (
		<div>
			{docs.nodes.map((postTitle, i) => {
				return (
					<div key={i}>
						<h1>{postTitle.data.title.text}</h1>
						<hr />
					</div>
				);
			})}
			<Pagination pageInfo={docs.pageInfo} />
		</div>
	);
};

export default Homepage;
```

## Create a pagination component

In the `/components` folder, create a `Pagination.js` file. Our component will perform two actions

1. Render a numeric pagination
1. Render previous and next buttons that enable and disable when needed

### 1. Numeric pagination

Retrieve the `currentPage` and `pageCount` from the props and then use an [Array.from](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/from) method to loop over the length of `pageCount`. We'll render each link using [Gatsby Link](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-link/).

The `numClass` variable will determine the `className` of the active and inactive links. This will be useful when you add styling to the numeric buttons.

Then, the `getPageNumberPath` function helps us resolve the correct path for the pagination.

```javascript
import * as React from "react";
import { Link } from "gatsby";

// Create URL path for numeric pagination
const getPageNumberPath = (currentIndex) => {
	if (currentIndex === 0) {
		return "/1";
	}
	return "/" + (currentIndex + 1);
};

export const Pagination = ({ pageInfo, path }) => {
	if (!pageInfo) return null;
	const { currentPage, pageCount } = pageInfo;

	return (
		<div className="pagination">
			{Array.from({ length: pageCount }, (_, i) => {
				let numClass = "pageNumber";
				if (currentPage === i + 1) {
					numClass = "currentPage";
				}
				return (
					<Link to={getPageNumberPath(i)} className={numClass} key={i + 1}>
						{i + 1}
					</Link>
				);
			})}
		</div>
	);
};
```

### 2. Previous and next buttons

The last step is to add navigation buttons for the previous and next pages.

Create two variables that will determine the correct path for the buttons. `prevPagePath`: creates a string subtracting the current page minus one, and `nextPagePath`: creates a string adding up the plus one to the current page.

Then `prevClass` and `nextClass` will determine the className of the links.

```javascript
import * as React from "react";
import { Link } from "gatsby";

// ...

export const Pagination = ({ pageInfo }) => {
	if (!pageInfo) return null;
	const { currentPage, pageCount } = pageInfo;

	// Create URL path for previous and next buttons
	const prevPagePath =
		currentPage - 1 === 1 ? "/1" : "/" + (currentPage - 1).toString();
	const nextPagePath = "/" + (currentPage + 1).toString();

	// Check if page is first or last to disable previous and next buttons
	const prevClass = currentPage === 1 ? "disabled" : "enabled";
	const nextClass = currentPage === pageCount ? "disabled" : "enabled";

	return (
		<div className="pagination">
			<Link className={prevClass} to={prevPagePath} rel="prev">
				{"<"}
			</Link>
			{/*  Numeric pagination goes here... */}
			<Link className={nextClass} to={nextPagePath} rel="next">
				{">"}
			</Link>
		</div>
	);
};
```

### Full pagination component

Here's how the component looks with everything in place. You can now use it in your project and add styles to it to match your design needs.

```javascript
import * as React from "react";
import { Link } from "gatsby";

// Create URL path for numeric pagination
const getPageNumberPath = (currentIndex) => {
	if (currentIndex === 0) {
		return "/1";
	}
	return "/" + (currentIndex + 1);
};

export const Pagination = ({ pageInfo }) => {
	if (!pageInfo) return null;
	const { currentPage, pageCount } = pageInfo;

	// Create URL path for previous and next buttons
	const prevPagePath =
		currentPage - 1 === 1 ? "/1" : "/" + (currentPage - 1).toString();
	const nextPagePath = "/" + (currentPage + 1).toString();

	// Check if page is first or last to disable previous and next buttons
	const prevClass = currentPage === 1 ? "disabled" : "enabled";
	const nextClass = currentPage === pageCount ? "disabled" : "enabled";

	return (
		<div className="pagination">
			<Link className={prevClass} to={prevPagePath} rel="prev">
				{"<"}
			</Link>
			{/*  Render numeric pagination  */}
			{Array.from({ length: pageCount }, (_, i) => {
				let numClass = "pageNumber";
				if (currentPage === i + 1) {
					numClass = "currentPage";
				}
				return (
					<Link to={getPageNumberPath(i)} className={numClass} key={i + 1}>
						{i + 1}
					</Link>
				);
			})}
			<Link className={nextClass} to={nextPagePath} rel="next">
				{">"}
			</Link>
		</div>
	);
};
```

## Working example

Download the project to have a working example straightway:

#### [object Object]

![](https://images.prismic.io/prismicio-docs-v3/58f521f8-ab0a-4991-b24f-3c9668710fa1_Blog-Image.png?auto=compress,format&rect=11,0,1656,1096&w=470&h=311)

**Minimalist sample blog** with a full-featured editor.

- [Preview](https://gatsby-prismic-blog.netlify.app/)
- [Explore](null)
