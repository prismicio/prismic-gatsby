export class UnauthorizedError extends Error {
  public constructor(
    message = 'Unauthorized: access token not provided or is incorrect',
  ) {
    super(message)
  }
}
