/* eslint-env jest */
jest.mock('react-native/Libraries/Core/setUpReactDevTools', () => {});
jest.mock('react-native/Libraries/Core/ReactNativeVersionCheck', () => ({
  checkVersions: jest.fn(),
}));
jest.mock('react-native/Libraries/Core/checkNativeVersion', () => ({}));

jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  const actual = jest.requireActual('react-native/Libraries/TurboModule/TurboModuleRegistry');
  return {
    ...actual,
    getEnforcing: (name) => {
      if (name === 'NativePerformanceCxx') {
        return {
          mark: jest.fn(),
          measure: jest.fn(),
          getEntries: jest.fn(() => []),
          getEntriesByName: jest.fn(() => []),
          getEntriesByType: jest.fn(() => []),
          clearMarks: jest.fn(),
          clearMeasures: jest.fn(),
        };
      }
      return actual.getEnforcing(name);
    },
    get: (name) => {
      if (name === 'NativePerformanceCxx') {
        return {
          mark: jest.fn(),
          measure: jest.fn(),
          getEntries: jest.fn(() => []),
          getEntriesByName: jest.fn(() => []),
          getEntriesByType: jest.fn(() => []),
          clearMarks: jest.fn(),
          clearMeasures: jest.fn(),
        };
      }
      return actual.get(name);
    },
  };
});
