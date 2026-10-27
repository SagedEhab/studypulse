import { createContext, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { createSampleTasks } from '../sampleData';
import { taskRepository } from '../services/taskRepository';
import type { Task, TaskInput } from '../types';

type LoadState = 'loading' | 'ready' | 'error';

export type TasksContextValue = {
  tasks: Task[];
  loadState: LoadState;
  saveError: string | null;
  reload: () => void;
  getTask: (id: string) => Task | undefined;
  addTask: (input: TaskInput) => void;
  updateTask: (id: string, input: TaskInput) => void;
  toggleDone: (id: string) => void;
  deleteTask: (id: string) => void;
  dismissSaveError: () => void;
};

export const TasksContext = createContext<TasksContextValue | null>(null);

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Owns the task list for the whole app: loads it from the device once, then saves every change. */
export function TasksProvider({ children }: PropsWithChildren) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(() => {
    taskRepository
      .load()
      .then((saved) => {
        if (saved) {
          setTasks(saved);
        } else {
          // First launch: start with sample tasks and keep them, so the list is stable between launches.
          const sample = createSampleTasks();
          setTasks(sample);
          taskRepository.save(sample).catch(() => undefined);
        }
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(() => {
    setLoadState('loading');
    load();
  }, [load]);

  // Every change goes through here: update the screen straight away, then save to the device.
  const commit = useCallback((next: Task[]) => {
    setTasks(next);
    setSaveError(null);
    taskRepository.save(next).catch(() => setSaveError('Your last change could not be saved on this device.'));
  }, []);

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks,
      loadState,
      saveError,
      reload,
      getTask: (id) => tasks.find((task) => task.id === id),
      addTask: (input) => commit([{ ...input, id: createId(), done: false, createdAt: new Date().toISOString() }, ...tasks]),
      updateTask: (id, input) => commit(tasks.map((task) => (task.id === id ? { ...task, ...input } : task))),
      toggleDone: (id) => commit(tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task))),
      deleteTask: (id) => commit(tasks.filter((task) => task.id !== id)),
      dismissSaveError: () => setSaveError(null),
    }),
    [tasks, loadState, saveError, reload, commit],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}
