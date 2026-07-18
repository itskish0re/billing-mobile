import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type BillFormContextValue = {
  isOpen: boolean;
  openCreate: () => void;
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

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      openCreate,
      close,
    }),
    [isOpen, openCreate, close]
  );

  return <BillFormContext.Provider value={value}>{children}</BillFormContext.Provider>;
}
