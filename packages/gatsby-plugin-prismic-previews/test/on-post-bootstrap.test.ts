import test from 'ava'
import * as sinon from 'sinon'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'

import { onPostBootstrap } from '../src/gatsby-node'

test('saves serialized typepaths to filesystem', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  const typePaths = [
    { path: ['foo'], type: 'foo' },
    { path: ['foo', 'bar'], type: 'bar' },
    { path: ['foo', 'bar', 'baz'], type: 'baz' },
  ]
  const serializedTypePaths = JSON.stringify({
    foo: 'foo',
    'foo.bar': 'bar',
    'foo.bar.baz': 'baz',
  })

  ;(gatsbyContext.getNodesByType as sinon.SinonStub).callsFake((type: string) =>
    type === 'PrismicPrefixTypePathType' ? typePaths : [],
  )

  await new Promise((callback) =>
    // @ts-expect-error - Partial gatsbyContext provided
    onPostBootstrap(gatsbyContext, pluginOptions, callback),
  )

  t.true(
    (pluginOptions.writeTypePathsToFilesystem as sinon.SinonStub).calledWith({
      publicPath: 'public/static/9e387d94c04ebf0e369948edd9c66d2b.json',
      serializedTypePaths,
    }),
  )
})
