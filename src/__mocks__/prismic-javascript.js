const dummyApi = { getByID: id => ({ id, type: 'custom_type' }) }

export default {
  api: () => dummyApi,
}
