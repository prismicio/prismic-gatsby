export class UnauthorizedError extends Error {
  public constructor(message = '') {
    super(message)
  }
}
