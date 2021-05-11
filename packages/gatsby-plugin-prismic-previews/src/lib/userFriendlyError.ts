import { HTTPError } from 'ky'

export const userFriendlyError = (error: Error): Error => {
  if (error instanceof HTTPError) {
    return new Error('Unauthorized access')
  } else {
    return error
  }
}
