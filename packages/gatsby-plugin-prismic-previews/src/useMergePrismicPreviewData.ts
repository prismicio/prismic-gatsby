import * as React from 'react'
import * as gatsby from 'gatsby'
import * as R from 'fp-ts/Record'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import { camelCase } from 'gatsby-source-prismic/dist/lib/camelCase'
import { UnknownRecord } from 'gatsby-source-prismic/dist/types'
import { PREVIEWABLE_NODE_ID_FIELD } from 'gatsby-source-prismic/dist/constants'

import { isPlainObject } from './lib/isPlainObject'

import { usePrismicContext, PrismicContextState } from './usePrismicContext'

const findAndReplacePreviewables = (nodes: PrismicContextState['nodes']) => (
  nodeOrLeaf: unknown,
): unknown => {
  if (isPlainObject(nodeOrLeaf)) {
    const previewableValue = nodeOrLeaf[PREVIEWABLE_NODE_ID_FIELD] as
      | string
      | undefined
    if (!previewableValue) return nodeOrLeaf

    return nodes[previewableValue] ?? nodeOrLeaf
  }

  // Iterate all elements in the node to find the previewable value.
  if (Array.isArray(nodeOrLeaf))
    return nodeOrLeaf.map((subnode) =>
      findAndReplacePreviewables(nodes)(subnode),
    )

  // If the node is not an object or array, it cannot be a previewable value.
  return nodeOrLeaf
}

/**
 * Inserts a root-level node in a static data object with a given
 * node. If a node with the same type already exists at the root-level, the existing node is replaced with the given node. This is useful when you know the static data object does not include
 * the given node, such as nodes that have not been publsihed.
 *
 * @param staticData Static data object into which the node will be inserted.
 * @param node Node to insert into the static data object.
 *
 * @returns `staticData` with `node` inserted at the root level.
 */
const rootReplaceOrInsert = <TStaticData extends UnknownRecord>(
  staticData: TStaticData,
  node: gatsby.NodeInput,
): { data: TStaticData; isPreview: boolean } =>
  pipe(
    node,
    O.fromNullable,
    O.map((previewData) => ({
      ...staticData,
      [camelCase(previewData.internal.type)]: previewData,
    })),
    O.fold(
      () => ({ data: staticData, isPreview: false as boolean }),
      (data) => ({ data, isPreview: true }),
    ),
  )

/**
 * Takes a static data object and a list of nodes and replaces any instances of
 * those nodes in the static data with the updated version. The replacement is
 * done recursively to ensure nested nodes are replaced.
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
  nodes: Record<string, gatsby.NodeInput>,
): { data: TStaticData; isPreview: boolean } =>
  pipe(
    nodes,
    O.fromPredicate(R.isEmpty),
    O.map(
      () => R.map(findAndReplacePreviewables(nodes))(staticData) as TStaticData,
    ),
    O.fold(
      () => ({ data: staticData, isPreview: false as boolean }),
      (data) => ({ data, isPreview: true }),
    ),
  )

export type UsePrismicPreviewDataConfig =
  | { mergeStrategy: 'traverseAndReplace' }
  | { mergeStrategy: 'rootReplaceOrInsert'; nodePrismicId: string }

export const useMergePrismicPreviewData = <TStaticData extends UnknownRecord>(
  staticData: TStaticData,
  config: UsePrismicPreviewDataConfig = { mergeStrategy: 'traverseAndReplace' },
): { data: TStaticData; isPreview: boolean } => {
  const [state] = usePrismicContext()

  return React.useMemo(() => {
    switch (config.mergeStrategy) {
      case 'rootReplaceOrInsert': {
        return rootReplaceOrInsert(
          staticData,
          state.nodes[config.nodePrismicId],
        )
      }

      case 'traverseAndReplace': {
        return traverseAndReplace(staticData, state.nodes)
      }
    }
  }, [
    staticData,
    config.mergeStrategy,
    state.nodes,
    // @ts-expect-error - config.nodePrismicId only exists if mergeStrategy is "rootReplaceOrInsert"
    config.nodePrismicId,
  ])
}
