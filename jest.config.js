module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@core-engine/(.*)$': '<rootDir>/packages/core-engine/src/$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!uuid)!'
  ],
};
