import md5 from 'tiny-hashes/md5'

const __PRODUCTION__ = process.env.NODE_ENV === 'production'

export const serializePath = (path: string[]): string =>
  __PRODUCTION__ ? md5(path.toString()) : path.join('.')
