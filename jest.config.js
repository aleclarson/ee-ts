module.exports = {
  testRegex: 'spec/.+\\.spec\\.(ts|tsx)$',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'node', 'json'],
  transform: {
    '.(ts|tsx)': '@sucrase/jest-plugin',
  },
}
