import { fireEvent, render } from '@testing-library/react-native';

import { TimeAmountInput } from '../time-amount-input';

import { I18nProvider } from '@/i18n';

function renderInput(props: Partial<React.ComponentProps<typeof TimeAmountInput>> = {}) {
  const onChange = jest.fn();
  const utils = render(
    <I18nProvider language="en">
      <TimeAmountInput
        label="Planned time"
        value={null}
        onChange={onChange}
        min={5}
        max={1440}
        step={5}
        {...props}
      />
    </I18nProvider>,
  );
  return { ...utils, onChange };
}

describe('TimeAmountInput', () => {
  test('shows the typed value split into hours and minutes', () => {
    const { getByLabelText } = renderInput({ value: 90 });
    expect(getByLabelText('Planned time h').props.value).toBe('1');
    expect(getByLabelText('Planned time min').props.value).toBe('30');
  });

  test('typing hours commits hours × 60 + minutes', () => {
    const { getByLabelText, onChange } = renderInput({ value: 30 });
    fireEvent.changeText(getByLabelText('Planned time h'), '2');
    expect(onChange).toHaveBeenCalledWith(150);
  });

  test('typing minutes commits hours × 60 + minutes', () => {
    const { getByLabelText, onChange } = renderInput({ value: 120 });
    fireEvent.changeText(getByLabelText('Planned time min'), '45');
    expect(onChange).toHaveBeenCalledWith(165);
  });

  test('clearing the hours field empties the value when minutes are zero', () => {
    const { getByLabelText, onChange } = renderInput({ value: 60 });
    fireEvent.changeText(getByLabelText('Planned time h'), '');
    expect(onChange).toHaveBeenCalledWith(null);
  });

  test('clearing the minutes field keeps the hours', () => {
    const { getByLabelText, onChange } = renderInput({ value: 90 });
    fireEvent.changeText(getByLabelText('Planned time min'), '');
    expect(onChange).toHaveBeenCalledWith(60);
  });

  test('clear button resets to null but disappears on required fields', () => {
    const optional = renderInput({ value: 45 });
    fireEvent.press(optional.getByLabelText('Clear value'));
    expect(optional.onChange).toHaveBeenCalledWith(null);

    const required = renderInput({ value: 45, required: true });
    expect(required.queryByLabelText('Clear value')).toBeNull();
  });

  test('typed values outside the slider range disable the slider', () => {
    const inside = renderInput({ value: 90, testID: 'amount' });
    expect(inside.getByTestId('amount').props.disabled).toBeFalsy();

    const outside = renderInput({ value: 5000, testID: 'amount' });
    expect(outside.getByTestId('amount').props.disabled).toBe(true);
  });
});
