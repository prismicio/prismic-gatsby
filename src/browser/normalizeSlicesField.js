export const normalizeSlicesField = (_id, value, _depth, context) => {
  const { nodeStore } = context

  return new Proxy(value, {
    get: (obj, prop) => {
      if (nodeStore.has(value[prop])) {
        return nodeStore.get(obj[prop])
      }

      return obj[prop]
    },
  })
}
