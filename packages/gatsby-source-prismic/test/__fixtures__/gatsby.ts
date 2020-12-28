import {
  DEFAULT_IMGIX_PARAMS,
  DEFAULT_LANG,
  DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
} from '../../src/constants'
import { PluginOptions, PrismicSchema } from '../../src/types'
import schemaFixture from './schema.json'

export const nodes = [{ id: 1 }, { id: 2 }, { id: 3 }]

export const gatsbyContext = {
  actions: {
    createNode: jest.fn(),
    createTypes: jest.fn(),
    touchNode: jest.fn(),
  },
  reporter: {
    info: jest.fn(),
    // .mockImplementation((args) => console.log(args)),
    warn: jest.fn(),
    // .mockImplementation((args) => console.warn(args)),
  },
  schema: {
    buildUnionType: jest.fn((config) => ({ kind: 'UNION', config })),
    buildObjectType: jest.fn((config) => ({ kind: 'OBJECT', config })),
    buildEnumType: jest.fn((config) => ({ kind: 'ENUM', config })),
  },
  getNodes: jest.fn().mockReturnValue(nodes),
  createNodeId: jest.fn().mockReturnValue('createNodeId'),
  createContentDigest: jest.fn().mockReturnValue('createContentDigest'),
}

export const pluginOptions: PluginOptions = {
  repositoryName: 'repositoryName',
  typePrefix: 'prefix',
  schemas: {
    page: schemaFixture as PrismicSchema,
  },
  lang: DEFAULT_LANG,
  webhookSecret: 'secret',
  imageImgixParams: DEFAULT_IMGIX_PARAMS,
  imagePlaceholderImgixParams: DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
  plugins: [],
}
