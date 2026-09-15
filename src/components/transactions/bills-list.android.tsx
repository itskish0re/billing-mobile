import {
  Box,
  Column,
  Icon,
  LazyColumn,
  OutlinedCard,
  PullToRefreshBox,
  Row,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  align,
  clickable,
  clip,
  fillMaxSize,
  fillMaxWidth,
  padding,
  Shapes,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';
import { useState } from 'react';

import { mapBillListRowToPreview } from '@/lib/bills/bill-preview';
import { formatTruckNumber } from '@/lib/bills/format-truck-number';
import { shareBillPdf } from '@/lib/bills/share-bill-pdf';
import { useBillsList } from '@/hooks/use-bills-list';
import { useSnackbar } from '@/providers/snackbar-provider';
import type { BillListRow } from '@/types/bill-list';

const EDIT_ICON = require('@/assets/icons/edit.xml');
const PREVIEW_ICON = require('@/assets/icons/visibility.xml');
const SHARE_ICON = require('@/assets/icons/share.xml');

export type BillsListProps = {
  filterQuery: string;
  filtersReady: boolean;
  onEdit: (row: BillListRow) => void;
  onPreview: (row: BillListRow) => void;
};

function CenteredMessage({ text }: { text: string }) {
  const colors = useMaterialColors();
  return (
    <Column
      modifiers={[fillMaxSize()]}
      horizontalAlignment="center"
      verticalArrangement="center">
      <Text color={colors.onSurfaceVariant} style={{ typography: 'bodyLarge' }}>
        {text}
      </Text>
    </Column>
  );
}

function CardAction({
  icon,
  enabled = true,
  onClick,
}: {
  icon: number;
  enabled?: boolean;
  onClick: () => void;
}) {
  const colors = useMaterialColors();

  return (
    <Box
      modifiers={[
        clip(Shapes.RoundedCorner(6)),
        ...(enabled ? [clickable(onClick)] : []),
        padding(5, 5, 5, 5),
      ]}>
      <Icon
        source={icon}
        size={20}
        tint={enabled ? colors.primary : colors.onSurfaceVariant}
      />
    </Box>
  );
}

function BillListCard({
  row,
  sharing,
  onEdit,
  onPreview,
  onShare,
}: {
  row: BillListRow;
  sharing: boolean;
  onEdit: (row: BillListRow) => void;
  onPreview: (row: BillListRow) => void;
  onShare: (row: BillListRow) => void;
}) {
  const colors = useMaterialColors();
  const firstTo = row.loads[0]?.toLocationName ?? '';
  const formattedTruck = formatTruckNumber(row.truckNumber);
  const route = `${row.fromLocationName || '—'} → ${firstTo || '—'}`;

  return (
    <OutlinedCard
      modifiers={[fillMaxWidth()]}
      colors={{ containerColor: colors.surface }}
      border={{ color: colors.outlineVariant, width: 1 }}>
      <Column
        modifiers={[fillMaxWidth(), padding(12, 8, 12, 8)]}
        verticalArrangement={{ spacedBy: 2 }}>
        <Row modifiers={[fillMaxWidth()]} verticalAlignment="center" horizontalArrangement="spaceBetween">
          <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 6 }}>
            <Text color={colors.onSurface} style={{ typography: 'titleSmall' }}>
              {row.billNumber ? `BILL ${row.billNumber}` : 'BILL'}
            </Text>
            {row.isCancelled ? (
              <Text color={colors.error} style={{ typography: 'labelSmall' }}>
                Cancelled
              </Text>
            ) : null}
          </Row>
          <Text
            modifiers={[weight(1)]}
            maxLines={1}
            overflow="ellipsis"
            color={colors.onSurface}
            style={{ typography: 'bodyMedium', textAlign: 'end' }}>
            {route}
          </Text>
        </Row>

        <Text
          maxLines={1}
          overflow="ellipsis"
          color={colors.onSurface}
          style={{ typography: 'bodyMedium' }}>
          {row.nameBoardName.trim() || '—'}
        </Text>

        <Row modifiers={[fillMaxWidth()]} verticalAlignment="center" horizontalArrangement="spaceBetween">
          <Text
            modifiers={[weight(1)]}
            maxLines={1}
            overflow="ellipsis"
            color={colors.onSurface}
            style={{ typography: 'bodyMedium', fontFamily: 'monospace' }}>
            {formattedTruck || '—'}
          </Text>
          <Row horizontalArrangement={{ spacedBy: 2 }} verticalAlignment="center">
            <CardAction icon={EDIT_ICON} onClick={() => onEdit(row)} />
            <CardAction icon={PREVIEW_ICON} onClick={() => onPreview(row)} />
            <CardAction icon={SHARE_ICON} enabled={!sharing} onClick={() => onShare(row)} />
          </Row>
        </Row>
      </Column>
    </OutlinedCard>
  );
}

/**
 * Bills tab list. Fetches the active financial year's bills using the saved
 * filter query (`bill_date` bounds plus optional field filters).
 */
export function BillsList({
  filterQuery,
  filtersReady,
  onEdit,
  onPreview,
}: BillsListProps) {
  const { showSnackbar } = useSnackbar();
  const [sharingBillId, setSharingBillId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data = [], isLoading, isError, error, refetch, isRefetching } = useBillsList({
    filterQuery,
    enabled: filtersReady,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleShare = async (row: BillListRow) => {
    if (sharingBillId != null) {
      return;
    }

    setSharingBillId(row.billId);
    try {
      await shareBillPdf(mapBillListRowToPreview(row));
    } catch (shareError) {
      void showSnackbar(
        shareError instanceof Error ? shareError.message : 'Could not share the bill PDF.',
        { variant: 'error' }
      );
    } finally {
      setSharingBillId(null);
    }
  };

  if (!filtersReady || isLoading) {
    return <CenteredMessage text="Loading bills…" />;
  }

  let body = (
    <LazyColumn
      modifiers={[fillMaxWidth(), fillMaxSize(), weight(1)]}
      contentPadding={{ start: 16, top: 8, end: 16, bottom: 88 }}
      verticalArrangement={{ spacedBy: 8 }}>
      {data.map((row) => (
        <BillListCard
          key={row.billId}
          row={row}
          sharing={sharingBillId === row.billId}
          onEdit={onEdit}
          onPreview={onPreview}
          onShare={(next) => {
            void handleShare(next);
          }}
        />
      ))}
    </LazyColumn>
  );

  if (isError) {
    body = (
      <CenteredMessage
        text={error instanceof Error ? error.message : 'Could not load bills.'}
      />
    );
  } else if (data.length === 0) {
    body = (
      <CenteredMessage
        text={filterQuery ? 'No bills match these filters.' : 'No bills for this period.'}
      />
    );
  }

  return (
    <PullToRefreshBox
      isRefreshing={isRefreshing || isRefetching}
      onRefresh={() => {
        void handleRefresh();
      }}
      indicator={{ modifiers: [align('topCenter')] }}
      modifiers={[fillMaxWidth(), fillMaxSize(), weight(1)]}>
      {body}
    </PullToRefreshBox>
  );
}
