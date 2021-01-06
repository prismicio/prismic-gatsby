const dotenv = require('dotenv')

dotenv.config()

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-prismic',
      options: {
        repositoryName: process.env.PRISMIC_REPOSITORY_NAME,
        accessToken: process.env.PRISMIC_ACCESS_TOKEN,
        schemas: {
          page: require('./schemas/page.json'),
        },
      },
    },
  ],
}
