# gatsby-source-prismic

Source plugin for pulling documents into Gatsby from prismic.io repositories.

## Install

`npm install --save gatsby-source-prismic`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-prismic`,
    options: {
      repositoryName: `your_repository_name`,
      accessToken: `your_acces_token`,
    },
  },
]
```

## How to query

You can query Document nodes created from prismic.io like the following:

```graphql
{
  allPrismicDocument {
    edges {
      node {
        id
        data {
          # Your fields here
        }
      }
    }
  }
}
```

If the field is of type RichText or Title, HTML, text, and raw values are
available:

```graphql
{
  allPrismicDocument {
    edges {
      node {
        id
        data {
          title {
            text
          }
          content {
            html
          }
          footnote {
            raw {
              type
              text
              spans {
                type
                start
                end
              }
            }
          }
        }
      }
    }
  }
}
```
