import * as gatsby from 'gatsby'
import * as React from 'react'

import { UnknownRecord } from 'shared/types'

import { usePrismicContext } from './usePrismicContext'
import { useMergePrismicPreviewData } from './useMergePrismicPreviewData'

export type UsePrismicUnpublishedPreviewDataReturnType<
  TStaticData extends UnknownRecord
> =
  | { data: TStaticData; isPreview: true; type: string }
  | { data: TStaticData; isPreview: false; type: undefined }

export type UsePrismicUnpublishedPreviewDataConfig = {
  pagePath: string
}

export const usePrismicUnpublishedPreviewData = <
  TStaticData extends UnknownRecord
>(
  staticData: TStaticData,
  config: UsePrismicUnpublishedPreviewDataConfig,
): UsePrismicUnpublishedPreviewDataReturnType<TStaticData> => {
  const [state] = usePrismicContext()
  const previewData = state.nodes[
    state.rootNodeMap[config.pagePath]
  ] as gatsby.NodeInput & { type: string }

  const { data, isPreview } = useMergePrismicPreviewData(staticData, {
    mergeStrategy: 'rootReplaceOrInsert',
    previewData,
  })

  return React.useMemo(
    () =>
      isPreview
        ? { data, type: previewData.type, isPreview }
        : { data, type: undefined, isPreview },
    [data, isPreview, previewData],
  )
}
