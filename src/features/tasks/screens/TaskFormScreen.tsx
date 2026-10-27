import { router, Stack, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { Chip } from '@/components/ui/Chip';
import { ChoiceField } from '@/components/ui/ChoiceField';
import { confirm } from '@/components/ui/confirm';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { FormField } from '@/components/ui/FormField';
import { LoadingView } from '@/components/ui/LoadingView';
import { routes } from '@/navigation/routes';
import { colors, spacing } from '@/theme/tokens';
import { addDays, todayISO } from '../dates';
import { useTaskForm } from '../hooks/useTaskForm';
import { useTasks } from '../hooks/useTasks';
import { PRIORITY_OPTIONS, REMINDER_OPTIONS, TYPE_OPTIONS } from '../meta';
import type { Task } from '../types';
import { LIMITS } from '../validation';

/** Leaves the form. Falls back to the task list when the form was opened directly (a link, a notification). */
function closeForm() {
  if (router.canGoBack()) router.back();
  else router.replace(routes.tasks);
}

/** Screen 3 — Add / Edit task. Opens empty for a new task, or filled in when an `id` is passed. */
export default function TaskFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getTask, loadState } = useTasks();

  if (loadState === 'loading') return <LoadingView />;

  const existing = id ? getTask(id) : undefined;
  if (id && !existing) {
    return (
      <>
        <Stack.Screen options={{ title: 'Task not found' }} />
        <EmptyState
          icon="help-circle-outline"
          title="Task not found"
          message="It may have been deleted."
          actionLabel="Go back"
          onAction={closeForm}
        />
      </>
    );
  }

  // The key resets the form when switching between tasks.
  return <TaskForm key={id ?? 'new'} existing={existing} />;
}

function TaskForm({ existing }: { existing?: Task }) {
  const { deleteTask } = useTasks();
  const { values, errors, setField, submit, isEditing, titleRef, courseRef, dueDateRef, dueTimeRef, notesRef } =
    useTaskForm(existing);
  const today = todayISO();
  const errorCount = Object.keys(errors).length;

  const quickDates = [
    { label: 'Today', value: today },
    { label: 'Tomorrow', value: addDays(today, 1) },
    { label: 'In a week', value: addDays(today, 7) },
  ];

  function handleSave() {
    if (submit()) closeForm();
  }

  async function handleDelete() {
    if (!existing) return;
    const confirmed = await confirm('Delete this task?', `"${existing.title}" will be removed from StudyPulse.`);
    if (confirmed) {
      deleteTask(existing.id);
      closeForm();
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: isEditing ? 'Edit task' : 'New task' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {errorCount > 0 && (
          <ErrorBanner message={`Please fix ${errorCount} field${errorCount === 1 ? '' : 's'} below.`} />
        )}

        <FormField
          ref={titleRef}
          label="Title"
          value={values.title}
          onChangeText={(text) => setField('title', text)}
          placeholder="e.g. Databases midterm"
          maxLength={LIMITS.titleMax}
          returnKeyType="next"
          onSubmitEditing={() => courseRef.current?.focus()}
          error={errors.title}
        />

        <FormField
          ref={courseRef}
          label="Course code"
          value={values.course}
          onChangeText={(text) => setField('course', text)}
          placeholder="e.g. CSCI38H"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={12}
          returnKeyType="next"
          onSubmitEditing={() => dueDateRef.current?.focus()}
          error={errors.course}
        />

        <ChoiceField label="Type" options={TYPE_OPTIONS} value={values.type} onChange={(type) => setField('type', type)} />

        <View style={styles.row}>
          <FormField
            ref={dueDateRef}
            label="Due date"
            value={values.dueDate}
            onChangeText={(text) => setField('dueDate', text)}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            error={errors.dueDate}
            containerStyle={styles.dateField}
          />
          <FormField
            ref={dueTimeRef}
            label="Time"
            optional
            value={values.dueTime}
            onChangeText={(text) => setField('dueTime', text)}
            placeholder="HH:MM"
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            error={errors.dueTime}
            containerStyle={styles.timeField}
          />
        </View>
        <View style={styles.quickDates}>
          {quickDates.map((option) => (
            <Chip
              key={option.label}
              label={option.label}
              selected={values.dueDate === option.value}
              onPress={() => setField('dueDate', option.value)}
            />
          ))}
        </View>

        <ChoiceField
          label="Priority"
          options={PRIORITY_OPTIONS}
          value={values.priority}
          onChange={(priority) => setField('priority', priority)}
        />

        <ChoiceField
          label="Reminder"
          options={REMINDER_OPTIONS}
          value={values.reminderMinutes}
          onChange={(minutes) => setField('reminderMinutes', minutes)}
          error={errors.reminder}
          hint="Arrives as a notification on this phone."
        />

        <FormField
          ref={notesRef}
          label="Notes"
          optional
          value={values.notes}
          onChangeText={(text) => setField('notes', text)}
          placeholder="Chapters to cover, room, what to bring…"
          multiline
          maxLength={LIMITS.notesMax}
          hint={`${values.notes.length}/${LIMITS.notesMax}`}
          error={errors.notes}
        />

        <View style={styles.actions}>
          <AppButton title={isEditing ? 'Save changes' : 'Add task'} icon="checkmark" onPress={handleSave} />
          {isEditing && <AppButton title="Delete task" icon="trash-outline" variant="danger" onPress={handleDelete} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  dateField: { flex: 3 },
  timeField: { flex: 2 },
  quickDates: { flexDirection: 'row', gap: spacing.sm, marginTop: -spacing.sm },
  actions: { gap: spacing.md, marginTop: spacing.sm },
});
