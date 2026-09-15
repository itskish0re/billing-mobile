import {
  Column,
  HorizontalDivider,
  Icon,
  Row,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  alpha,
  animated,
  clickable,
  clip,
  fillMaxWidth,
  graphicsLayer,
  height,
  padding,
  Shapes,
  spring,
} from '@expo/ui/jetpack-compose/modifiers';
import { type ReactNode, useState } from 'react';

const CHEVRON_ICON = require('@/assets/icons/keyboard_arrow_down.xml');

export type FilterAccordionProps = {
  children?: ReactNode;
};

/**
 * Filter accordion. Children stay mounted when collapsed so OutlinedTextField /
 * useNativeState SharedObjects are not released (AnimatedVisibility would).
 */
export function FilterAccordion({ children }: FilterAccordionProps) {
  const colors = useMaterialColors();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Column modifiers={[fillMaxWidth()]}>
      <Row
        modifiers={[fillMaxWidth(), clickable(() => setIsOpen((open) => !open)), padding(16, 12, 16, 12)]}
        horizontalArrangement="spaceBetween"
        verticalAlignment="center">
        <Text color={colors.onSurface} style={{ typography: 'titleSmall' }}>
          Filter
        </Text>
        <Icon
          source={CHEVRON_ICON}
          size={24}
          tint={colors.onSurfaceVariant}
          modifiers={[graphicsLayer({ rotationZ: animated(isOpen ? 180 : 0, spring()) })]}
        />
      </Row>

      <Column
        modifiers={[
          fillMaxWidth(),
          ...(isOpen
            ? [padding(16, 0, 16, 16)]
            : [height(0), alpha(0), clip(Shapes.Rectangle)]),
        ]}
        verticalArrangement={{ spacedBy: 12 }}>
        {children}
      </Column>

      <HorizontalDivider thickness={1} color={colors.outlineVariant} />
    </Column>
  );
}
