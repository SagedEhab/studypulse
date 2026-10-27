import { Alert, Platform } from 'react-native';

/** Asks the user to confirm a destructive action. Resolves true only when they confirm. */
export function confirm(title: string, message: string, confirmLabel = 'Delete'): Promise<boolean> {
  if (Platform.OS === 'web') {
    const webConfirm = (globalThis as { confirm?: (text: string) => boolean }).confirm;
    return Promise.resolve(webConfirm?.(`${title}\n\n${message}`) ?? false);
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
