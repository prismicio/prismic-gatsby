import fs from 'fs'
import { SourceNodesArgs, ParentSpanPluginArgs } from 'gatsby'

import { sourceNodes, onPreExtractQueries } from '../src/gatsby-node'

import mockSchema from './__fixtures__/schema.json'

jest.mock('fs')

const PROGRAM_DIRECTORY_PATH = '/__PROGRAM_DIRECTORY__/'

const mockActions = {
  deletePage: jest.fn(),
  createPage: jest.fn(),
  deleteNode: jest.fn(),
  deleteNodes: jest.fn(),
  createNode: jest.fn(),
  touchNode: jest.fn(),
  createNodeField: jest.fn(),
  createParentChildLink: jest.fn(),
  setWebpackConfig: jest.fn(),
  replaceWebpackConfig: jest.fn(),
  setBabelOptions: jest.fn(),
  setBabelPlugin: jest.fn(),
  setBabelPreset: jest.fn(),
  createJob: jest.fn(),
  createJobV2: jest.fn(),
  setJob: jest.fn(),
  endJob: jest.fn(),
  setPluginStatus: jest.fn(),
  createRedirect: jest.fn(),
  addThirdPartySchema: jest.fn(),
  createTypes: jest.fn(),
  createFieldExtension: jest.fn(),
}

const mockGatsbyContext: ParentSpanPluginArgs = {
  pathPrefix: 'pathPrefix',
  boundActionCreators: mockActions,
  actions: mockActions,
  loadNodeContent: jest.fn(),
  store: {
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    getState: jest
      .fn()
      .mockReturnValue({ program: { directory: PROGRAM_DIRECTORY_PATH } }),
    replaceReducer: jest.fn(),
  },
  emitter: {
    addListener: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    prependListener: jest.fn(),
    prependOnceListener: jest.fn(),
    removeListener: jest.fn(),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
    setMaxListeners: jest.fn(),
    getMaxListeners: jest.fn(),
    listeners: jest.fn(),
    rawListeners: jest.fn(),
    emit: jest.fn(),
    eventNames: jest.fn(),
    listenerCount: jest.fn(),
  },
  getNodes: jest.fn(),
  getNode: jest.fn(),
  getNodesByType: jest.fn(),
  hasNodeChanged: jest.fn(),
  reporter: {
    stripIndent: jest.fn(),
    format: jest.fn(),
    setVerbose: jest.fn(),
    setNoColor: jest.fn(),
    panic: jest.fn().mockImplementation((msg: string | Error, err?: Error) => {
      throw err ?? msg
    }),
    panicOnBuild: jest
      .fn()
      .mockImplementation((msg: string | Error, err?: Error) => {
        throw err ?? msg
      }),
    error: jest.fn(),
    uptime: jest.fn(),
    success: jest.fn(),
    verbose: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    activityTimer: jest.fn().mockReturnValue({
      start: jest.fn(),
      end: jest.fn(),
    }),
    createProgress: jest.fn(),
  },
  getNodeAndSavePathDependency: jest.fn(),
  cache: {
    set: jest.fn(),
    get: jest.fn(),
  },
  createNodeId: jest.fn().mockReturnValue('createNodeId'),
  createContentDigest: jest.fn().mockReturnValue('createContentDigest'),
  tracing: {
    tracer: {},
    parentSpan: {},
    startSpan: jest.fn(),
  },
  parentSpan: {},
  schema: {
    buildObjectType: jest
      .fn()
      .mockImplementation((config) => ({ kind: 'OBJECT', config })),
    buildUnionType: jest.fn().mockImplementation((config) => ({
      kind: 'UNION',
      config,
    })),
    buildInterfaceType: jest
      .fn()
      .mockImplementation((config) => ({ kind: 'INTERFACE', config })),
    buildInputObjectType: jest
      .fn()
      .mockImplementation((config) => ({ kind: 'INPUT', config })),
    buildEnumType: jest
      .fn()
      .mockImplementation((config) => ({ kind: 'ENUM', config })),
    buildScalarType: jest
      .fn()
      .mockImplementation((config) => ({ kind: 'SCALAR', config })),
  },
}

const mockSourceNodesGatsbyContext: SourceNodesArgs = {
  ...mockGatsbyContext,
  traceId: 'initial-sourceNodes',
  waitForCascadingActions: false,
}

const pluginOptions = {
  repositoryName: 'repositoryName',
  plugins: [],
  schemas: { page: mockSchema },
}

describe('sourceNodes', () => {
  beforeEach(() => jest.clearAllMocks())

  test('creates types', async () => {
    await sourceNodes!(mockSourceNodesGatsbyContext, pluginOptions)

    expect(mockSourceNodesGatsbyContext.actions.createTypes).toMatchSnapshot()
  })

  test('creates nodes', async () => {
    await sourceNodes!(mockSourceNodesGatsbyContext, pluginOptions)

    expect(mockSourceNodesGatsbyContext.actions.createNode).toMatchSnapshot()
  })

  test('writes type paths to filesystem', async () => {
    await sourceNodes!(mockSourceNodesGatsbyContext, pluginOptions)

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
  test('copies fragments file to program cache', async () => {
    onPreExtractQueries!(mockGatsbyContext, pluginOptions)

    const call = (fs.copyFileSync as jest.Mock).mock.calls[0]

    expect(call[0]).toMatch(/\/fragments.js$/)
    expect(call[1]).toBe(
      '/__PROGRAM_DIRECTORY__/.cache/fragments/gatsby-source-prismic-fragments.js',
    )
  })
})
