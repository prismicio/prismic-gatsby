type CreatePreviewURLArgs = {
  token?: string
  documentId?: string
}

export const createPreviewURL = (args: CreatePreviewURLArgs): string => {
  const params = new URLSearchParams()

  if (args.token) {
    params.set('token', args.token)
  }

  if (args.documentId) {
    params.set('documentId', args.documentId)
  }

  return '?' + params.toString()
}
