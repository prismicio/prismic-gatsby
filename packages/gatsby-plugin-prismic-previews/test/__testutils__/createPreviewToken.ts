export const createPreviewToken = (repositoryName: string): string =>
  encodeURIComponent(`https://${repositoryName}.prismic.io/previews/token`)
