import {
  AnimatedVisibility,
  Column,
  DockedSearchBar,
  EnterTransition,
  ExitTransition,
  HorizontalDivider,
  Icon,
  ListItem,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  animated,
  clickable,
  fillMaxWidth,
  graphicsLayer,
  padding,
  spring,
} from '@expo/ui/jetpack-compose/modifiers';
import { type ReactNode, useState } from 'react';

const CHEVRON_ICON = require('@/assets/icons/keyboard_arrow_down.xml');
const SEARCH_ICON = require('@/assets/icons/search.xml');

const ENTER = EnterTransition.expandVertically().plus(EnterTransition.fadeIn());
const EXIT = ExitTransition.shrinkVertically().plus(ExitTransition.fadeOut());

export type FilterAccordionProps = {
  searchPlaceholder: string;
  onSearchQueryChange: (query: string) => void;
  children?: ReactNode;
};

export function FilterAccordion({
  searchPlaceholder,
  onSearchQueryChange,
  children,
}: FilterAccordionProps) {
  const colors = useMaterialColors();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Column modifiers={[fillMaxWidth()]}>
      <ListItem
        colors={{ containerColor: 'transparent' }}
        modifiers={[
          fillMaxWidth(),
          padding(16, 0, 16, 0),
          clickable(() => setIsOpen((open) => !open)),
        ]}>
        <ListItem.HeadlineContent>
          <Text style={{ typography: 'titleSmall' }}>Filter</Text>
        </ListItem.HeadlineContent>

        <ListItem.TrailingContent>
          <Icon
            source={CHEVRON_ICON}
            modifiers={[graphicsLayer({ rotationZ: animated(isOpen ? 180 : 0, spring()) })]}
          />
        </ListItem.TrailingContent>
      </ListItem>

      <AnimatedVisibility visible={isOpen} enterTransition={ENTER} exitTransition={EXIT}>
        <Column
          modifiers={[fillMaxWidth(), padding(16, 16, 16, 16)]}
          verticalArrangement={{ spacedBy: 12 }}>
          {children}

          <DockedSearchBar onQueryChange={onSearchQueryChange} modifiers={[fillMaxWidth()]}>
            <DockedSearchBar.Placeholder>
              <Text color={colors.onSurfaceVariant}>{searchPlaceholder}</Text>
            </DockedSearchBar.Placeholder>
            <DockedSearchBar.LeadingIcon>
              <Icon source={SEARCH_ICON} size={20} tint={colors.onSurfaceVariant} />
            </DockedSearchBar.LeadingIcon>
          </DockedSearchBar>
        </Column>
      </AnimatedVisibility>

      <HorizontalDivider thickness={1} color={colors.outlineVariant} />
    </Column>
  );
}
