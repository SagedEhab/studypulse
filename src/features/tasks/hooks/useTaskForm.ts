import { useRef, useState } from 'react';
import type { TextInputInstance } from 'react-native';

import type { Task, TaskInput } from '../types';
import { validateTask, type TaskErrors, type TaskField } from '../validation';
import { useTasks } from './useTasks';

const EMPTY_TASK: TaskInput = {
  title: '',
  course: '',
  type: 'assignment',
  priority: 'medium',
  dueDate: '',
  dueTime: '',
  reminderMinutes: null,
  notes: '',
};

// The order fields appear on screen, so the first invalid one gets focus.
const FIELD_ORDER: TaskField[] = ['title', 'course', 'dueDate', 'dueTime', 'reminder', 'notes'];

const ERROR_FIELD: Partial<Record<keyof TaskInput, TaskField>> = {
  title: 'title',
  course: 'course',
  dueDate: 'dueDate',
  dueTime: 'dueTime',
  reminderMinutes: 'reminder',
  notes: 'notes',
};

function toInput({ title, course, type, priority, dueDate, dueTime, reminderMinutes, notes }: Task): TaskInput {
  return { title, course, type, priority, dueDate, dueTime, reminderMinutes, notes };
}

/** Form state, validation and saving for the Add / Edit task screen. */
export function useTaskForm(existing?: Task) {
  const { addTask, updateTask } = useTasks();
  const [values, setValues] = useState<TaskInput>(() => (existing ? toInput(existing) : EMPTY_TASK));
  const [errors, setErrors] = useState<TaskErrors>({});

  const titleRef = useRef<TextInputInstance>(null);
  const courseRef = useRef<TextInputInstance>(null);
  const dueDateRef = useRef<TextInputInstance>(null);
  const dueTimeRef = useRef<TextInputInstance>(null);
  const notesRef = useRef<TextInputInstance>(null);

  function setField<K extends keyof TaskInput>(key: K, value: TaskInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    // Clear the message for the field the user is fixing (a new date or time can also fix the reminder).
    setErrors((current) => {
      const next = { ...current };
      const field = ERROR_FIELD[key];
      if (field) delete next[field];
      if (key === 'dueDate' || key === 'dueTime') delete next.reminder;
      return next;
    });
  }

  /** Validates and saves. Returns true when the task was saved. */
  function submit(): boolean {
    const input: TaskInput = {
      ...values,
      title: values.title.trim(),
      course: values.course.trim().toUpperCase(),
      notes: values.notes.trim(),
    };
    const found = validateTask(input, { isNew: !existing, now: new Date() });
    setErrors(found);

    const firstInvalid = FIELD_ORDER.find((field) => found[field]);
    if (firstInvalid) {
      const inputs = { title: titleRef, course: courseRef, dueDate: dueDateRef, dueTime: dueTimeRef, notes: notesRef };
      if (firstInvalid !== 'reminder') inputs[firstInvalid].current?.focus();
      return false;
    }

    if (existing) updateTask(existing.id, input);
    else addTask(input);
    return true;
  }

  return {
    values,
    errors,
    setField,
    submit,
    isEditing: Boolean(existing),
    titleRef,
    courseRef,
    dueDateRef,
    dueTimeRef,
    notesRef,
  };
}
