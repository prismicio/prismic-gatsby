module.exports = {
  transform: {
    '^.+\\.tsx?$': 'esbuild-jest',
  },
  modulePathIgnorePatterns: ['dist/'],
  transformIgnorePatterns: ['/node_modules/(?!(ky))'],
}
