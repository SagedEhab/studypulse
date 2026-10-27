import { addDays, daysBetween, formatDay } from './dates';
import type { Task, TaskType } from './types';

export type StatusFilter = 'pending' | 'done' | 'all';
export type TaskFilters = { status: StatusFilter; type: TaskType | 'all'; query: string };

/** Pending tasks first, then by due date and time (tasks without a time go last on their day). */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const byDate = a.dueDate.localeCompare(b.dueDate);
    if (byDate !== 0) return byDate;
    return (a.dueTime || '99:99').localeCompare(b.dueTime || '99:99');
  });
}

/** Status, type and a case-insensitive search over the title and course code. */
export function filterTasks(tasks: Task[], { status, type, query }: TaskFilters): Task[] {
  const q = query.trim().toLowerCase();
  return tasks.filter((task) => {
    if (status === 'pending' && task.done) return false;
    if (status === 'done' && !task.done) return false;
    if (type !== 'all' && task.type !== type) return false;
    if (q && !task.title.toLowerCase().includes(q) && !task.course.toLowerCase().includes(q)) return false;
    return true;
  });
}

export type Dashboard = {
  overdue: Task[];
  dueToday: Task[];
  upcomingExams: Task[];
  week: { done: number; total: number };
};

/** Groups tasks for the Today screen. `today` is YYYY-MM-DD. */
export function buildDashboard(tasks: Task[], today: string): Dashboard {
  const weekEnd = addDays(today, 6);
  const examWindowEnd = addDays(today, 14);
  const pending = sortTasks(tasks.filter((t) => !t.done));
  const thisWeek = tasks.filter((t) => t.dueDate >= today && t.dueDate <= weekEnd);

  return {
    overdue: pending.filter((t) => t.dueDate < today),
    dueToday: pending.filter((t) => t.dueDate === today),
    upcomingExams: pending.filter((t) => t.type === 'exam' && t.dueDate > today && t.dueDate <= examWindowEnd),
    week: { done: thisWeek.filter((t) => t.done).length, total: thisWeek.length },
  };
}

export type DueTone = 'danger' | 'warning' | 'normal' | 'muted';

/** A short, human label for when a task is due, plus how urgent it should look. */
export function dueLabel(task: Pick<Task, 'dueDate' | 'dueTime' | 'done'>, today: string): { text: string; tone: DueTone } {
  const time = task.dueTime ? ` · ${task.dueTime}` : '';
  const diff = daysBetween(today, task.dueDate);

  if (task.done) return { text: `${formatDay(task.dueDate)}${time}`, tone: 'muted' };
  if (diff < 0) return { text: `Overdue · ${formatDay(task.dueDate)}`, tone: 'danger' };
  if (diff === 0) return { text: `Today${time}`, tone: 'warning' };
  if (diff === 1) return { text: `Tomorrow${time}`, tone: 'normal' };
  return { text: `${formatDay(task.dueDate)}${time}`, tone: 'normal' };
}
