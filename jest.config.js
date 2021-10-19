module.exports = {
  preset: '@lifeomic/jest-config',
  testMatch: ['<rootDir>/**/*.test.ts'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 100,
      statements: 100,
      functions: 100,
      lines: 100,
    },
  },
};
