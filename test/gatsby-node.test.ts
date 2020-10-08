import fs from 'fs'
import { SourceNodesArgs, ParentSpanPluginArgs, CreateSchemaCustomizationArgs } from 'gatsby'

import { sourceNodes, onPreExtractQueries, createSchemaCustomization } from '../src/gatsby-node'

import mockSchema from './__fixtures__/schema.json'

jest.mock('fs')

const PROGRAM_DIRECTORY_PATH = '/__PROGRAM_DIRECTORY__/'

const pluginOptions = {
  repositoryName: 'repositoryName',
  plugins: [],
  schemas: { page: mockSchema },
}

describe('sourceNodes', () => {
  beforeEach(() => jest.clearAllMocks())

  const mockGatsbyContext: SourceNodesArgs = {
    // @ts-expect-error - partial implementation
    actions: {
      createTypes: jest.fn(),
      createNode: jest.fn(),
    },
    // @ts-expect-error - partial implementation
    store: {
      getState: jest
        .fn()
        .mockReturnValue({ program: { directory: PROGRAM_DIRECTORY_PATH } }),
    },
    // @ts-expect-error - partial implementation
    reporter: {
      activityTimer: jest
        .fn()
        .mockReturnValue({ start: jest.fn(), end: jest.fn() }),
      error: jest.fn(),
      panic: jest.fn<never, any>((msg: string | Error, err?: Error) => {
        throw err ?? msg
      }),
      verbose: jest.fn(),
    },
    // @ts-expect-error - partial implementation
    schema: {
      buildObjectType: jest
        .fn()
        .mockImplementation((config) => ({ kind: 'OBJECT', config })),
      buildUnionType: jest.fn().mockImplementation((config) => ({
        kind: 'UNION',
        config,
      })),
    },
    createNodeId: jest.fn().mockReturnValue('createNodeId'),
    createContentDigest: jest.fn().mockReturnValue('createContentDigest'),
    // @ts-expect-error - partial implementation
    cache: {
      get: jest.fn(),
    },
  }

  test('creates types', async () => {

    const mockCreateSchemaCustomizationArgs = mockGatsbyContext as unknown as CreateSchemaCustomizationArgs
 
    await createSchemaCustomization(mockCreateSchemaCustomizationArgs, pluginOptions)

    expect(mockCreateSchemaCustomizationArgs.actions.createTypes).toMatchSnapshot()
  })

  test('creates nodes', async () => {
    await sourceNodes(mockGatsbyContext, pluginOptions)

    expect(mockGatsbyContext.actions.createNode).toMatchSnapshot()
  })

  test('writes type paths to filesystem', async () => {
    await sourceNodes(mockGatsbyContext, pluginOptions)

    expect(
      (fs.writeFileSync as jest.Mock).mock.calls[0][0],
    ).toMatchInlineSnapshot(
      `"/__PROGRAM_DIRECTORY__/public/prismic-typepaths---9769f52526da286b236e9bd2cb0d0291.json"`,
    )

    // Ensure valid JSON.
    expect(
      JSON.parse((fs.writeFileSync as jest.Mock).mock.calls[0][1]),
    ).toMatchSnapshot()
  })
})

describe('onPreExtractQueries', () => {
  const mockGatsbyContext: ParentSpanPluginArgs = {
    // @ts-expect-error - partial implementation
    store: {
      getState: jest
        .fn()
        .mockReturnValue({ program: { directory: PROGRAM_DIRECTORY_PATH } }),
    },
  }

  test('copies fragments file to program cache', async () => {
    onPreExtractQueries(mockGatsbyContext, pluginOptions)

    const call = (fs.copyFileSync as jest.Mock).mock.calls[0]

    expect(call[0]).toMatch(/\/fragments.js$/)
    expect(call[1]).toBe(
      '/__PROGRAM_DIRECTORY__/.cache/fragments/gatsby-source-prismic-fragments.js',
    )
  })
})
