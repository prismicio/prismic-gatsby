import * as React from 'react'
import * as R from 'fp-ts/Record'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import { PREVIEWABLE_NODE_ID_FIELD } from 'gatsby-source-prismic'
import { ValueOf } from 'type-fest'

import { isPlainObject } from './lib/isPlainObject'
import { camelCase } from './lib/camelCase'

import { UnknownRecord } from './types'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'
import { PrismicContextRepositoryState } from './context'

const findAndReplacePreviewables = (
  nodes: PrismicContextRepositoryState['nodes'],
) => (nodeOrLeaf: unknown): unknown => {
  // TODO: Need to traverse every property in the object. If it doesn't include
  // _previewable, then we need to check every property inside for something
  // that does.
  if (isPlainObject(nodeOrLeaf)) {
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
 * Inserts a root-level node in a static data object. If a node with the same
 * type already exists at the root-level, the existing node is replaced with the
 * given node. This is useful when you know the static data object does not
 * include the given node, such as nodes that have not been publsihed.
 *
 * @param staticData Static data object into which the node will be inserted.
 * @param node Node to insert into the static data object.
 *
 * @returns `staticData` with `node` inserted at the root level.
 */
const rootReplaceOrInsert = <TStaticData extends UnknownRecord>(
  staticData: TStaticData,
  node: ValueOf<PrismicContextRepositoryState['nodes']>,
): { data: TStaticData; isPreview: boolean } =>
  pipe(
    O.fromNullable(node),
    O.map((node) => ({
      ...staticData,
      [camelCase(node.internal.type)]: node,
    })),
    O.fold(
      () => ({ data: staticData, isPreview: false as boolean }),
      (data) => ({ data, isPreview: true }),
    ),
  )

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
  nodes: PrismicContextRepositoryState['nodes'],
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

// TODO: Update references to gatsby.NodeInput and nodes to PrismicAPIDocumentNodes

export type UsePrismicPreviewDataConfig =
  | {
      mergeStrategy: 'traverseAndReplace'
      skip?: boolean
    }
  | {
      mergeStrategy: 'rootReplaceOrInsert'
      nodePrismicId: string
      skip?: boolean
    }

export const useMergePrismicPreviewData = <TStaticData extends UnknownRecord>(
  repositoryName: string,
  staticData: TStaticData,
  config: UsePrismicPreviewDataConfig = { mergeStrategy: 'traverseAndReplace' },
): { data: TStaticData; isPreview: boolean } => {
  const [state] = usePrismicPreviewContext(repositoryName)

  return React.useMemo(() => {
    if (config.skip) {
      return { data: staticData, isPreview: false }
    }

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
    config.skip,
    state.nodes,
    // @ts-expect-error - config.nodePrismicId only exists if mergeStrategy is "rootReplaceOrInsert"
    config.nodePrismicId,
  ])
}
