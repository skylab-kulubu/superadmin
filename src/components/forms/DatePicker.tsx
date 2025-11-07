'use client';

import { useFormContext } from 'react-hook-form';
import { getCurrentDateTimeGMT3 } from '@/lib/utils/date';

interface DatePickerProps {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
}

export function DatePicker({ name, label, required, hint }: DatePickerProps) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <label className="block text-sm font-medium text-dark mb-1">
        {label} {required && <span className="text-dark">*</span>}
      </label>
      {hint && (
        <p className="text-xs text-dark opacity-70 mb-1">{hint}</p>
      )}
      <input
        {...register(name)}
        type="datetime-local"
        max="9999-12-31T23:59"
        defaultValue={getCurrentDateTimeGMT3()}
        className="w-full px-3 py-2 bg-light border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-dark date-picker-input"
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-dark">{errors[name]?.message as string}</p>
      )}
    </div>
  );
}









