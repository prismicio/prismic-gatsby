import * as React from 'react'
import * as R from 'fp-ts/Record'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import { PREVIEWABLE_NODE_ID_FIELD } from 'gatsby-source-prismic'

import { isPlainObject } from './lib/isPlainObject'

import { UnknownRecord } from './types'
import { PrismicContextState, PrismicPreviewState } from './context'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'
import { isProxy } from './lib/isProxy'

/**
 * Recursively finds previewable data and replaces data if a previewed version
 * of it exists in the provided nodes.
 *
 * @param nodes List of Prismic document nodes.
 *
 * @returns Function that accepts a node or node content to find and replace previewable content.
 */
const findAndReplacePreviewables =
  (nodes: PrismicContextState['nodes']) =>
  (nodeOrLeaf: unknown): unknown => {
    if (isPlainObject(nodeOrLeaf)) {
      // If the value is a proxy, we can't reliably replace properties since
      // property keys could be synthetic. We opt to ignore the object
      // completely.
      //
      // At the time of writing this comment, Proxies are only present in Link
      // fields. We can safely opt out of merging preview data in this case.
      if (isProxy(nodeOrLeaf)) {
        return nodeOrLeaf
      }

      const previewableValue = nodeOrLeaf[PREVIEWABLE_NODE_ID_FIELD] as
        | string
        | undefined
      if (previewableValue && nodes[previewableValue]) {
        return nodes[previewableValue]
      }

      // We didn't find a previewable field, so continue to iterate through all
      // properties to find it.
      const newNode = {} as typeof nodeOrLeaf
      for (const key in nodeOrLeaf) {
        newNode[key] = findAndReplacePreviewables(nodes)(nodeOrLeaf[key])
      }

      return newNode
    }

    // Iterate all elements in the node to find the previewable value.
    if (Array.isArray(nodeOrLeaf)) {
      return (nodeOrLeaf as unknown[]).map((subnode) =>
        findAndReplacePreviewables(nodes)(subnode),
      )
    }

    // If the node is not an object or array, it cannot be a previewable value.
    return nodeOrLeaf
  }

/**
 * Takes a static data object and a record of nodes and replaces any instances
 * of those nodes in the static data with the updated version. The replacement
 * is done recursively to ensure nested nodes are replaced.
 *
 * Nodes are considered matches if they have identical
 * `PREVIEWABLE_NODE_ID_FIELD` fields (see constant value in
 * `src/constants.ts`).
 *
 * @param staticData Static data object in which nodes will be replaced.
 * @param nodes List of nodes that replace in `staticData`.
 *
 * @returns `staticData` with any matching nodes replaced with nodes in
 * `nodes`.
 */
const traverseAndReplace = <TStaticData extends UnknownRecord>(
  staticData: TStaticData,
  nodes: PrismicContextState['nodes'],
): { data: TStaticData; isPreview: boolean } =>
  pipe(
    nodes,
    O.fromPredicate((nodes) => !R.isEmpty(nodes)),
    O.map(() => staticData),
    O.map(findAndReplacePreviewables(nodes)),
    O.fold(
      () => ({ data: staticData, isPreview: false as boolean }),
      (data) => ({ data: data as TStaticData, isPreview: true }),
    ),
  )

export type UsePrismicPreviewDataConfig = {
  /**
   * Determines if merging should be skipped.
   */
  skip?: boolean
}

export type UsePrismicPreviewDataResult<TStaticData extends UnknownRecord> = {
  /**
   * Data with previewed content merged if matching documents are found.
   */
  data: TStaticData

  /**
   * Boolean determining if `data` contains previewed data.
   */
  isPreview: boolean
}

/**
 * Merges static Prismic data with previewed data during a Prismic preview
 * session. If the static data finds previewable Prismic data (identified by the
 * `_previewable` field in a Prismic document), this hook will replace its value
 * with one from the preview session.
 *
 * The static data could come from page queries or `useStaticQuery` within a
 * component.
 *
 * @param staticData Static data from Gatsby's GraphQL layer.
 * @param config Configuration that determines how the hook merges preview data.
 *
 * @returns An object containing the merged data and a boolean determining if the merged data contains preview data.
 */
export const useMergePrismicPreviewData = <TStaticData extends UnknownRecord>(
  staticData: TStaticData,
  config: UsePrismicPreviewDataConfig = { skip: false },
): UsePrismicPreviewDataResult<TStaticData> => {
  const [state] = usePrismicPreviewContext()

  return React.useMemo(() => {
    if (config.skip || state.previewState !== PrismicPreviewState.ACTIVE) {
      return { data: staticData, isPreview: false }
    } else {
      return traverseAndReplace(staticData, state.nodes)
    }
  }, [staticData, config.skip, state])
}
