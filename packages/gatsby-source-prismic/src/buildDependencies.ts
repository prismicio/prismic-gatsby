import * as gatsby from 'gatsby'

import { createNodeHelpers } from './lib/nodeHelpers'

import { GLOBAL_TYPE_PREFIX } from './constants'
import { Dependencies, PluginOptions } from './types'
import { createBooleanFieldConfig } from './fieldConfigCreators/boolean'
import { createColorFieldConfig } from './fieldConfigCreators/color'
import { createUnknownFieldConfig } from './fieldConfigCreators/unknown'
import { createUIDFieldConfig } from './fieldConfigCreators/uid'
import { createTimestampFieldConfig } from './fieldConfigCreators/timestamp'
import { createTextFieldConfig } from './fieldConfigCreators/text'
import { createStructuredTextFieldConfig } from './fieldConfigCreators/structuredText'
import { createSlicesFieldConfig } from './fieldConfigCreators/slices'
import { createSelectFieldConfig } from './fieldConfigCreators/select'
import { createNumberFieldConfig } from './fieldConfigCreators/number'
import { createLinkFieldConfig } from './fieldConfigCreators/link'
import { createImageFieldConfig } from './fieldConfigCreators/image'
import { createGroupFieldConfig } from './fieldConfigCreators/group'
import { createGeoPointFieldConfig } from './fieldConfigCreators/geoPoint'
import { createEmbedFieldConfig } from './fieldConfigCreators/embed'
import { createDateFieldConfig } from './fieldConfigCreators/date'

export const buildDependencies = (
  gatsbyContext: gatsby.SourceNodesArgs | gatsby.CreateSchemaCustomizationArgs,
  pluginOptions: PluginOptions,
): Dependencies => ({
  pluginOptions,
  webhookBody: gatsbyContext.webhookBody,
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
})
