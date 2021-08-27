import test from 'ava'
import * as sinon from 'sinon'
import * as prismicM from '@prismicio/mock'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createMockCustomTypeModelWithFields } from './__testutils__/createMockCustomTypeModelWithFields'
import { createPluginOptions } from './__testutils__/createPluginOptions'

import { createSchemaCustomization } from '../src/gatsby-node'

test('uses inferred type with link extension', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  const customTypeModel = createMockCustomTypeModelWithFields(t, {
    integrationFields: prismicM.model.integrationFields({ seed: t.title }),
  })
  customTypeModel.id = 'foo'

  pluginOptions.customTypeModels = [customTypeModel]

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFooDataType',
        fields: {
          integrationFields: sinon.match({
            type: 'PrismicPrefixFooDataIntegrationFieldsIntegrationType',
            extensions: { link: {} },
          }),
        },
      }),
    }),
  )
})

test('creates inferred type using path', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  const customTypeModel = createMockCustomTypeModelWithFields(t, {
    integrationFields: prismicM.model.integrationFields({ seed: t.title }),
  })
  customTypeModel.id = 'foo'

  pluginOptions.customTypeModels = [customTypeModel]

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFooDataIntegrationFieldsIntegrationType',
        interfaces: ['Node'],
        extensions: { infer: true },
      }),
    }),
  )
})
