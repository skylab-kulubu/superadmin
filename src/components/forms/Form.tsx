'use client';

import { ReactNode } from 'react';
import { useForm, FormProvider, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface FormProps<T extends z.ZodType<Record<string, any>>> {
  schema: T;
  onSubmit: (data: z.infer<T>) => Promise<void> | void;
  children: (methods: UseFormReturn<z.infer<T>>) => ReactNode;
  defaultValues?: Partial<z.infer<T>>;
}

export function Form<T extends z.ZodType<Record<string, any>>>({ schema, onSubmit, children, defaultValues }: FormProps<T>) {
  const methods = useForm<z.infer<T>>({
    resolver: (zodResolver as any)(schema) as any,
    defaultValues: defaultValues as any,
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {children(methods)}
      </form>
    </FormProvider>
  );
}





