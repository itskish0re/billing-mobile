import { ScreenShell } from '@/components/screen-shell';
import { TransactionsScreen } from '@/components/transactions/transactions-screen';

export default function TransactionsRoute() {
  return (
    <ScreenShell>
      <TransactionsScreen />
    </ScreenShell>
  );
}
