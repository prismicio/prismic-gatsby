import md5 from 'tiny-hashes/md5'

export const serializePath = (path: string[]): string =>
  process.env.NODE_ENV === 'production' ? md5(path.join('.')) : path.join('.')
