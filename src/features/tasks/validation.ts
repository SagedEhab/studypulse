import { isValidISODate, isValidTime, toISODate } from './dates';
import type { TaskInput } from './types';

export type TaskField = 'title' | 'course' | 'dueDate' | 'dueTime' | 'reminder' | 'notes';
export type TaskErrors = Partial<Record<TaskField, string>>;

export const LIMITS = { titleMin: 3, titleMax: 60, notesMax: 200 } as const;

/** Reminders count back from the due time, or from 09:00 when the task has no time. */
export function reminderTime(input: Pick<TaskInput, 'dueDate' | 'dueTime' | 'reminderMinutes'>): Date | null {
  if (input.reminderMinutes === null) return null;
  const [y, m, d] = input.dueDate.split('-').map(Number);
  const [hh, mm] = (input.dueTime || '09:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm - input.reminderMinutes);
}

/**
 * Checks a task before it is saved. Returns one message per invalid field (empty = valid).
 * New tasks may not be due in the past or have a reminder that has already passed.
 */
export function validateTask(input: TaskInput, { isNew, now }: { isNew: boolean; now: Date }): TaskErrors {
  const errors: TaskErrors = {};

  const title = input.title.trim();
  if (!title) errors.title = 'Title is required';
  else if (title.length < LIMITS.titleMin) errors.title = `Title must be at least ${LIMITS.titleMin} characters`;
  else if (title.length > LIMITS.titleMax) errors.title = `Title must be ${LIMITS.titleMax} characters or fewer`;

  const course = input.course.trim();
  if (!course) errors.course = 'Course code is required';
  else if (!/^[A-Za-z0-9]{2,12}$/.test(course)) errors.course = 'Use 2–12 letters or digits, e.g. CSCI38H';

  if (!input.dueDate) errors.dueDate = 'Due date is required';
  else if (!isValidISODate(input.dueDate)) errors.dueDate = 'Enter a real date as YYYY-MM-DD';
  else if (isNew && input.dueDate < toISODate(now)) errors.dueDate = 'Due date cannot be in the past';

  if (input.dueTime && !isValidTime(input.dueTime)) errors.dueTime = 'Use 24-hour time, e.g. 09:30';

  if (input.reminderMinutes !== null && !errors.dueDate && !errors.dueTime) {
    if (input.reminderMinutes < 24 * 60 && !input.dueTime) {
      errors.reminder = 'Add a due time to get a reminder 1 hour before';
    } else if (isNew && (reminderTime(input)?.getTime() ?? 0) <= now.getTime()) {
      errors.reminder = 'That reminder time has already passed. Pick a shorter one or turn it off';
    }
  }

  if (input.notes.trim().length > LIMITS.notesMax) errors.notes = `Notes must be ${LIMITS.notesMax} characters or fewer`;

  return errors;
}
