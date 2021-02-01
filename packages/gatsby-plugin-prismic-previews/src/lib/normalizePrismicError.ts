import { UnauthorizedError } from '../errors/NotAuthorizedError'

export const normalizePrismicError = (error: Error): Error =>
  error instanceof Error && /401/.test(error.message)
    ? new UnauthorizedError()
    : (error as Error)
