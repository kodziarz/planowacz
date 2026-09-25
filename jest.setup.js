jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@expo/ui', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Host: ({ children, style }) => React.createElement(View, { style }, children),
    Slider: ({ testID }) => React.createElement(View, { testID }),
    Picker: ({ children }) => React.createElement(View, null, children),
    Button: ({ label, onPress }) =>
      React.createElement(View, { onPress }, React.createElement(null, null, label)),
  };
});
