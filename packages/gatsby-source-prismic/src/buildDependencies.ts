import * as gatsby from 'gatsby'
import { createNodeHelpers } from 'gatsby-node-helpers'

import { GLOBAL_TYPE_PREFIX } from './constants'
import {
  Dependencies,
  PluginOptions,
  PrismicTypePathType,
  TypePathsStore,
} from './types'
import { serializePath } from './lib/serializePath'
import { createBooleanFieldConfig } from './fieldConfigCreators/Boolean'
import { createColorFieldConfig } from './fieldConfigCreators/Color'
import { createDateFieldConfig } from './fieldConfigCreators/Date'
import { createEmbedFieldConfig } from './fieldConfigCreators/Embed'
import { createGeoPointFieldConfig } from './fieldConfigCreators/GeoPoint'
import { createGroupFieldConfig } from './fieldConfigCreators/Group'
import { createImageFieldConfig } from './fieldConfigCreators/Image'
import { createLinkFieldConfig } from './fieldConfigCreators/Link'
import { createNumberFieldConfig } from './fieldConfigCreators/Number'
import { createSelectFieldConfig } from './fieldConfigCreators/Select'
import { createSlicesFieldConfig } from './fieldConfigCreators/Slices'
import { createStructuredTextFieldConfig } from './fieldConfigCreators/StructuredText'
import { createTextFieldConfig } from './fieldConfigCreators/Text'
import { createTimestampFieldConfig } from './fieldConfigCreators/Timestamp'
import { createUIDFieldConfig } from './fieldConfigCreators/UID'
import { createUnknownFieldConfig } from './fieldConfigCreators/unknown'

const createTypePath = (store: TypePathsStore) => (
  path: string[],
  type: PrismicTypePathType,
): void => {
  store[serializePath(path)] = type
}

export const buildDependencies = (
  gatsbyContext: gatsby.SourceNodesArgs | gatsby.CreateSchemaCustomizationArgs,
  pluginOptions: PluginOptions,
): Dependencies => {
  const typePathsStore = {}

  return {
    pluginOptions,
    webhookBody: gatsbyContext.webhookBody,
    typePathsStore,
    createTypePath: createTypePath(typePathsStore),
    createNode: gatsbyContext.actions.createNode,
    createTypes: gatsbyContext.actions.createTypes,
    touchNode: gatsbyContext.actions.touchNode,
    deleteNode: gatsbyContext.actions.deleteNode,
    reportInfo: gatsbyContext.reporter.info,
    reportWarning: gatsbyContext.reporter.warn,
    buildUnionType: gatsbyContext.schema.buildUnionType,
    buildObjectType: gatsbyContext.schema.buildObjectType,
    buildEnumType: gatsbyContext.schema.buildEnumType,
    getNode: gatsbyContext.getNode,
    getNodes: gatsbyContext.getNodes,
    cache: gatsbyContext.cache,
    globalNodeHelpers: createNodeHelpers({
      typePrefix: GLOBAL_TYPE_PREFIX,
      createNodeId: gatsbyContext.createNodeId,
      createContentDigest: gatsbyContext.createContentDigest,
    }),
    nodeHelpers: createNodeHelpers({
      typePrefix: [GLOBAL_TYPE_PREFIX, pluginOptions.typePrefix]
        .filter(Boolean)
        .join(' '),
      fieldPrefix: GLOBAL_TYPE_PREFIX,
      createNodeId: gatsbyContext.createNodeId,
      createContentDigest: gatsbyContext.createContentDigest,
    }),
    fieldConfigCreators: {
      Boolean: createBooleanFieldConfig,
      Color: createColorFieldConfig,
      Date: createDateFieldConfig,
      Embed: createEmbedFieldConfig,
      GeoPoint: createGeoPointFieldConfig,
      // @ts-expect-error - Type mismatch due to narrower schema type
      Group: createGroupFieldConfig,
      Image: createImageFieldConfig,
      Link: createLinkFieldConfig,
      Number: createNumberFieldConfig,
      Select: createSelectFieldConfig,
      // @ts-expect-error - Type mismatch due to narrower schema type
      Slices: createSlicesFieldConfig,
      StructuredText: createStructuredTextFieldConfig,
      Text: createTextFieldConfig,
      Timestamp: createTimestampFieldConfig,
      UID: createUIDFieldConfig,
      Unknown: createUnknownFieldConfig,
    },
  }
}
