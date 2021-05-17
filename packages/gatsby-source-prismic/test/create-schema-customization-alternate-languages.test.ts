import test from 'ava'
import * as sinon from 'sinon'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { findCreateTypesCall } from './__testutils__/findCreateTypesCall'

import { createSchemaCustomization } from '../src/gatsby-node'

test('creates base types', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixAlternateLanguageType',
        fields: {
          id: 'ID',
          type: 'String',
          lang: 'String',
          uid: 'String',
          document: {
            type: 'PrismicPrefixAllDocumentTypes',
            resolve: sinon.match.func,
            extensions: { link: {} },
          },
          raw: {
            type: 'JSON',
            resolve: sinon.match.func,
          },
        },
      }),
    }),
  )
})

test('document field resolves to linked node ID', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixAlternateLanguageType',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = {
    type: 'foo',
    id: 'id',
    uid: 'uid',
    lang: 'lang',
  }
  const resolver = call.config.fields.document.resolve
  const res = await resolver(field)

  t.true(res === `Prismic prefix ${field.id}`)
})
