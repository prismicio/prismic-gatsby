const dummyApi = {
  getByID: jest.fn().mockImplementation(id => ({ id, type: 'custom_type' })),
}

export default {
  getApi: jest.fn(),
  api: jest.fn().mockImplementation(() => dummyApi),
}
