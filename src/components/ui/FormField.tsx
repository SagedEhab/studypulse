import type { Ref } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputInstance,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, font, radius, spacing } from '@/theme/tokens';

type Props = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  ref?: Ref<TextInputInstance>;
};

export function FormField({ label, error, hint, optional, containerStyle, ref, style, ...inputProps }: Props) {
  return (
    <View style={[styles.field, containerStyle]}>
      <FieldLabel label={label} optional={optional} />
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, inputProps.multiline && styles.multiline, error ? styles.inputError : null, style]}
        {...inputProps}
      />
      <FieldMessage error={error} hint={hint} />
    </View>
  );
}

export function FieldLabel({ label, optional }: { label: string; optional?: boolean }) {
  return (
    <Text style={styles.label}>
      {label}
      {optional && <Text style={styles.optional}> (optional)</Text>}
    </Text>
  );
}

export function FieldMessage({ error, hint }: { error?: string; hint?: string }) {
  if (error) {
    return (
      <Text style={styles.error} accessibilityRole="alert">
        {error}
      </Text>
    );
  }
  return hint ? <Text style={styles.hint}>{hint}</Text> : null;
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs + 2 },
  label: { fontSize: font.small, fontWeight: '700', color: colors.text },
  optional: { fontWeight: '400', color: colors.textMuted },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontSize: font.body,
    color: colors.text,
  },
  multiline: { minHeight: 96, paddingTop: spacing.md, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  error: { fontSize: font.small, color: colors.danger, fontWeight: '600' },
  hint: { fontSize: font.small, color: colors.textMuted },
});
