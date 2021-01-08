export const createRemoteFileNode = jest.fn().mockReturnValue(
  Promise.resolve({
    id: 'remoteFileNodeId',
  }),
)
