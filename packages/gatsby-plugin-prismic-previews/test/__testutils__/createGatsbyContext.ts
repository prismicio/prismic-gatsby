import * as sinon from 'sinon'
import * as gatsby from 'gatsby'
import { PartialDeep } from 'type-fest'

export const createGatsbyContext = (): PartialDeep<gatsby.NodePluginArgs> => ({
  createNodeId: sinon.stub().callsFake((x) => x),
  createContentDigest: sinon.stub().returns('createContentDigest'),
  getNodesByType: sinon.stub(),
  reporter: {
    verbose: sinon.stub(),
  },
})
