import { StyleSheet, Text, View } from 'react-native';

import { colors, font, radius, spacing } from '@/theme/tokens';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';

type Props = {
  title: string;
  tasks: Task[];
  today: string;
  emptyText: string;
  tone?: 'normal' | 'danger';
  onOpen: (task: Task) => void;
  onToggle: (task: Task) => void;
};

export function TaskSection({ title, tasks, today, emptyText, tone = 'normal', onOpen, onToggle }: Props) {
  const accent = tone === 'danger' ? colors.danger : colors.primary;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, tone === 'danger' && { color: colors.danger }]} accessibilityRole="header">
          {title}
        </Text>
        {tasks.length > 0 && (
          <View style={[styles.count, { backgroundColor: accent }]}>
            <Text style={styles.countText}>{tasks.length}</Text>
          </View>
        )}
      </View>
      {tasks.length === 0 ? (
        <Text style={styles.empty}>{emptyText}</Text>
      ) : (
        tasks.map((task) => (
          <TaskCard key={task.id} task={task} today={today} onOpen={() => onOpen(task)} onToggle={() => onToggle(task)} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: font.title, fontWeight: '800', color: colors.text },
  count: { minWidth: 22, height: 22, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  countText: { fontSize: font.caption, fontWeight: '800', color: colors.onPrimary },
  empty: {
    fontSize: font.body,
    color: colors.textMuted,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    textAlign: 'center',
  },
});
