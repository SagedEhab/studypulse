import { readJSON, writeJSON } from '@/services/storage';
import type { Task } from '../types';

const TASKS_KEY = 'studypulse/tasks/v1';

/**
 * The only code that knows where tasks are stored. Screens never touch storage directly,
 * so Phase 2 can add Google Calendar sync or a cloud backup here without changing the UI.
 */
export const taskRepository = {
  load: () => readJSON<Task[]>(TASKS_KEY),
  save: (tasks: Task[]) => writeJSON(TASKS_KEY, tasks),
};
