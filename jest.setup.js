jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@expo/ui', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Host: ({ children, style }) => React.createElement(View, { style }, children),
    Slider: ({ testID, disabled }) => React.createElement(View, { testID, disabled }),
    Picker: ({ children }) => React.createElement(View, null, children),
    Button: ({ label, onPress }) =>
      React.createElement(View, { onPress }, React.createElement(null, null, label)),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    SafeAreaView: ({ children }) => React.createElement(React.Fragment, null, children),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 320, height: 640 }),
    initialWindowMetrics: null,
  };
});
