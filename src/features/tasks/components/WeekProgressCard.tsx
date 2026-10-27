import { StyleSheet, Text, View } from 'react-native';

import { colors, font, radius, spacing } from '@/theme/tokens';

type Props = { done: number; total: number; examCount: number };

export function WeekProgressCard({ done, total, examCount }: Props) {
  const ratio = total === 0 ? 0 : done / total;
  const summary = total === 0 ? 'Nothing due this week' : `${done} of ${total} done`;
  const exams =
    examCount === 0 ? 'No exams in the next two weeks' : `${examCount} exam${examCount === 1 ? '' : 's'} in the next two weeks`;

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`This week: ${summary}. ${exams}.`}
    >
      <Text style={styles.label}>THIS WEEK</Text>
      <Text style={styles.summary}>{summary}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(ratio * 100)}%` }]} />
      </View>
      <Text style={styles.exams}>{exams}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.sm },
  label: { fontSize: font.caption, fontWeight: '800', letterSpacing: 1, color: '#C7D2FE' },
  summary: { fontSize: font.heading, fontWeight: '800', color: colors.onPrimary },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.onPrimary },
  exams: { fontSize: font.small, color: '#E0E7FF', fontWeight: '600' },
});
