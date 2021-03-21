import test from 'ava'
import * as sinon from 'sinon'

import { PrismicFieldType } from '../src'
import { createSchemaCustomization } from '../src/gatsby-node'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'

test('uses inferred type with link extension', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()

  pluginOptions.schemas = {
    foo: {
      Main: {
        integration: { type: PrismicFieldType.IntegrationFields, config: {} },
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
          integration: sinon.match({
            type: 'PrismicPrefixFooDataIntegrationIntegrationType',
            extensions: { link: {} },
          }),
        },
      }),
    }),
  )
})

test('creates inferred type using path', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()

  pluginOptions.schemas = {
    foo: {
      Main: {
        integration: { type: PrismicFieldType.IntegrationFields, config: {} },
      },
    },
  }

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFooDataIntegrationIntegrationType',
        interfaces: ['Node'],
        extensions: { infer: true },
      }),
    }),
  )
})
