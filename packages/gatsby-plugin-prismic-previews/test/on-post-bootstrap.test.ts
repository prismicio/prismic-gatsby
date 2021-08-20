import test from 'ava'
import * as sinon from 'sinon'
import * as prismicMock from '@prismicio/mock'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'

import { onPostBootstrap } from '../src/gatsby-node'
import { createRuntime } from './__testutils__/createRuntime'

test('saves serialized typepaths to filesystem', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  const model = prismicMock.model.customType()

  const runtime = createRuntime(pluginOptions)
  runtime.registerCustomTypeModels([model])
  ;(gatsbyContext.getNodesByType as sinon.SinonStub).callsFake((type: string) =>
    type === 'PrismicPrefixTypePathType' ? runtime.typePaths : [],
  )

  await new Promise((callback) =>
    // @ts-expect-error - Partial gatsbyContext provided
    onPostBootstrap(gatsbyContext, pluginOptions, callback),
  )

  const writeTypePathsToFilesystemCall = (
    pluginOptions.writeTypePathsToFilesystem as sinon.SinonStub
  ).getCall(0).firstArg

  t.is(
    writeTypePathsToFilesystemCall.publicPath,
    'public/static/3e66cce7662062ad5137e62e8bb62096.json',
  )

  t.deepEqual(
    JSON.parse(writeTypePathsToFilesystemCall.serializedTypePaths),
    runtime.typePaths,
  )
})
