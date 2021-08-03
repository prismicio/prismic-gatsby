import test from 'ava'
import * as sinon from 'sinon'
import * as prismicT from '@prismicio/types'
import * as prismicCustomTypes from '@prismicio/custom-types-client'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import kitchenSinkSchema from './__fixtures__/kitchenSinkSchema.json'
import kitchenSinkSharedSliceSchema from './__fixtures__/kitchenSinkSharedSliceSchema.json'

import { createSchemaCustomization } from '../src/gatsby-node'

test('creates type path nodes', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  pluginOptions.customTypeModels = [
    kitchenSinkSchema as prismicCustomTypes.CustomType,
  ]
  pluginOptions.sharedSliceModels = [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kitchenSinkSharedSliceSchema as prismicT.SharedSliceModel<any>,
  ]

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const calls = (gatsbyContext.actions.createNode as sinon.SinonStub)
    .getCalls()
    .filter(
      (call) => call.firstArg.internal.type === 'PrismicPrefixTypePathType',
    )
    .reduce((acc: Record<string, string>, call) => {
      acc[call.firstArg.path.join('.')] = call.firstArg.type

      return acc
    }, {})

  t.snapshot(calls)
})

test('field names with dashes are transformed with underscores by default', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  const dashifiedKitchenSinkSchemaJSON = Object.keys(
    kitchenSinkSchema.json,
  ).reduce((acc: prismicT.CustomTypeModel, tabName) => {
    const tab =
      kitchenSinkSchema.json[tabName as keyof typeof kitchenSinkSchema.json]

    acc[tabName] = Object.keys(tab).reduce(
      (tabAcc: prismicT.CustomTypeModelTab, fieldName) => {
        tabAcc[fieldName.replace(/_/g, '-')] =
          tab[fieldName as keyof typeof tab]

        return tabAcc
      },
      {},
    )

    return acc
  }, {})

  pluginOptions.customTypeModels = [
    {
      ...kitchenSinkSchema,
      json: dashifiedKitchenSinkSchemaJSON,
    } as prismicCustomTypes.CustomType,
  ]

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const calls = (gatsbyContext.actions.createNode as sinon.SinonStub)
    .getCalls()
    .filter(
      (call) => call.firstArg.internal.type === 'PrismicPrefixTypePathType',
    )
    .reduce((acc: Record<string, string>, call) => {
      acc[call.firstArg.path.join('.')] = call.firstArg.type

      return acc
    }, {})

  t.snapshot(calls)
})
