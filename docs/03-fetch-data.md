# Fetch Data

On this page, you'll learn how to retrieve content in from your Prismic repository using the Gatsby source plugin.

---

## Basic queries

The Prismic and Gatsby plugin schema gives you two options to write your queries using the API ID of your document's Custom Type (in these examples, the Custom Type’s API ID is `ExampleCustomType`):

1. `prismicExampleCustomType`: Queries a single document of a given type with optional filtering parameters.
1. `allPrismicExampleCustomType`: Queries all documents of a given type.

Here's a query for a single document:

```graphql
query MyQuery($id: String) {
  prismicExampleCustomType(id: { eq: $id }) {
    data {
      example_title {
        text
      }
    }
  }
}
```

Let's break down the syntax in the above example:

- `query`: The GraphQL reserved word for writing a query
- `MyQuery:` The name of the query
- `($id: String)`: The [variable declaration](https://www.gatsbyjs.com/docs/how-to/querying-data/page-query/#how-to-add-query-variables-to-a-page-query) for the page ID
- `prismicExampleCustomType(id: {eq: $id})`: The singleton query, filtered by the ID that is provided when the query runs
- `example_title:` The field to return

Here's a query for all documents of a repeatable type:

```graphql
query MyQuery {
  allPrismicExampleCustomType {
    nodes {
      data {
        example_title {
          text
        }
      }
    }
  }
}
```

This syntax is similar to the singleton query. However, it uses `allPrismicExampleCustomType` instead of `prismicExampleCustomType`, and it doesn't need to filter by ID.

We recommend that you store the response in a variable called `document`:

**Single document**:

```javascript
const document = data.prismicAuthor;
```

**Multiple queries**:

```javascript
const documents = data.allPrismicPages.nodes;
```

## Fragments

Fragments are a way to break down large queries into smaller ones, making them reusable and unique to a component's code. Page queries become more transparent, and Slice components more modular. Everything that belongs to the Slice is in the same component file.

In Prismic, Slice components and the Slice Zone are great use cases for Fragments.

For example, look at this page query that uses fragments. Both queries work the same way. Only fragments make the code shorter and more\*\* \*\*legible.

**with fragments**:

```graphql
query pageQuery($id: String, $lang: String) {
  prismicPage(id: { eq: $id }, lang: { eq: $lang }) {
    data {
      body {
        ... on PrismicSliceType {
          id
          slice_label
          slice_type
        }
        ...PageDataBodyEmailSignup
        ...PageDataBodyFullWidthImage
        ...PageDataBodyHeadlineWithButton
        ...PageDataBodyInfoWithImage
        ...PageDataBodyTextInfo
      }
    }
  }
}
```

**without fragments**:

```graphql
query pageQuery($id: String, $lang: String) {
  prismicPage(id: { eq: $id }, lang: { eq: $lang }) {
    data {
      body {
        ... on PrismicSliceType {
          id
          slice_label
          slice_type
        }
        ... on PrismicPageDataBodyEmailSignup {
          id
          primary {
            section_title {
              richText
            }
          }
          slice_type
        }
        ... on PrismicPageDataBodyFullWidthImage {
          id
          primary {
            image {
              alt
              url
            }
          }
          slice_type
        }
        ... on PrismicPageDataBodyHeadlineWithButton {
          id
          primary {
            description {
              richText
            }
          }
          slice_type
        }
        ... on PrismicPageDataBodyInfoWithImage {
          id
          primary {
            text {
              richText
            }
          }
          slice_label
        }
        ... on PrismicPageDataBodyTextInfo {
          id
          primary {
            section_title {
              richText
            }
          }
          slice_type
        }
      }
    }
  }
}
```

When you add a fragment to a component and then import that component to a page, Gatsby automatically knows that the fragment can be used in a page query. Learn more about fragments in the [Gatsby docs](https://www.gatsbyjs.org/docs/using-graphql-fragments/).

## Arguments

[Arguments](https://www.gatsbyjs.com/docs/reference/graphql-data-layer/graphql-api/#graphql-query-arguments) are parameters that you can add to filter the GraphQL response. They can be either [static or dynamic](https://www.gatsbyjs.com/docs/static-vs-normal-queries/). If they're dynamic, you pass your values in the form of [variables](https://www.gatsbyjs.com/docs/graphql-reference/#query-variables).

The most common arguments you will use are:

- `regex`: filter by specific terms
- `filter`: filter by a field
- `sort`: sort results
- `limit`: limit the number of results
- `skip`: skip over a number of results

Explore all the available filtering options in the [GraphQL Playground](https://www.gatsbyjs.com/docs/using-graphql-playground/), accessible at [http://localhost:8000/\_\_\_graphql](http://localhost:8000/___graphql), when running your project in development.

> **You can only use fields from the Static Zone as arguments**
>
> You can only use fields from your document's Static Zone as arguments. You can not use fields inside Slices as arguments.

### Filter by search

You can use the `regex` argument to search for documents that contain a given term or terms written as a regular expression in a string. It searches the term(s) in fields that retrieve string values, such ad the following field types:

- Rich Text
- Title
- Key Text
- UID
- Select

Here is an example to get all the Page type documents that mention the term "Art" in a Rich Text field with the API ID of `content`.

```graphql
query MyQuery {
  allPrismicPage(filter: { data: { content: { text: { regex: "/Art/i" } } } }) {
    nodes {
      data {
        content {
          richText
        }
      }
    }
  }
}
```

### Filter by metadata

Use the `filter` argument with metadata fields as values to filter out the response.

```graphql
query MyQuery {
  allPrismicPage(filter: { first_publication_date: { eq: "2021-11-15" } }) {
    nodes {
      uid
    }
  }
}
```

Here are all the available metadata fields with usage examples:

| Property                                     | Description                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| <strong>id</strong><br/>                     | <pre>filter: {id: {eq: &quot;WsDFGHJt5df7&quot;}}</pre>                   |
| <strong>uid</strong><br/>                    | <pre>filter: {uid: {eq: &quot;sample&quot;}}</pre>                        |
| <strong>first_publication_date</strong><br/> | <pre>filter: {first_publication_date: {eq: &quot;2021-12-03&quot;}}</pre> |
| <strong>last_publication_date</strong><br/>  | <pre>filter: {last_publication_date: {eq: &quot;2019-12-03&quot;}}</pre>  |
| <strong>lang</strong><br/>                   | <pre>filter: {lang: {eq: &quot;en-us&quot;}}</pre>                        |
| <strong>alternate_languages</strong><br/>    | <pre>filter: {alternate_languages: {lang: {eq: &quot;en-us&quot;}}}</pre> |
| <strong>tags</strong><br/>                   | <pre>filter: {tags: {eq: &quot;sports&quot;}}</pre>                       |

### Filter by a field

Use the `filter` argument with content fields as values to filter out the response

You can use Prismic fields at the top level of your documents to filter out the response. In the following example, we filter documents of the type 'Page' with a Boolean field with the API ID of `example_boolean` equal to `true`.

```graphql
query MyPages {
  allPrismicPage(filter: { data: { example_boolean: { eq: true } } }) {
    nodes {
      data {
        example_boolean
      }
    }
  }
}
```

Here are all the available content fields with usage examples.

| Property                                     | Description                                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| <strong>Title</strong><br/>                  | <pre>filter: {data: example_title: {text: {eq: &quot;Today&#39;s news&quot;}}}}</pre>                        |
| <strong>Rich Text </strong><br/>             | <pre>filter: {data: example_rich_text: {text: {eq: &quot;innovation&quot;}}}}</pre>                          |
| <strong>Image or Link to media</strong><br/> | <pre>filter: {data: {example_image: {url: {eq: &quot;https://images.prismic.io/repo/6e59446d&quot;}}}}</pre> |
| <strong>Content Relationship</strong><br/>   | <pre>filter: {data: {example_content_relationsip: {id: {eq: &quot;Wsdffgjoe3&quot;}}}}</pre>                 |
| <strong>Link</strong><br/>                   | <pre>filter: {data: {example_link: {url: {eq: &quot;https://prismic.io/&quot;}}}}</pre>                      |
| <strong>Date</strong><br/>                   | <pre>filter: {data: {example_date: {eq: &quot;2021-12-10&quot;}}}</pre>                                      |
| <strong>Timestamp</strong><br/>              | <pre>filter: {data: {example_timestamp: {eq: &quot;2021-12-16T06:00:00+0000&quot;}}}</pre>                   |
| <strong>Color</strong><br/>                  | <pre>(filter: {data: {example_color: {eq: &quot;#8a3535&quot;}}})</pre>                                      |
| <strong>Number</strong><br/>                 | <pre>(filter: {data: {example_number: {eq: &quot;100&quot;}}})</pre>                                         |
| <strong>Select or Key Text</strong><br/>     | <pre>filter: {data: {example_keytext: {eq: &quot;placeholder&quot;}}}</pre>                                  |
| <strong>Boolean</strong><br/>                | <pre>filter: {data: {example_boolean: {eq: &quot;true&quot;}}}</pre>                                         |
| <strong>Embed</strong><br/>                  | <pre>filter: {data: {example_embed: {author_name: {eq: &quot;Content creator&quot;}}}}</pre>                 |
| <strong>Geopoint</strong><br/>               | <pre>filter: {data: {example_geopoint: {latitude: {eq: 0.076904}, longitude: {eq: 32.95571}}}}</pre>         |
| <strong>Field in a Group</strong><br/>       | <pre>filter: {data: {example_group: {elemMatch: {example_boolean: {eq: true}}}}}</pre>                       |

### Sort results

The `sort` argument helps you order your query results with two parameters:

1. `fields`: specifies a Prismic metadata field or a content field API ID
1. `order`: determines if you want the results to be sorted ascending (`ASC`) or descending (`DESC`)

In this example, the results of the documents are sorted in ascending order `ASC` by `last_publication_date`:

```graphql
query MyPages {
  allPrismicPage(sort: { fields: last_publication_date, order: ASC }) {
    nodes {
      uid
    }
  }
}
```

### Limit results

You can limit the number of documents retrieved in your response. In this example, we limit the response to three documents:

```graphql
query MyPages {
  allPrismicPage(limit: 3) {
    nodes {
      uid
    }
  }
}
```

### Skip results

You can skip over some results. In this example query, we skip the first three results of the documents:

```graphql
query MyPages {
  allPrismicPage(skip: 3) {
    nodes {
      uid
    }
  }
}
```

## Selecting fields

Content from Prismic comes in more than a dozen types. Most of these are simple primitive values, like Numbers or Booleans. Others are more complex structured values, like Titles, Rich Texts, and Links.

### Fields

Prismic has 18 field types. Seven of those are simple fields that return a primitive value:

- Boolean
- Color
- Date
- Key Text
- Number
- Select
- Timestamp

Here's what retrieving any of these would look like:

```graphql
query MyQuery {
  prismicPage {
    data {
      example_number
    }
  }
}
```

The rest of the fields are objects with multiple properties that you can select. These fields are:

- Title and Rich Text
- Image
- Content Relationship
- Link
- Link to media
- Embed
- Geopoint
- Group

Let's take a look at examples of all the possible values you can retrieve from each of them:

**Title and Rich Text**:

```graphql
query MyQuery {
  prismicPage {
    data {
      example_title {
        text
        richText
        html
      }
    }
  }
}
```

**Image**:

```graphql
query MyQuery {
  prismicPost {
    data {
      example_image {
        url
        dimensions {
          width
          height
        }
        thumbnails {
          desktop {
            url
            dimensions {
              height
              width
            }
          }
          tablet {
            url
            dimensions {
              height
              width
            }
          }
        }
      }
    }
  }
}
```

**Content Relationship**:

```graphql
query MyQuery {
  prismicPost {
    data {
      example_content_relationship {
        link_type
        document {
          ... on PrismicExampleCustomType {
            url
            data {
              example_title {
                richText
              }
            }
          }
        }
      }
    }
  }
}
```

**Link**:

```graphql
query MyQuery {
  prismicPost {
    data {
      example_external_link {
        id
        isBroken
        lang
        link_type
        raw
        size
        slug
        tags
        target
        type
        uid
        url
      }
    }
  }
}
```

**Link to media**:

```graphql
query MyQuery {
  prismicPost {
    data {
      example_link_to_media {
        id
        isBroken
        lang
        link_type
        raw
        size
        slug
        tags
        target
        type
        uid
        url
        document
      }
    }
  }
}
```

**Embed**:

```graphql
query MyQuery {
  prismicPost {
    data {
      example_embed {
        author_name
        author_url
        embed_url
        height
        html
        provider_name
        provider_url
        thumbnail_height
        thumbnail_url
        thumbnail_width
        title
        type
        version
        width
      }
    }
  }
}
```

**Geopoint**:

```graphql
query MyQuery {
  prismicPost {
    data {
      example_geopoint {
        latitude
        longitude
      }
    }
  }
}
```

**Group**:

```graphql
query MyQuery {
  prismicPost {
    data {
      example_group {
        example_number_in_list
      }
    }
  }
}
```

### Nested Content

Content Relationship fields use the [union type](https://graphql.org/learn/schema/#union-types) to specify the content you need from a linked document.

In this example, we are telling the query to retrieve a document linked in the `example_content_relationship` field:

```graphql
query MyQuery {
  prismicPost {
    data {
      example_content_relationship {
        link_type
        document {
          ... on PrismicExampleCustomType {
            url
            data {
              example_title {
                richText
              }
            }
          }
        }
      }
    }
  }
}
```

### Slices

We use the [union type](https://graphql.org/learn/schema/#union-types) inside queries to specify each of the Slices we need from a Custom Type using the following syntax:

```plaintext
... on PrismicExampleCustomTypeDataBodyExampleSlice
```

Where `ExampleCustomType` is the name of your Custom Type and `ExampleSlice` is the Slice's name.

In the following example, we have a Page Custom Type with one Slice called `playlist` with fields in both the repeatable (`fields`) and non-repeatable (`primary`) zones:

```graphql
query MyQuery {
  prismicPage {
    data {
      body {
        ... on PrismicPageDataBodyPlaylist {
          slice_label
          slice_type
          primary {
            playlist_name {
              richText
            }
          }
          fields {
            song {
              url
            }
            author {
              richText
            }
          }
        }
      }
    }
  }
}
```

### Metadata fields

In singleton-type queries, the metadata fields are found in the first node of the query.

In repeatable type queries, the metadata fields are found inside edges > node.

Here's an example for a singleton query:

```graphql
query MyQuery {
  prismicPage {
    uid
    id
    lang
    type
    last_publication_date
    first_publication_date
    alternate_languages {
      lang
      type
      uid
      id
    }
  }
}
```

Here's an example for repeatable documents:

```graphql
query MyQuery {
  allPrismicPost {
    nodes {
      uid
      id
      lang
      type
      last_publication_date
      first_publication_date
      alternate_languages {
        lang
        type
        uid
        id
      }
    }
  }
}
```

## Next steps

After retrieving your Slices and fields, you're ready to template your content, preview your draft documents, and finally deploy your site. We'll detail how you can do that following pages.

- **Next article**: [Define Routes](./04-define-routes.md)
- **Previous article**: [Set up Prismic](./02-set-up-prismic.md)
