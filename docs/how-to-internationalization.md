# Internationalization

This article helps collect all the resources you need to utilize Prismic's multi-language and localization feature when building a Gatsby website.

---

## 1. Add locales to your repository

Go to your [Dashboard](https://prismic.io/dashboard/), and select your Prismic repository. Then go to _Settings > Translations and Locales,_ and [add all the languages](https://prismic.io/docs/core-concepts/languages-locales) you need.

Prismic offers a robust library of locale codes, but you can create a [custom locale](https://prismic.io/docs/core-concepts/languages-locales#add-custom-locales) if yours isn't on the list. Once your locales are configured, you can create documents and translations, [navigate the locales, copy the content](https://prismic.io/docs/core-concepts/navigate-languages-copy-content), and more.

## 2. Create localized page routes

Create a [Route Resolver](https://prismic.io/docs/route-resolver) to generate the localized routes for your site and declare it in your gatsby plugin configuration.

In this example, we have a repository with two locales. English (en-us) which is the master locale, and French locale(fr-fr). Here's an example of what we want the URLs to look like:

- Home type: `/en-us` & `/fr-fr`
- Page type: `/en-us/about-us` & `/fr-fr/a-propos-de-nous`

**gatsby-config.js**:

```javascript
const routes = [
	{
		type: "homepage",
		path: "/:lang?",
	},
	{
		type: "page",
		path: "/page/:lang?/:uid",
	},
];
```

**linkResolver.js**:

```javascript
exports.linkResolver = (doc) => {
	switch (doc.type) {
		case "home": {
			return `/${doc.lang}`;
		}

		case "page": {
			return `/${doc.lang}/${doc.uid}`;
		}

		default:
			return "/";
	}
};
```

The Resolvers generate the correct routes that we'll use to [dynamically create pages](./04-define-routes.md#create-dynamic-pages) with [Gatsby Node APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/) or with the [File System Route API](https://www.gatsbyjs.com/docs/reference/routing/file-system-route-api/).

## 3. Query by language

Once you have set up your dynamic routes and created your documents and translations in your repository, you'll need to query the documents by language. You'll use the `lang` value to query the documents by language.

In this example, we query the documents of the type Page. It will determine the language of the documents by the `$lang: String` variable in the query:

```javascript
import * as React from "react";
import { graphql } from "gatsby";

const Page = ({ data }) => {
	if (!data) return null;
	const pageContent = data.prismicPage;

	return (
		<div>
			<h1>{pageContent.data.title.text}</h1>
		</div>
	);
};

export const query = graphql`
	query pageQuery($id: String, $lang: String) {
		prismicPage(id: { eq: $id }, lang: { eq: $lang }) {
			lang
			alternate_languages {
				id
				type
				lang
				uid
			}
			data {
				title {
					text
				}
			}
		}
	}
`;

export default Page;
```

## Create a language switcher

Now that you've built dynamic localized pages and routes, you need to create a navigation button so users can select to switch between languages on your website. This can be anything from a `<select>` element if you have many languages, a button, or a boolean toggle switch if you only have two.

We'll show you how to build a selection component that lists the current and alternative languages in this example.

### Get the current and alternate languages

The first step is to get the current `lang` and the `alternate_languages` from the query to pass to the language switcher.

Please take a look at our example. After retrieving these values from the query, we pass them as props to a LanguageSwitcher component that we'll create in the next step.

```javascript
import * as React from "react";
import { graphql } from "gatsby";

import { LanguageSwitcher } from "../components/LanguageSwitcher";

const Page = ({ data }) => {
	if (!data) return null;
	const pageContent = data.prismicPage;

	return (
		<div>
			<h1>{pageContent.data.title.text}</h1>
			<LanguageSwitcher
				lang={pageContent.lang}
				altLangs={pageContent.alternate_languages}
			/>
		</div>
	);
};

export const query = graphql`
	query pageQuery($id: String, $lang: String) {
		prismicPage(id: { eq: $id }, lang: { eq: $lang }) {
			lang
			alternate_languages {
				id
				type
				lang
				uid
			}
			data {
				title {
					text
				}
			}
		}
	}
`;

export default Page;
```

### Create a language switcher component

In the `/src/components` folder, create a `LangSwitcher.js` file. Get the `lang` and `altLangs` values that we previously passed as props. We'll use [Gatsby's navigate function](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-link/#how-to-use-the-navigate-helper-function) to resolve the navigation of the links between routers in the `<select>` element and the Link Resolver to direct to the correct URL.

```javascript
import * as React from "react";
import { navigate } from "gatsby";

import { linkResolver } from "../utils/linkResolver";

export const LanguageSwitcher = ({ lang, altLang }) => {
	// Render the current language
	const currentLangOption = (
		<option value={lang}>{lang.slice(0, 2).toUpperCase()}</option>
	);

	// Render all the alternate language options
	const alternateLangOptions = altLang.map((altLang, index) => (
		<option value={linkResolver(altLang)} key={`alt-lang-${index}`}>
			{altLang.lang.slice(0, 2).toUpperCase()}
		</option>
	));

	// Trigger select change event
	const handleLangChange = (event) => {
		navigate(event.target.value);
	};

	return (
		<li className="language-switcher">
			<select value={lang} onChange={handleLangChange}>
				{currentLangOption}
				{alternateLangOptions}
			</select>
		</li>
	);
};
```

You'll have a selection component that lists all the available locales in your repository so visitors can quickly switch between locales.
