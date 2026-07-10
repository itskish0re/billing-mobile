import { useEffect, type ReactNode } from 'react';

import { useFinancialYears } from '@/hooks/use-financial-years';
import { useAppStore } from '@/stores/app-store';

export function FinancialYearBootstrap({ children }: { children: ReactNode }) {
  const { data: financialYears } = useFinancialYears();
  const activeFinancialYearId = useAppStore((state) => state.activeFinancialYearId);
  const setActiveFinancialYear = useAppStore((state) => state.setActiveFinancialYear);

  useEffect(() => {
    if (!financialYears?.length) {
      return;
    }

    const matchedYear = financialYears.find(
      (year) => year.financial_year_id === activeFinancialYearId
    );

    if (matchedYear) {
      setActiveFinancialYear(matchedYear.financial_year_id, matchedYear.name);
      return;
    }

    const defaultYear = financialYears[0];
    setActiveFinancialYear(defaultYear.financial_year_id, defaultYear.name);
  }, [activeFinancialYearId, financialYears, setActiveFinancialYear]);

  return children;
}
