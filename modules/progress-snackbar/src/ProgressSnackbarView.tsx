import type { PrimitiveBaseProps } from '@expo/ui/jetpack-compose';
import { createViewModifierEventListener } from '@expo/ui/jetpack-compose/modifiers';
import { requireNativeView } from 'expo';

import type {
  ProgressSnackbarFinishedEvent,
  ProgressSnackbarProps,
} from './ProgressSnackbar.types';

type NativeProps = Omit<ProgressSnackbarProps, 'modifiers' | 'onFinished'> &
  PrimitiveBaseProps & {
    onFinished?: (event: { nativeEvent: ProgressSnackbarFinishedEvent }) => void;
  };

const NativeProgressSnackbar = requireNativeView<NativeProps>(
  'ProgressSnackbar',
  'ProgressSnackbarView'
);

export default function ProgressSnackbarView({
  onFinished,
  modifiers,
  message = '',
  variant = 'success',
  durationMs = 4000,
  token = 0,
  ...props
}: ProgressSnackbarProps) {
  return (
    <NativeProgressSnackbar
      {...props}
      message={message}
      variant={variant}
      durationMs={durationMs}
      token={token}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      onFinished={
        onFinished
          ? ({ nativeEvent }) => {
              onFinished(nativeEvent);
            }
          : undefined
      }
    />
  );
}
