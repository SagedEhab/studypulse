import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/AppButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { LoadingView } from '@/components/ui/LoadingView';
import { routes } from '@/navigation/routes';
import { colors, font, radius, spacing } from '@/theme/tokens';
import { TaskSection } from '../components/TaskSection';
import { WeekProgressCard } from '../components/WeekProgressCard';
import { formatLongDate, todayISO } from '../dates';
import { useTasks } from '../hooks/useTasks';
import { buildDashboard } from '../logic';
import type { Task } from '../types';

function greeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Screen 1 — Today: what is overdue, what is due today and which exams are coming up. */
export default function DashboardScreen() {
  const { tasks, loadState, reload, toggleDone, saveError, dismissSaveError } = useTasks();
  const insets = useSafeAreaInsets();
  const now = new Date();
  const today = todayISO();
  const board = useMemo(() => buildDashboard(tasks, today), [tasks, today]);

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

  const openTask = (task: Task) => router.push(routes.editTask(task.id));
  const toggleTask = (task: Task) => toggleDone(task.id);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.date}>{formatLongDate(now)}</Text>
          <Text style={styles.greeting} accessibilityRole="header">
            {greeting(now.getHours())}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push(routes.newTask())}
          accessibilityRole="button"
          accessibilityLabel="Add task"
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={26} color={colors.onPrimary} />
        </Pressable>
      </View>

      {saveError && <ErrorBanner message={saveError} onDismiss={dismissSaveError} />}

      <WeekProgressCard done={board.week.done} total={board.week.total} examCount={board.upcomingExams.length} />

      {board.overdue.length > 0 && (
        <TaskSection
          title="Overdue"
          tone="danger"
          tasks={board.overdue}
          today={today}
          emptyText=""
          onOpen={openTask}
          onToggle={toggleTask}
        />
      )}

      <TaskSection
        title="Due today"
        tasks={board.dueToday}
        today={today}
        emptyText="Nothing due today. Enjoy the free time!"
        onOpen={openTask}
        onToggle={toggleTask}
      />

      <TaskSection
        title="Upcoming exams"
        tasks={board.upcomingExams}
        today={today}
        emptyText="No exams in the next two weeks."
        onOpen={openTask}
        onToggle={toggleTask}
      />

      <AppButton title="See all tasks" variant="secondary" icon="list-outline" onPress={() => router.navigate(routes.tasks)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerText: { flex: 1, gap: 2 },
  date: { fontSize: font.small, fontWeight: '600', color: colors.textMuted },
  greeting: { fontSize: font.display, fontWeight: '800', color: colors.text },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75 },
});
