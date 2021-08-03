import test from 'ava'
import * as sinon from 'sinon'
import * as prismicT from '@prismicio/types'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { findCreateTypesCall } from './__testutils__/findCreateTypesCall'

import { createSchemaCustomization } from '../src/gatsby-node'

test('creates types for each slice choice', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  pluginOptions.customTypeModels = [
    {
      label: 'Foo',
      id: 'foo',
      status: true,
      repeatable: true,
      json: {
        Main: {
          slices: {
            type: prismicT.CustomTypeModelFieldType.Slices,
            fieldset: 'Slice zone',
            config: {
              labels: {},
              choices: {
                foo: {
                  type: prismicT.CustomTypeModelSliceType.Slice,
                  fieldset: 'Slice zone',
                  description: '',
                  icon: '',
                  display: prismicT.CustomTypeModelSliceDisplay.List,
                  repeat: {
                    repeat_text: {
                      type: prismicT.CustomTypeModelFieldType.Text,
                      config: { label: 'Text' },
                    },
                  },
                  'non-repeat': {
                    non_repeat_text: {
                      type: prismicT.CustomTypeModelFieldType.Text,
                      config: { label: 'Text' },
                    },
                  },
                },
                bar: {
                  type: prismicT.CustomTypeModelSliceType.Slice,
                  fieldset: 'Slice zone',
                  description: '',
                  icon: '',
                  display: prismicT.CustomTypeModelSliceDisplay.List,
                  repeat: {
                    repeat_text: {
                      type: prismicT.CustomTypeModelFieldType.Text,
                      config: { label: 'Text' },
                    },
                  },
                  'non-repeat': {
                    non_repeat_text: {
                      type: prismicT.CustomTypeModelFieldType.Text,
                      config: { label: 'Text' },
                    },
                  },
                },
                baz: {
                  type: prismicT.CustomTypeModelSliceType.SharedSlice,
                },
              },
            },
          },
        },
      },
    },
  ]
  pluginOptions.sharedSliceModels = [
    {
      type: prismicT.CustomTypeModelSliceType.SharedSlice,
      name: 'Baz',
      description: 'description',
      id: 'baz',
      variations: [
        {
          id: 'variation_1',
          description: 'description',
          name: 'Variation 1',
          items: {
            foo: {
              type: prismicT.CustomTypeModelFieldType.Text,
              config: { label: 'Foo' },
            },
          },
          primary: {
            foo: {
              type: prismicT.CustomTypeModelFieldType.Text,
              config: { label: 'Foo' },
            },
          },
          docURL: 'docURL',
          version: 'version',
        },
        {
          id: 'variation_2',
          description: 'description',
          name: 'Variation 2',
          items: {
            foo: {
              type: prismicT.CustomTypeModelFieldType.Text,
              config: { label: 'Foo' },
            },
          },
          primary: {
            foo: {
              type: prismicT.CustomTypeModelFieldType.Text,
              config: { label: 'Foo' },
            },
          },
          docURL: 'docURL',
          version: 'version',
        },
      ],
    },
  ]

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
          'PrismicPrefixBazVariation1',
          'PrismicPrefixBazVariation2',
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
          items: '[PrismicPrefixFooDataSlicesFooItem!]!',
          primary: 'PrismicPrefixFooDataSlicesFooPrimary!',
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
          items: '[PrismicPrefixFooDataSlicesBarItem!]!',
          primary: 'PrismicPrefixFooDataSlicesBarPrimary!',
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

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'UNION',
      config: sinon.match({
        name: 'PrismicPrefixBaz',
        types: ['PrismicPrefixBazVariation1', 'PrismicPrefixBazVariation2'],
        resolveType: sinon.match.func,
      }),
    }),
  )

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixBazVariation1',
        fields: {
          items: '[PrismicPrefixBazVariation1Item!]!',
          primary: 'PrismicPrefixBazVariation1Primary!',
          slice_type: 'String!',
          slice_label: 'String',
          variation: 'String!',
          version: 'String!',
          id: sinon.match({
            type: 'ID!',
            resolve: sinon.match.func,
          }),
        },
        interfaces: ['PrismicSliceType', 'PrismicSharedSliceType'],
        extensions: { infer: false },
      }),
    }),
  )

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixBazVariation1Item',
        fields: {
          foo: 'String',
        },
      }),
    }),
  )

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixBazVariation1Primary',
        fields: {
          foo: 'String',
        },
      }),
    }),
  )

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixBazVariation2',
        fields: {
          items: '[PrismicPrefixBazVariation2Item!]!',
          primary: 'PrismicPrefixBazVariation2Primary!',
          slice_type: 'String!',
          slice_label: 'String',
          variation: 'String!',
          id: sinon.match({
            type: 'ID!',
            resolve: sinon.match.func,
          }),
        },
        interfaces: ['PrismicSliceType', 'PrismicSharedSliceType'],
        extensions: { infer: false },
      }),
    }),
  )

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixBazVariation2Item',
        fields: {
          foo: 'String',
        },
      }),
    }),
  )

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixBazVariation2Primary',
        fields: {
          foo: 'String',
        },
      }),
    }),
  )
})

test('id field resolves to a unique id', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  pluginOptions.customTypeModels = [
    {
      label: 'Foo',
      id: 'foo',
      status: true,
      repeatable: true,
      json: {
        Main: {
          slices: {
            type: prismicT.CustomTypeModelFieldType.Slices,
            fieldset: 'Slice zone',
            config: {
              labels: {},
              choices: {
                foo: {
                  type: prismicT.CustomTypeModelSliceType.Slice,
                  fieldset: 'Slice zone',
                  description: '',
                  icon: '',
                  display: prismicT.CustomTypeModelSliceDisplay.List,
                  repeat: {
                    repeat_text: {
                      type: prismicT.CustomTypeModelFieldType.Text,
                      config: { label: 'Text' },
                    },
                  },
                  'non-repeat': {
                    non_repeat_text: {
                      type: prismicT.CustomTypeModelFieldType.Text,
                      config: { label: 'Text' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ]

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
