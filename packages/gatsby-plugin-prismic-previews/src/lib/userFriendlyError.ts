import ky from 'ky'

export const userFriendlyError = (error: Error): Error => {
  if (error instanceof ky.HTTPError) {
    return new Error('Unauthorized access')
  } else {
    return error
  }
}
