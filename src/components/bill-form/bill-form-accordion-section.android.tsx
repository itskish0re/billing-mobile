import {
  AnimatedVisibility,
  Badge,
  Column,
  EnterTransition,
  ExitTransition,
  Icon,
  OutlinedCard,
  Row,
  Spacer,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  animated,
  background,
  clickable,
  fillMaxWidth,
  graphicsLayer,
  padding,
  spring,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';
import { type ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

import { useAccordionItemState } from '@/components/ui/accordion/accordion-context';

const CHEVRON_ICON = require('@/assets/icons/keyboard_arrow_down.xml');

const HEADER_PADDING = 16;
const BODY_PADDING = 16;
const ENTER = EnterTransition.expandVertically().plus(EnterTransition.fadeIn());
const EXIT = ExitTransition.shrinkVertically().plus(ExitTransition.fadeOut());

export type BillFormAccordionSectionProps = {
  value: string;
  title: string;
  icon: ImageSourcePropType;
  badge?: string;
  action?: ReactNode;
  children?: ReactNode;
};

export function BillFormAccordionSection({
  value,
  title,
  icon,
  badge,
  action,
  children,
}: BillFormAccordionSectionProps) {
  const colors = useMaterialColors();
  const { isOpen, setOpen } = useAccordionItemState(value);
  const headerBackground = isOpen ? colors.surfaceContainerHigh : colors.surfaceContainerLow;

  return (
    <OutlinedCard
      modifiers={[fillMaxWidth()]}
      colors={{ containerColor: colors.surface }}
      border={{ color: colors.outlineVariant, width: 1 }}>
      <Column modifiers={[fillMaxWidth()]}>
        <Row
          verticalAlignment="center"
          horizontalArrangement={{ spacedBy: 12 }}
          modifiers={[
            fillMaxWidth(),
            background(headerBackground, { animationSpec: spring() }),
            clickable(() => setOpen(!isOpen)),
            padding(HEADER_PADDING, HEADER_PADDING, HEADER_PADDING, HEADER_PADDING),
          ]}>
          <Icon source={icon} size={22} tint={colors.primary} />

          <Text style={{ typography: 'titleMedium' }}>{title}</Text>

          <Spacer modifiers={[weight(1)]} />

          {badge ? (
            <Badge
              containerColor={colors.surfaceContainerHighest}
              contentColor={colors.onSurfaceVariant}>
              <Text style={{ typography: 'labelSmall' }}>{badge}</Text>
            </Badge>
          ) : null}

          {action}

          <Icon
            source={CHEVRON_ICON}
            modifiers={[graphicsLayer({ rotationZ: animated(isOpen ? 180 : 0, spring()) })]}
          />
        </Row>

        <AnimatedVisibility visible={isOpen} enterTransition={ENTER} exitTransition={EXIT}>
          <Column
            modifiers={[
              fillMaxWidth(),
              padding(BODY_PADDING, BODY_PADDING, BODY_PADDING, BODY_PADDING),
            ]}
            verticalArrangement={{ spacedBy: 12 }}>
            {children}
          </Column>
        </AnimatedVisibility>
      </Column>
    </OutlinedCard>
  );
}
