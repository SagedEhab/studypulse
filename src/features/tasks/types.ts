export type TaskType = 'assignment' | 'exam' | 'study';
export type Priority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  course: string; // course code, e.g. CSCI38H
  type: TaskType;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:MM (24h), or '' when no time is set
  reminderMinutes: number | null; // minutes before the due time; null = no reminder
  notes: string;
  done: boolean;
  createdAt: string; // ISO timestamp
};

/** The fields the user edits in the task form. */
export type TaskInput = Omit<Task, 'id' | 'done' | 'createdAt'>;
