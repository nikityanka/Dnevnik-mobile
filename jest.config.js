module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^react-native/Libraries/Alert/Alert$': '<rootDir>/__mocks__/react-native.js',
    '^expo-document-picker$': '<rootDir>/__mocks__/expo-module.js',
    '^expo-file-system/legacy$': '<rootDir>/__mocks__/expo-module.js',
    '^expo-file-system$': '<rootDir>/__mocks__/expo-module.js',
    '^expo-sharing$': '<rootDir>/__mocks__/expo-module.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/expo-module.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))',
  ],
};
