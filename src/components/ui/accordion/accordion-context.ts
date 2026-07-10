import { createContext, useCallback, useContext, useState } from 'react';

export type AccordionType = 'single' | 'multiple';

export type AccordionContextValue = {
  type: AccordionType;
  isOpen: (value: string) => boolean;
  setOpen: (value: string, open: boolean) => void;
};

export const AccordionContext = createContext<AccordionContextValue | null>(null);

export function useAccordionContext() {
  return useContext(AccordionContext);
}

export function useAccordionItemState(value: string, defaultOpen = false) {
  const context = useAccordionContext();
  const [localOpen, setLocalOpen] = useState(defaultOpen);

  const setOpen = useCallback(
    (open: boolean) => {
      if (context) {
        context.setOpen(value, open);
      } else {
        setLocalOpen(open);
      }
    },
    [context, value]
  );

  if (!context) {
    return {
      isOpen: localOpen,
      setOpen,
    };
  }

  return {
    isOpen: context.isOpen(value),
    setOpen,
  };
}
