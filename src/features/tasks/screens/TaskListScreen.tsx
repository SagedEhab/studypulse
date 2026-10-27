import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { LoadingView } from '@/components/ui/LoadingView';
import { routes } from '@/navigation/routes';
import { colors, font, radius, spacing } from '@/theme/tokens';
import { TaskCard } from '../components/TaskCard';
import { todayISO } from '../dates';
import { useTasks } from '../hooks/useTasks';
import { filterTasks, sortTasks, type StatusFilter } from '../logic';
import { TYPE_META } from '../meta';
import type { TaskType } from '../types';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'pending', label: 'To do' },
  { value: 'done', label: 'Done' },
  { value: 'all', label: 'All' },
];

const TYPE_FILTERS: { value: TaskType | 'all'; label: string; color?: string }[] = [
  { value: 'all', label: 'All types' },
  ...(Object.keys(TYPE_META) as TaskType[]).map((value) => ({
    value,
    label: TYPE_META[value].plural,
    color: TYPE_META[value].color,
  })),
];

const Separator = () => <View style={{ height: spacing.sm }} />;

/** Screen 2 — Tasks: every task, with search and status / type filters. */
export default function TaskListScreen() {
  const { tasks, loadState, reload, toggleDone, saveError, dismissSaveError } = useTasks();
  const [status, setStatus] = useState<StatusFilter>('pending');
  const [type, setType] = useState<TaskType | 'all'>('all');
  const [query, setQuery] = useState('');
  const today = todayISO();

  const visible = useMemo(() => sortTasks(filterTasks(tasks, { status, type, query })), [tasks, status, type, query]);

  if (loadState === 'loading') return <LoadingView label="Loading your tasks…" />;
  if (loadState === 'error') {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Couldn't load your tasks"
        message="Something went wrong reading this phone's storage."
        actionLabel="Try again"
        onAction={reload}
      />
    );
  }

  const clearFilters = () => {
    setStatus('all');
    setType('all');
    setQuery('');
  };

  const header = (
    <View style={styles.filters}>
      {saveError && <ErrorBanner message={saveError} onDismiss={dismissSaveError} />}

      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by title or course"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Search tasks"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.searchInput}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <View style={styles.chipRow}>
        {STATUS_FILTERS.map((option) => (
          <Chip key={option.value} label={option.label} selected={status === option.value} onPress={() => setStatus(option.value)} />
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {TYPE_FILTERS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            color={option.color}
            selected={type === option.value}
            onPress={() => setType(option.value)}
          />
        ))}
      </ScrollView>

      <Text style={styles.count}>
        {visible.length} {visible.length === 1 ? 'task' : 'tasks'}
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={visible}
        keyExtractor={(task) => task.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            today={today}
            onOpen={() => router.push(routes.editTask(item.id))}
            onToggle={() => toggleDone(item.id)}
          />
        )}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          tasks.length === 0 ? (
            <EmptyState
              icon="checkmark-done-outline"
              title="No tasks yet"
              message="Add your first assignment, exam or study session."
              actionLabel="Add a task"
              onAction={() => router.push(routes.newTask())}
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title="No tasks match"
              message="Try another search or show all tasks."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          )
        }
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      />

      <Pressable
        onPress={() => router.push(routes.newTask())}
        accessibilityRole="button"
        accessibilityLabel="Add task"
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      >
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 112 },
  filters: { gap: spacing.md, marginBottom: spacing.md },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchInput: { flex: 1, minHeight: 46, fontSize: font.body, color: colors.text },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  count: { fontSize: font.small, fontWeight: '700', color: colors.textMuted },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  pressed: { opacity: 0.75 },
});
