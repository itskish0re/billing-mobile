import type { PrimitiveBaseProps } from '@expo/ui/jetpack-compose';
import { createViewModifierEventListener } from '@expo/ui/jetpack-compose/modifiers';
import { requireNativeView } from 'expo';
import type { ReactNode } from 'react';

import type {
  CustomAccordionExpandedChangeEvent,
  CustomAccordionProps,
} from './CustomAccordion.types';

type NativeProps = Omit<CustomAccordionProps, 'onExpandedChange' | 'modifiers' | 'children'> &
  PrimitiveBaseProps & {
    children?: ReactNode;
    onExpandedChange?: (event: { nativeEvent: CustomAccordionExpandedChangeEvent }) => void;
  };

const NativeCustomAccordion = requireNativeView<NativeProps>(
  'CustomAccordion',
  'CustomAccordionView'
);

export default function CustomAccordionView({
  onExpandedChange,
  modifiers,
  variant = 'border',
  expanded = false,
  cornerRadius = 12,
  elevation = 1,
  headerPaddingStart = 16,
  headerPaddingTop = 0,
  headerPaddingEnd = 16,
  headerPaddingBottom = 0,
  contentPaddingStart = 16,
  contentPaddingTop = 16,
  contentPaddingEnd = 16,
  contentPaddingBottom = 16,
  contentSpacing = 12,
  ...props
}: CustomAccordionProps) {
  return (
    <NativeCustomAccordion
      {...props}
      variant={variant}
      expanded={expanded}
      cornerRadius={cornerRadius}
      elevation={elevation}
      headerPaddingStart={headerPaddingStart}
      headerPaddingTop={headerPaddingTop}
      headerPaddingEnd={headerPaddingEnd}
      headerPaddingBottom={headerPaddingBottom}
      contentPaddingStart={contentPaddingStart}
      contentPaddingTop={contentPaddingTop}
      contentPaddingEnd={contentPaddingEnd}
      contentPaddingBottom={contentPaddingBottom}
      contentSpacing={contentSpacing}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      onExpandedChange={
        onExpandedChange
          ? ({ nativeEvent }) => {
              onExpandedChange(nativeEvent);
            }
          : undefined
      }
    />
  );
}
