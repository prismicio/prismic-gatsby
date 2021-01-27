import * as gatsby from 'gatsby'
import { PartialDeep } from 'type-fest'

export const createGatsbyContext = (): PartialDeep<gatsby.NodePluginArgs> => ({
  createNodeId: jest.fn().mockImplementation((x) => x),
  createContentDigest: jest.fn().mockReturnValue('createContentDigest'),
  getNodesByType: jest.fn(),
  reporter: {
    verbose: jest.fn(),
  },
})
