require('dotenv').config()

module.exports = {
  siteMetadata: {
    title: 'Gatsby + Prismic Starter',
    description:
      'Kick off your next, great Gatsby + Prismic project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.',
    author: 'angeloashmore',
  },
  plugins: [
    'gatsby-plugin-react-helmet-async',
    'gatsby-plugin-catch-links',
    {
      resolve: 'gatsby-source-prismic',
      options: {
        repositoryName: process.env.GATSBY_PRISMIC_REPOSITORY_NAME,
        accessToken: process.env.PRISMIC_ACCESS_TOKEN,
        schemas: {
          page: require('./schemas/page.json'),
        },
        linkResolver: require('./src/linkResolver').linkResolver,
      },
    },
    {
      resolve: 'gatsby-plugin-prismic-previews',
      options: {
        repositoryName: process.env.GATSBY_PRISMIC_REPOSITORY_NAME,
      },
    },
  ],
}
