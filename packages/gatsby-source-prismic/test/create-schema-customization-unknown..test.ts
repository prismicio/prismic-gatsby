import test from 'ava'
import * as sinon from 'sinon'

import { createSchemaCustomization } from '../src/gatsby-node'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'

test('uses JSON type', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()

  pluginOptions.schemas = {
    foo: {
      Main: {
        unknown: {
          // @ts-expect-error - We purposely want to use a type outside the enum of know types.
          type: 'unknown',
          config: {},
        },
      },
    },
  }

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFooDataType',
        fields: {
          unknown: sinon.match({
            type: 'JSON',
            resolve: sinon.match.func,
          }),
        },
      }),
    }),
  )
})

test('prints message about unknown type', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()

  pluginOptions.schemas = {
    foo: {
      Main: {
        unknown: {
          // @ts-expect-error - We purposely want to use a type outside the enum of know types.
          type: 'unknown',
          config: {},
        },
      },
    },
  }

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.reporter.info as sinon.SinonStub).calledWith(
      sinon.match(/unknown field type/i),
    ),
  )
})
