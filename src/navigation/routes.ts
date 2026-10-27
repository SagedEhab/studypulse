import type { Href } from 'expo-router';

/** Every link in the app is built here, so a renamed route only changes one file. */
export const routes = {
  today: '/' as Href,
  tasks: '/tasks' as Href,
  newTask: (): Href => '/task/form',
  editTask: (id: string): Href => ({ pathname: '/task/form', params: { id } }),
};
