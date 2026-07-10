import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .pipe(z.email('Enter a valid email address')),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export type LoginFieldErrors = Partial<Record<keyof LoginFormValues, string>>;

export function validateLoginForm(email: string, password: string) {
  const result = loginSchema.safeParse({ email, password });

  if (result.success) {
    return { success: true as const, data: result.data };
  }

  const fieldErrors: LoginFieldErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0];

    if (typeof field === 'string' && !(field in fieldErrors)) {
      fieldErrors[field as keyof LoginFormValues] = issue.message;
    }
  }

  return { success: false as const, fieldErrors };
}
