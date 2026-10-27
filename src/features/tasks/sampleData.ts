import { addDays, toISODate } from './dates';
import type { Task } from './types';

/** Starter tasks shown on first launch so the prototype is not empty. Dates are relative to today. */
export function createSampleTasks(now = new Date()): Task[] {
  const today = toISODate(now);
  const createdAt = now.toISOString();
  const base = { notes: '', done: false, createdAt, dueTime: '', reminderMinutes: null };

  return [
    { ...base, id: 'sample-1', title: 'Phase 1 report', course: 'CSCI38H', type: 'assignment', priority: 'high', dueDate: today, dueTime: '23:59', reminderMinutes: 60, notes: 'Diagrams, architecture, data plan and screenshots.' },
    { ...base, id: 'sample-2', title: 'Read chapter 4: Normalisation', course: 'CSCI25', type: 'study', priority: 'medium', dueDate: today },
    { ...base, id: 'sample-3', title: 'Statistics problem set 3', course: 'MATH21', type: 'assignment', priority: 'medium', dueDate: addDays(today, -2) },
    { ...base, id: 'sample-4', title: 'Revise lecture 5 slides', course: 'CSCI31', type: 'study', priority: 'low', dueDate: addDays(today, 1) },
    { ...base, id: 'sample-5', title: 'Databases midterm', course: 'CSCI25', type: 'exam', priority: 'high', dueDate: addDays(today, 3), dueTime: '10:00', reminderMinutes: 24 * 60, notes: 'Chapters 1 to 5, bring a calculator.' },
    { ...base, id: 'sample-6', title: 'Networks quiz', course: 'CSCI31', type: 'exam', priority: 'medium', dueDate: addDays(today, 9), dueTime: '12:00', reminderMinutes: 24 * 60 },
    { ...base, id: 'sample-7', title: 'Lab 4 exercises', course: 'CSCI38H', type: 'assignment', priority: 'low', dueDate: addDays(today, 2), done: true },
    { ...base, id: 'sample-8', title: 'Algorithms worksheet', course: 'CSCI22', type: 'assignment', priority: 'medium', dueDate: addDays(today, 5), done: true },
  ];
}
