import { DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { TasksProvider } from '@/features/tasks';
import { colors } from '@/theme/tokens';

const theme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

/** Root stack: the tab screens, with the task form pushed on top. TasksProvider shares the task list with every screen. */
export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <TasksProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerTintColor: colors.primary, headerTitleStyle: { color: colors.text } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="task/form" options={{ title: 'Task' }} />
        </Stack>
      </TasksProvider>
    </ThemeProvider>
  );
}
