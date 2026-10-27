import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, font, spacing } from '@/theme/tokens';

export function LoadingView({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, backgroundColor: colors.background },
  label: { fontSize: font.body, color: colors.textMuted },
});
