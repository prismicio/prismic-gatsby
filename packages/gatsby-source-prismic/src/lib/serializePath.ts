import md5 from 'tiny-hashes/md5'

export const serializePath = (path: string[]): string => md5(path.toString())
