import { render } from '@testing-library/react-native';

import { PieChart, PieLegend } from '../pie-chart';

import { I18nProvider } from '@/i18n';

describe('PieChart', () => {
  test('renders nothing without data', () => {
    const { toJSON } = render(
      <I18nProvider language="en">
        <PieChart data={[]} />
      </I18nProvider>,
    );
    expect(toJSON()).toBeNull();
  });

  test('shows the center label for a multi-slice pie', () => {
    const { UNSAFE_getByProps } = render(
      <I18nProvider language="en">
        <PieChart
          data={[
            { value: 30, color: '#ff0000' },
            { value: 15, color: '#00ff00' },
          ]}
          centerLabel="45 min"
        />
      </I18nProvider>,
    );
    expect(UNSAFE_getByProps({ children: '45 min' })).toBeTruthy();
  });

  test('single category renders as a full circle', () => {
    const { toJSON } = render(
      <I18nProvider language="en">
        <PieChart data={[{ value: 60, color: '#0000ff' }]} centerLabel="1 h" />
      </I18nProvider>,
    );
    expect(toJSON()).toBeTruthy();
  });
});

describe('PieLegend', () => {
  test('renders label, time and percent for every entry', () => {
    const { getByText, queryByText } = render(
      <I18nProvider language="en">
        <PieLegend
          entries={[
            { label: 'Work', value: 60, color: '#111', time: '1 h', percent: '67%' },
            { label: 'None', value: 30, color: '#222', time: '30 min', percent: '33%' },
          ]}
        />
      </I18nProvider>,
    );
    expect(getByText('Work')).toBeTruthy();
    expect(queryByText('60%')).toBeNull();
    expect(getByText('67%')).toBeTruthy();
    expect(getByText('30 min')).toBeTruthy();
    expect(getByText('None')).toBeTruthy();
  });
});
