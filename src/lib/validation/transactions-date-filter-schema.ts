import { z } from 'zod';

function toDateOnlyTimestamp(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export const transactionsDateFilterSchema = z
  .object({
    startDate: z.date().nullable(),
    endDate: z.date().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.startDate == null || value.endDate == null) {
      return;
    }

    if (toDateOnlyTimestamp(value.endDate) < toDateOnlyTimestamp(value.startDate)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Start date must be before end date',
        path: ['startDate'],
      });
      ctx.addIssue({
        code: 'custom',
        message: 'End date must be after start date',
        path: ['endDate'],
      });
    }
  });

export type TransactionsDateFilterValues = z.infer<typeof transactionsDateFilterSchema>;

export type TransactionsDateFieldErrors = Partial<
  Record<keyof TransactionsDateFilterValues, string>
>;

export function validateTransactionsDateFilter(startDate: Date | null, endDate: Date | null) {
  const result = transactionsDateFilterSchema.safeParse({ startDate, endDate });

  if (result.success) {
    return { success: true as const, data: result.data };
  }

  const fieldErrors: TransactionsDateFieldErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0];

    if (typeof field === 'string' && !(field in fieldErrors)) {
      fieldErrors[field as keyof TransactionsDateFilterValues] = issue.message;
    }
  }

  return { success: false as const, fieldErrors };
}
