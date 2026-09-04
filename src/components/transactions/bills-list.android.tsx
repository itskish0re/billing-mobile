import {
  Column,
  Icon,
  IconButton,
  LazyColumn,
  OutlinedCard,
  Row,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { fillMaxSize, fillMaxWidth, padding, weight } from '@expo/ui/jetpack-compose/modifiers';
import { useMemo, useState } from 'react';

import { parseIsoDate } from '@/lib/bills/bill-form';
import { mapBillListRowToPreview } from '@/lib/bills/bill-preview';
import { formatTruckNumber } from '@/lib/bills/format-truck-number';
import { shareBillPdf } from '@/lib/bills/share-bill-pdf';
import { formatTransactionDate } from '@/lib/transactions/format-transaction-date';
import { useBillsList } from '@/hooks/use-bills-list';
import { useSnackbar } from '@/providers/snackbar-provider';
import type { BillListRow } from '@/types/bill-list';

const EDIT_ICON = require('@/assets/icons/edit.xml');
const PREVIEW_ICON = require('@/assets/icons/visibility.xml');
const SHARE_ICON = require('@/assets/icons/share.xml');

export type BillsListProps = {
  searchQuery: string;
  startDate: Date | null;
  endDate: Date | null;
  isDateRangeValid: boolean;
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
  const billDate = parseIsoDate(row.billDate);
  const firstTo = row.loads[0]?.toLocationName ?? '';
  const formattedTruck = formatTruckNumber(row.truckNumber);
  const subtitle = [row.nameBoardName, formattedTruck].filter((part) => part.trim()).join(' · ');
  const route = `${row.fromLocationName || '—'} → ${firstTo || '—'}`;

  return (
    <OutlinedCard
      modifiers={[fillMaxWidth()]}
      colors={{ containerColor: colors.surface }}
      border={{ color: colors.outlineVariant, width: 1 }}>
      <Row
        modifiers={[fillMaxWidth(), padding(16, 12, 8, 12)]}
        verticalAlignment="center"
        horizontalArrangement={{ spacedBy: 4 }}>
        <Column modifiers={[weight(1)]} verticalArrangement={{ spacedBy: 2 }}>
          <Row
            modifiers={[fillMaxWidth()]}
            verticalAlignment="center"
            horizontalArrangement="spaceBetween">
            <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 8 }}>
              <Text color={colors.onSurface} style={{ typography: 'titleMedium' }}>
                {row.billNumber ? `Bill ${row.billNumber}` : 'Bill'}
              </Text>
              {row.isCancelled ? (
                <Text color={colors.error} style={{ typography: 'labelSmall' }}>
                  Cancelled
                </Text>
              ) : null}
            </Row>
            {billDate ? (
              <Text color={colors.onSurfaceVariant} style={{ typography: 'bodySmall' }}>
                {formatTransactionDate(billDate)}
              </Text>
            ) : null}
          </Row>

          {subtitle ? (
            <Text color={colors.onSurfaceVariant} maxLines={1} style={{ typography: 'bodyMedium' }}>
              {subtitle}
            </Text>
          ) : null}

          <Text color={colors.onSurfaceVariant} maxLines={1} style={{ typography: 'bodySmall' }}>
            {route}
          </Text>
        </Column>

        <IconButton onClick={() => onEdit(row)}>
          <Icon source={EDIT_ICON} size={20} tint={colors.primary} />
        </IconButton>
        <IconButton onClick={() => onPreview(row)}>
          <Icon source={PREVIEW_ICON} size={20} tint={colors.primary} />
        </IconButton>
        <IconButton enabled={!sharing} onClick={() => onShare(row)}>
          <Icon source={SHARE_ICON} size={20} tint={colors.primary} />
        </IconButton>
      </Row>
    </OutlinedCard>
  );
}

/**
 * Bills tab list. Fetches the active financial year's bills within the date
 * range, filters by the search query client-side (mirroring masters), and
 * renders an edit + preview action per bill.
 */
export function BillsList({
  searchQuery,
  startDate,
  endDate,
  isDateRangeValid,
  onEdit,
  onPreview,
}: BillsListProps) {
  const { showSnackbar } = useSnackbar();
  const [sharingBillId, setSharingBillId] = useState<number | null>(null);
  const { data = [], isLoading, isError, error } = useBillsList({
    startDate,
    endDate,
    enabled: isDateRangeValid,
  });

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

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return data;
    }
    return data.filter((row) => {
      const haystack = [
        row.billNumber,
        row.truckNumber,
        formatTruckNumber(row.truckNumber),
        row.nameBoardName,
        row.fromLocationName,
        row.driverName,
        row.loads[0]?.toLocationName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [data, searchQuery]);

  if (!isDateRangeValid) {
    return <CenteredMessage text="Fix the date range to see bills." />;
  }

  if (isLoading) {
    return <CenteredMessage text="Loading bills…" />;
  }

  if (isError) {
    return (
      <CenteredMessage
        text={error instanceof Error ? error.message : 'Could not load bills.'}
      />
    );
  }

  if (filtered.length === 0) {
    return (
      <CenteredMessage
        text={searchQuery ? `No bills match "${searchQuery}"` : 'No bills for this period.'}
      />
    );
  }

  return (
    <LazyColumn
      modifiers={[fillMaxWidth(), fillMaxSize(), weight(1)]}
      contentPadding={{ start: 16, top: 8, end: 16, bottom: 88 }}
      verticalArrangement={{ spacedBy: 12 }}>
      {filtered.map((row) => (
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
}
