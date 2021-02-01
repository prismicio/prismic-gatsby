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
          navigation: require('./schemas/navigation.json'),
          not_found_page: require('./schemas/not_found_page.json'),
          page: require('./schemas/page.json'),
          settings: require('./schemas/settings.json'),
        },
      },
    },
    {
      resolve: 'gatsby-plugin-prismic-previews',
      options: {
        repositoryName: process.env.GATSBY_PRISMIC_REPOSITORY_NAME,
        // accessToken: process.env.PRISMIC_ACCESS_TOKEN,
        typePrefix: 'prefix',
        toolbar: 'legacy',
      },
    },
  ],
}
