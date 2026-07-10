import { useNativeState } from '@expo/ui';
import { useCallback, useState } from 'react';

import {
  type LoginFieldErrors,
  type LoginFormValues,
  validateLoginForm,
} from '@/lib/validation/login-schema';
import { useAuth } from '@/providers/auth-provider';

export function useLoginForm() {
  const { signIn } = useAuth();
  const email = useNativeState('');
  const password = useNativeState('');
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFieldError = useCallback((field: keyof LoginFormValues) => {
    setFieldErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const next = { ...previous };
      delete next[field];
      return next;
    });
  }, []);

  const handleSignIn = useCallback(async () => {
    const validation = validateLoginForm(email.value, password.value);

    if (!validation.success) {
      setFieldErrors(validation.fieldErrors);
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);

    const message = await signIn(validation.data.email, validation.data.password);

    if (message) {
      setFormError(message);
    }

    setIsSubmitting(false);
  }, [email.value, password.value, signIn]);

  return {
    email,
    password,
    fieldErrors,
    formError,
    isSubmitting,
    handleSignIn,
    clearFieldError,
  };
}
