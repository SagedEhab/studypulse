import type { IconName } from '@/components/ui/icon';
import type { Priority, TaskType } from './types';

export const TYPE_META: Record<TaskType, { label: string; plural: string; color: string; soft: string; icon: IconName }> = {
  assignment: { label: 'Assignment', plural: 'Assignments', color: '#4F46E5', soft: '#EEF2FF', icon: 'document-text-outline' },
  exam: { label: 'Exam', plural: 'Exams', color: '#E11D48', soft: '#FFF1F2', icon: 'school-outline' },
  study: { label: 'Study session', plural: 'Study', color: '#0D9488', soft: '#F0FDFA', icon: 'book-outline' },
};

export const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  high: { label: 'High', color: '#DC2626' },
  medium: { label: 'Medium', color: '#F59E0B' },
  low: { label: 'Low', color: '#94A3B8' },
};

export const TYPE_OPTIONS = (Object.keys(TYPE_META) as TaskType[]).map((value) => ({
  value,
  label: TYPE_META[value].label,
  color: TYPE_META[value].color,
}));

export const PRIORITY_OPTIONS = (['low', 'medium', 'high'] as Priority[]).map((value) => ({
  value,
  label: PRIORITY_META[value].label,
  color: PRIORITY_META[value].color,
}));

export const REMINDER_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Off' },
  { value: 60, label: '1 hour before' },
  { value: 24 * 60, label: '1 day before' },
  { value: 2 * 24 * 60, label: '2 days before' },
];
