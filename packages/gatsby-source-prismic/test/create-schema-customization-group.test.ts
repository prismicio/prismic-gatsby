import test from 'ava'
import * as sinon from 'sinon'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'

import { PrismicFieldType } from '../src'
import { createSchemaCustomization } from '../src/gatsby-node'

test('creates types with each field', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  pluginOptions.schemas = {
    foo: {
      Main: {
        group: {
          type: PrismicFieldType.Group,
          config: {
            fields: {
              boolean: { type: PrismicFieldType.Boolean, config: {} },
              color: { type: PrismicFieldType.Color, config: {} },
              date: { type: PrismicFieldType.Date, config: {} },
              embed: { type: PrismicFieldType.Embed, config: {} },
              geo_point: { type: PrismicFieldType.GeoPoint, config: {} },
              image: { type: PrismicFieldType.Image, config: {} },
              link: { type: PrismicFieldType.Link, config: {} },
              number: { type: PrismicFieldType.Number, config: {} },
              select: { type: PrismicFieldType.Select, config: {} },
              structured_text: {
                type: PrismicFieldType.StructuredText,
                config: {},
              },
              text: { type: PrismicFieldType.Text, config: {} },
              timestamp: { type: PrismicFieldType.Timestamp, config: {} },
            },
          },
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
        name: 'PrismicPrefixFooDataGroup',
        fields: {
          boolean: 'Boolean',
          color: 'String',
          date: { type: 'Date', extensions: { dateformat: {} } },
          embed: { type: 'PrismicPrefixEmbedType', extensions: { link: {} } },
          geo_point: 'PrismicGeoPointType',
          image: 'PrismicPrefixFooDataGroupImageImageType',
          link: 'PrismicPrefixLinkType',
          number: 'Float',
          select: 'String',
          structured_text: 'PrismicPrefixStructuredTextType',
          text: 'String',
          timestamp: { type: 'Date', extensions: { dateformat: {} } },
        },
      }),
    }),
  )
})
