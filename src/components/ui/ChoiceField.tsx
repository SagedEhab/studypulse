import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/tokens';
import { Chip } from './Chip';
import { FieldLabel, FieldMessage } from './FormField';

export type Choice<T> = { value: T; label: string; color?: string };

type Props<T> = {
  label: string;
  options: readonly Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  error?: string;
  hint?: string;
};

/** A labelled group of chips where exactly one option is selected. */
export function ChoiceField<T extends string | number | null>({ label, options, value, onChange, error, hint }: Props<T>) {
  return (
    <View style={styles.field} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <FieldLabel label={label} />
      <View style={styles.row}>
        {options.map((option) => (
          <Chip
            key={String(option.value)}
            label={option.label}
            color={option.color}
            selected={option.value === value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
      <FieldMessage error={error} hint={hint} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs + 2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
