import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { BillFormValues } from '@/types/bill-form';

type BillFormContextValue = {
  isOpen: boolean;
  openCreate: () => void;
  openEdit: (values: BillFormValues) => void;
  close: () => void;
};

const BillFormContext = createContext<BillFormContextValue | null>(null);

export function useBillForm() {
  const ctx = useContext(BillFormContext);
  if (!ctx) {
    throw new Error('useBillForm must be used within BillFormProvider');
  }
  return ctx;
}

export function BillFormProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openCreate = useCallback(() => {
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((_values: BillFormValues) => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      openCreate,
      openEdit,
      close,
    }),
    [isOpen, openCreate, openEdit, close]
  );

  return <BillFormContext.Provider value={value}>{children}</BillFormContext.Provider>;
}
