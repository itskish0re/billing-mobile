import { useState } from 'react';

export type TransactionsTab = 'bills' | 'loads';

export function useTransactionsFilters() {
  const [activeTab, setActiveTab] = useState<TransactionsTab>('bills');

  return {
    activeTab,
    setActiveTab,
  };
}
