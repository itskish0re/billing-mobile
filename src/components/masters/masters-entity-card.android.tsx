import {
  Column,
  Icon,
  IconButton,
  OutlinedCard,
  Row,
  Spacer,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth, padding, weight } from '@expo/ui/jetpack-compose/modifiers';

import type { MasterListRow } from '@/components/masters/masters-types';

const EDIT_ICON = require('@/assets/icons/edit.xml');
const DELETE_ICON = require('@/assets/icons/delete.xml');

type MastersEntityCardProps = {
  row: MasterListRow;
  onEdit: (row: MasterListRow) => void;
  onDelete: (row: MasterListRow) => void;
};

export function MastersEntityCard({ row, onEdit, onDelete }: MastersEntityCardProps) {
  const colors = useMaterialColors();

  return (
    <OutlinedCard
      modifiers={[fillMaxWidth()]}
      colors={{ containerColor: colors.surface }}
      border={{ color: colors.outlineVariant, width: 1 }}>
      <Column
        modifiers={[fillMaxWidth(), padding(16, 16, 16, 16)]}
        verticalArrangement={{ spacedBy: 8 }}>
        <Row verticalAlignment="center" modifiers={[fillMaxWidth()]}>
          <Column modifiers={[weight(1)]} verticalArrangement={{ spacedBy: 2 }}>
            <Text style={{ typography: 'titleMedium' }}>{row.title}</Text>
            {row.subtitle ? (
              <Text color={colors.onSurfaceVariant} style={{ typography: 'bodyMedium' }}>
                {row.subtitle}
              </Text>
            ) : null}
            {row.meta ? (
              <Text color={colors.onSurfaceVariant} style={{ typography: 'bodySmall' }}>
                {row.meta}
              </Text>
            ) : null}
          </Column>

          <Spacer />

          <Row horizontalArrangement={{ spacedBy: 4 }} verticalAlignment="center">
            <IconButton onClick={() => onEdit(row)}>
              <Icon source={EDIT_ICON} size={22} tint={colors.primary} />
            </IconButton>
            <IconButton onClick={() => onDelete(row)}>
              <Icon source={DELETE_ICON} size={22} tint={colors.error} />
            </IconButton>
          </Row>
        </Row>
      </Column>
    </OutlinedCard>
  );
}
