module.exports = {
  transform: {
    '^.+\\.m?js$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'node']
};