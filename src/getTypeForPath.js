import util from 'util'

const log = x => console.log(util.inspect(x, false, null, true))

export const getTypeForPath = (path, typeDefs) => {
  log(typeDefs)
}
