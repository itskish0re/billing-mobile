import { ScreenShell } from '@/components/screen-shell';
import { TransactionsScreen } from '@/components/transactions/transactions-screen';

export default function TransactionsRoute() {
  return (
    <ScreenShell horizontalPadding={0} topPadding={0}>
      <TransactionsScreen />
    </ScreenShell>
  );
}
