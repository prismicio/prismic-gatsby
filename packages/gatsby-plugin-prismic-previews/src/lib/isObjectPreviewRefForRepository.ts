export type ObjectPreviewRef = {
  _tracker: string
} & {
  [key in string]: {
    preview: string
  }
}

export const isObjectPreviewRefForRepository =
  (repositoryName: string) =>
  (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: unknown,
  ): input is ObjectPreviewRef =>
    typeof input === 'object' &&
    input !== null &&
    `${repositoryName}.prismic.io` in input &&
    'preview' in input[`${repositoryName}.prismic.io` as keyof typeof input]
