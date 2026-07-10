import {
  AnimatedVisibility,
  Column,
  EnterTransition,
  ExitTransition,
  Icon,
  ListItem,
  Row,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  animated,
  background,
  clickable,
  clip,
  graphicsLayer,
  padding,
  Shapes,
  spring,
} from '@expo/ui/jetpack-compose/modifiers';
import { type ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

import { useAccordionItemState } from '@/components/ui/accordion/accordion-context';

const CHEVRON_ICON = require('@/assets/icons/keyboard_arrow_down.xml');

const CONTAINER_SHAPE = Shapes.RoundedCorner(16);
const ENTER = EnterTransition.expandVertically().plus(EnterTransition.fadeIn());
const EXIT = ExitTransition.shrinkVertically().plus(ExitTransition.fadeOut());

export type AccordionItemProps = {
  value: string;
  title: string;
  defaultOpen?: boolean;
  compact?: boolean;
  iconSource?: ImageSourcePropType;
  action?: ReactNode;
  children?: ReactNode;
};

export function AccordionItem({
  value,
  title,
  defaultOpen = false,
  compact = false,
  iconSource,
  action,
  children,
}: AccordionItemProps) {
  const colors = useMaterialColors();
  const { isOpen, setOpen } = useAccordionItemState(value, defaultOpen);
  const containerColor = isOpen ? colors.surfaceContainer : 'transparent';
  const contentPadding = compact ? 12 : 16;

  return (
    <Column
      modifiers={[
        clip(CONTAINER_SHAPE),
        background(containerColor, { animationSpec: spring() }),
      ]}>
      <ListItem
        colors={{ containerColor: 'transparent' }}
        modifiers={[clickable(() => setOpen(!isOpen))]}>
        {iconSource ? (
          <ListItem.LeadingContent>
            <Icon source={iconSource} size={24} tint={colors.primary} />
          </ListItem.LeadingContent>
        ) : null}

        <ListItem.HeadlineContent>
          <Text style={{ typography: compact ? 'titleSmall' : 'titleMedium' }}>{title}</Text>
        </ListItem.HeadlineContent>

        <ListItem.TrailingContent>
          <Row horizontalArrangement={{ spacedBy: 8 }} verticalAlignment="center">
            {action}
            <Icon
              source={CHEVRON_ICON}
              modifiers={[graphicsLayer({ rotationZ: animated(isOpen ? 180 : 0, spring()) })]}
            />
          </Row>
        </ListItem.TrailingContent>
      </ListItem>

      <AnimatedVisibility visible={isOpen} enterTransition={ENTER} exitTransition={EXIT}>
        <Column modifiers={[padding(contentPadding, contentPadding, contentPadding, contentPadding)]}>
          {children}
        </Column>
      </AnimatedVisibility>
    </Column>
  );
}
