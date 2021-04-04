const dotenv = require('dotenv')

dotenv.config()

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-prismic',
      options: {
        repositoryName: process.env.GATSBY_PRISMIC_REPOSITORY_NAME,
        accessToken: process.env.PRISMIC_ACCESS_TOKEN,
        typePrefix: 'prefix',
        schemas: {
          kitchen_sink: require('./schemas/kitchen_sink.json'),
        },
      },
    },
    {
      resolve: 'gatsby-plugin-prismic-previews',
      options: {
        repositoryName: process.env.GATSBY_PRISMIC_REPOSITORY_NAME,
        typePrefix: 'prefix',
      },
    },
    process.env.ANALYZE === 'true' &&
      'gatsby-plugin-webpack-bundle-analyser-v2',
  ].filter(Boolean),
}
