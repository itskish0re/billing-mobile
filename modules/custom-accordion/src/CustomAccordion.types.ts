import type { PrimitiveBaseProps } from '@expo/ui/jetpack-compose';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

export type CustomAccordionVariant = 'border' | 'card';

export type CustomAccordionExpandedChangeEvent = {
  expanded: boolean;
};

export type CustomAccordionProps = {
  /** Header label shown next to the chevron. */
  title: string;
  /** Controlled expanded state. */
  expanded?: boolean;
  /**
   * `border` — full-width strip with a bottom divider (Filter accordion style).
   * `card` — Material card with elevation / rounded corners (bill form sections).
   */
  variant?: CustomAccordionVariant;
  containerColor?: ColorValue;
  contentColor?: ColorValue;
  /** Bottom divider color for the `border` variant. */
  dividerColor?: ColorValue;
  /** Corner radius in dp for the `card` variant. @default 12 */
  cornerRadius?: number;
  /** Elevation in dp for the `card` variant. @default 1 */
  elevation?: number;
  headerPaddingStart?: number;
  headerPaddingTop?: number;
  headerPaddingEnd?: number;
  headerPaddingBottom?: number;
  contentPaddingStart?: number;
  contentPaddingTop?: number;
  contentPaddingEnd?: number;
  contentPaddingBottom?: number;
  /** Vertical gap between content children in dp. @default 12 */
  contentSpacing?: number;
  onExpandedChange?: (event: CustomAccordionExpandedChangeEvent) => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
} & PrimitiveBaseProps;
