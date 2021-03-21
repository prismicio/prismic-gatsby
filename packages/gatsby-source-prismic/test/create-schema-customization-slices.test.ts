import test from 'ava'
import * as sinon from 'sinon'

import { PrismicFieldType } from '../src'
import { createSchemaCustomization } from '../src/gatsby-node'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { findCreateTypesCall } from './__testutils__/findCreateTypesCall'

test('creates types for each slice choice', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()

  pluginOptions.schemas = {
    foo: {
      Main: {
        slices: {
          type: PrismicFieldType.Slices,
          config: {
            choices: {
              foo: {
                type: PrismicFieldType.Slice,
                repeat: {
                  repeat_text: {
                    type: PrismicFieldType.Text,
                    config: {},
                  },
                },
                'non-repeat': {
                  non_repeat_text: {
                    type: PrismicFieldType.Text,
                    config: {},
                  },
                },
              },
              bar: {
                type: PrismicFieldType.Slice,
                repeat: {
                  repeat_text: {
                    type: PrismicFieldType.Text,
                    config: {},
                  },
                },
                'non-repeat': {
                  non_repeat_text: {
                    type: PrismicFieldType.Text,
                    config: {},
                  },
                },
              },
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
      kind: 'UNION',
      config: sinon.match({
        name: 'PrismicPrefixFooDataSlicesSlicesType',
        types: [
          'PrismicPrefixFooDataSlicesBar',
          'PrismicPrefixFooDataSlicesFoo',
        ],
        resolveType: sinon.match.func,
      }),
    }),
  )

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFooDataSlicesFoo',
        fields: {
          items: '[PrismicPrefixFooDataSlicesFooItem]',
          primary: 'PrismicPrefixFooDataSlicesFooPrimary',
          slice_type: 'String!',
          slice_label: 'String',
          id: sinon.match({
            type: 'ID!',
            resolve: sinon.match.func,
          }),
        },
        interfaces: ['PrismicSliceType'],
        extensions: { infer: false },
      }),
    }),
  )

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFooDataSlicesFooPrimary',
        fields: {
          non_repeat_text: 'String',
        },
      }),
    }),
  )

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFooDataSlicesFooItem',
        fields: {
          repeat_text: 'String',
        },
      }),
    }),
  )

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFooDataSlicesBar',
        fields: {
          items: '[PrismicPrefixFooDataSlicesBarItem]',
          primary: 'PrismicPrefixFooDataSlicesBarPrimary',
          slice_type: 'String!',
          slice_label: 'String',
          id: sinon.match({
            type: 'ID!',
            resolve: sinon.match.func,
          }),
        },
        interfaces: ['PrismicSliceType'],
        extensions: { infer: false },
      }),
    }),
  )

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFooDataSlicesBarPrimary',
        fields: {
          non_repeat_text: 'String',
        },
      }),
    }),
  )

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFooDataSlicesBarItem',
        fields: {
          repeat_text: 'String',
        },
      }),
    }),
  )
})

test('id field resolves to a unique id', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()

  pluginOptions.schemas = {
    foo: {
      Main: {
        slices: {
          type: PrismicFieldType.Slices,
          config: {
            choices: {
              foo: {
                type: PrismicFieldType.Slice,
                repeat: {
                  repeat_text: {
                    type: PrismicFieldType.Text,
                    config: {},
                  },
                },
                'non-repeat': {
                  non_repeat_text: {
                    type: PrismicFieldType.Text,
                    config: {},
                  },
                },
              },
            },
          },
        },
      },
    },
  }

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixFooDataSlicesFoo',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = {
    primary: {
      non_repeat_text: [{ type: 'paragraph', text: 'Rich Text', spans: [] }],
    },
    items: [],
  }
  const resolver = call.config.fields.id.resolve
  const res = await resolver(field)

  t.true(res === 'Prismic prefix foo data slices foo createContentDigest')
})
