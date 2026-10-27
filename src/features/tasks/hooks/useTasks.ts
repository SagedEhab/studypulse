import { useContext } from 'react';

import { TasksContext } from '../providers/TasksProvider';

export function useTasks() {
  const value = useContext(TasksContext);
  if (!value) throw new Error('useTasks must be used inside TasksProvider');
  return value;
}
