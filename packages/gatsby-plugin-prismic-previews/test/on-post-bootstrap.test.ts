import fs from 'fs'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'

import { onPostBootstrap } from '../src/gatsby-node'

jest.mock('fs')

test('saves serialized typepaths to filesystem', async () => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()

  const typePaths = [
    { path: ['foo'], type: 'foo' },
    { path: ['foo', 'bar'], type: 'bar' },
    { path: ['foo', 'bar', 'baz'], type: 'baz' },
  ]
  ;(gatsbyContext.getNodesByType as jest.Mock).mockImplementation(
    (type: string) => (type === 'PrismicPrefixTypePathType' ? typePaths : []),
  )

  await new Promise((callback) =>
    // @ts-expect-error - Partial gatsbyContext provided
    onPostBootstrap(gatsbyContext, pluginOptions, callback),
  )

  expect(fs.writeFileSync).toHaveBeenCalledWith(
    'public/static/9e387d94c04ebf0e369948edd9c66d2b.json',
    JSON.stringify({
      foo: 'foo',
      'foo.bar': 'bar',
      'foo.bar.baz': 'baz',
    }),
  )
})
