import { Column } from '@expo/ui';
import { useCallback, useMemo, useState, type ReactNode } from 'react';

import {
  AccordionContext,
  type AccordionType,
} from '@/components/ui/accordion/accordion-context';

export type AccordionProps = {
  type?: AccordionType;
  defaultValue?: string | string[];
  children: ReactNode;
};

function toInitialSet(defaultValue?: string | string[]) {
  if (!defaultValue) {
    return new Set<string>();
  }

  if (Array.isArray(defaultValue)) {
    return new Set(defaultValue);
  }

  return new Set([defaultValue]);
}

export function Accordion({ type = 'multiple', defaultValue, children }: AccordionProps) {
  const [openValues, setOpenValues] = useState(() => toInitialSet(defaultValue));

  const isOpen = useCallback((value: string) => openValues.has(value), [openValues]);

  const setOpen = useCallback(
    (value: string, open: boolean) => {
      setOpenValues((previous) => {
        const isCurrentlyOpen = previous.has(value);

        if (open === isCurrentlyOpen) {
          return previous;
        }

        if (type === 'single') {
          return open ? new Set([value]) : new Set();
        }

        const next = new Set(previous);

        if (open) {
          next.add(value);
        } else {
          next.delete(value);
        }

        return next;
      });
    },
    [type]
  );

  const contextValue = useMemo(
    () => ({
      type,
      isOpen,
      setOpen,
    }),
    [type, isOpen, setOpen]
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <Column spacing={8}>{children}</Column>
    </AccordionContext.Provider>
  );
}
