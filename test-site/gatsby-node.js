const dotenv = require('dotenv')

dotenv.config()

exports.createPages = (gatsbyContext) => {
  const { actions } = gatsbyContext
  const { createRedirect } = actions

  createRedirect({
    fromPath: '/admin',
    toPath: `https://${process.env.GATSBY_PRISMIC_REPOSITORY_NAME}.prismic.io`,
    redirectInBrowser: true,
  })
}
