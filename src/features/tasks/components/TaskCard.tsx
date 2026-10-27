import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, radius, spacing } from '@/theme/tokens';
import { dueLabel, type DueTone } from '../logic';
import { PRIORITY_META, TYPE_META } from '../meta';
import type { Task } from '../types';

type Props = {
  task: Task;
  today: string;
  onOpen: () => void;
  onToggle: () => void;
};

const TONE_COLOR: Record<DueTone, string> = {
  danger: colors.danger,
  warning: colors.warning,
  normal: colors.textMuted,
  muted: colors.textMuted,
};

export function TaskCard({ task, today, onOpen, onToggle }: Props) {
  const type = TYPE_META[task.type];
  const due = dueLabel(task, today);

  return (
    <View style={[styles.card, task.done && styles.cardDone]}>
      <View style={[styles.priorityBar, { backgroundColor: PRIORITY_META[task.priority].color }]} />

      <Pressable
        onPress={onToggle}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.done }}
        accessibilityLabel={`Mark ${task.title} as ${task.done ? 'not done' : 'done'}`}
        style={[styles.check, task.done && styles.checkDone]}
      >
        {task.done && <Ionicons name="checkmark" size={16} color={colors.onPrimary} />}
      </Pressable>

      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`${task.title}, ${type.label} for ${task.course}, ${due.text}`}
        accessibilityHint="Opens the task to edit it"
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}
      >
        <Text style={[styles.title, task.done && styles.titleDone]} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.typePill, { backgroundColor: type.soft }]}>
            <Ionicons name={type.icon} size={12} color={type.color} />
            <Text style={[styles.typeText, { color: type.color }]}>{type.label}</Text>
          </View>
          <Text style={styles.course}>{task.course}</Text>
          <Text style={[styles.due, { color: TONE_COLOR[due.tone] }]} numberOfLines={1}>
            {due.text}
          </Text>
        </View>
      </Pressable>

      <Ionicons name="chevron-forward" size={18} color={colors.border} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    paddingLeft: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardDone: { opacity: 0.7 },
  priorityBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  check: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.success, borderColor: colors.success },
  body: { flex: 1, gap: spacing.xs + 2 },
  pressed: { opacity: 0.6 },
  title: { fontSize: font.body, fontWeight: '600', color: colors.text },
  titleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  typeText: { fontSize: font.caption, fontWeight: '700' },
  course: { fontSize: font.caption, fontWeight: '700', color: colors.textMuted },
  due: { fontSize: font.caption, fontWeight: '600' },
});
