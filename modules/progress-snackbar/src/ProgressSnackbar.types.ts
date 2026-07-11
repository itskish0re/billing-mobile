import type { PrimitiveBaseProps } from '@expo/ui/jetpack-compose';
import type { ColorValue } from 'react-native';

export type ProgressSnackbarVariant = 'success' | 'error';

export type ProgressSnackbarFinishedEvent = {
  reason: 'timeout' | 'dismissed' | string;
  token: number;
};

export type ProgressSnackbarProps = {
  message?: string;
  variant?: ProgressSnackbarVariant;
  durationMs?: number;
  /** Change this to restart the timer for a new toast. */
  token?: number;
  successAccentColor?: ColorValue;
  errorAccentColor?: ColorValue;
  containerColor?: ColorValue;
  contentColor?: ColorValue;
  onFinished?: (event: ProgressSnackbarFinishedEvent) => void;
} & PrimitiveBaseProps;
