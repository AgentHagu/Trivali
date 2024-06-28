module.exports = {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/tests'],
    setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
    testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  };
  