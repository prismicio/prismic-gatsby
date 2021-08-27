import test from 'ava'
import * as sinon from 'sinon'
import * as prismicM from '@prismicio/mock'

import { createAllNamedMockFieldModels } from './__testutils__/createAllNamedMockFieldModels'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createMockCustomTypeModelWithFields } from './__testutils__/createMockCustomTypeModelWithFields'
import { createPluginOptions } from './__testutils__/createPluginOptions'

import { createSchemaCustomization } from '../src/gatsby-node'

test('creates types with each field', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  const customTypeModel = createMockCustomTypeModelWithFields(t, {
    group: {
      ...prismicM.model.group({ seed: t.title }),
      config: {
        label: 'Group',
        fields: createAllNamedMockFieldModels(t),
      },
    },
  })
  customTypeModel.id = 'foo'

  pluginOptions.customTypeModels = [customTypeModel]

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFooDataGroup',
        fields: {
          boolean: 'Boolean',
          color: 'String',
          contentRelationship: 'PrismicPrefixLinkType',
          date: { type: 'Date', extensions: { dateformat: {} } },
          embed: { type: 'PrismicPrefixEmbedType', extensions: { link: {} } },
          geoPoint: 'PrismicGeoPointType',
          image: 'PrismicPrefixFooDataGroupImageImageType',
          integrationFields: {
            type: 'PrismicPrefixFooDataGroupIntegrationFieldsIntegrationType',
            extensions: { link: {} },
          },
          keyText: 'String',
          link: 'PrismicPrefixLinkType',
          linkToMedia: 'PrismicPrefixLinkType',
          number: 'Float',
          richText: 'PrismicPrefixStructuredTextType',
          select: 'String',
          timestamp: { type: 'Date', extensions: { dateformat: {} } },
          title: 'PrismicPrefixStructuredTextType',
        },
      }),
    }),
  )
})
