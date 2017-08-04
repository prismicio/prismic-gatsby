# gatsby-source-prismic

Source plugin for pulling documents into Gatsby from prismic.io repositories.

## Install

`npm install --save gatsby-source-prismic`

## How to use

### Using Delivery API

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-prismic`,
    options: {
      respositoryName: `your_repository_name`,
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
        uid
        data {
          title {
            type
            text
          }
        }
      }
    }
  }
}
```
