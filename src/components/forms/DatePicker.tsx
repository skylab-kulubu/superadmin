'use client';

import { useFormContext } from 'react-hook-form';

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
      <label className="block text-sm font-medium text-pembe mb-1">
        {label} {required && <span className="text-pembe">*</span>}
      </label>
      {hint && (
        <p className="text-xs text-pembe opacity-70 mb-1">{hint}</p>
      )}
      <input
        {...register(name)}
        type="datetime-local"
        className="w-full px-3 py-2 bg-pembe/85 border border-pembe-200 rounded-md focus:outline-none focus:ring-2 focus:ring-lacivert focus:border-transparent text-lacivert date-picker-input"
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-pembe">{errors[name]?.message as string}</p>
      )}
    </div>
  );
}









