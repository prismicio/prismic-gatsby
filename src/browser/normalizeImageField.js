export const normalizeImageField = async (_id, value) => ({
  ...value,
  localFile: null,
})
