module.exports = {
  rootDir: 'spec',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|jsx|ts|tsx)$',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'node', 'json'],
  transform: {
    '.(js|jsx|ts|tsx)': '@sucrase/jest-plugin',
  },
}
