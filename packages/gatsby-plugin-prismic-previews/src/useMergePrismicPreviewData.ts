import * as React from 'react'
import * as gatsby from 'gatsby'
import * as R from 'fp-ts/Record'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import {
  PREVIEWABLE_NODE_ID_FIELD,
  UnknownRecord,
  camelCase,
} from 'gatsby-prismic-core'

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

const rootReplaceOrInsert = <TStaticData extends UnknownRecord>(
  staticData: TStaticData,
  previewData: gatsby.NodeInput,
): { data: TStaticData; isPreview: boolean } =>
  pipe(
    previewData,
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
  | { mergeStrategy: 'rootReplaceOrInsert'; previewData: gatsby.NodeInput }

export const useMergePrismicPreviewData = <TStaticData extends UnknownRecord>(
  staticData: TStaticData,
  config: UsePrismicPreviewDataConfig = { mergeStrategy: 'traverseAndReplace' },
): { data: TStaticData; isPreview: boolean } => {
  const [state] = usePrismicContext()

  return React.useMemo(() => {
    switch (config.mergeStrategy) {
      case 'rootReplaceOrInsert': {
        return rootReplaceOrInsert(staticData, config.previewData)
      }

      case 'traverseAndReplace': {
        return traverseAndReplace(staticData, state.nodes)
      }
    }
  }, [
    staticData,
    config.mergeStrategy,
    state.nodes,
    // @ts-expect-error - config.pagePath only exists if mergeStrategy is "rootReplaceOrInsert"
    config.previewData,
  ])
}
