'use client';

import { useFormContext, useController } from 'react-hook-form';

interface SelectProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  hint?: string;
}

export function Select({ name, label, options, required, disabled, hint }: SelectProps) {
  const { formState: { errors }, control } = useFormContext();
  const { field } = useController({ name, control });

  return (
    <div>
      <label className="block text-sm font-medium text-pembe mb-1">
        {label} {required && <span className="text-pembe">*</span>}
      </label>
      {hint && (
        <p className="text-xs text-pembe opacity-70 mb-1">{hint}</p>
      )}
      <select
        name={name}
        value={field.value ?? ''}
        disabled={disabled}
        onChange={(e) => field.onChange(e.target.value)}
        onBlur={field.onBlur}
        className="w-full px-3 py-2 bg-pembe/85 border border-pembe-200 rounded-md focus:outline-none focus:ring-2 focus:ring-lacivert focus:border-transparent disabled:bg-pembe-50 disabled:cursor-not-allowed text-lacivert"
      >
        <option value="">Seçiniz</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p className="mt-1 text-sm text-pembe">{errors[name]?.message as string}</p>
      )}
    </div>
  );
}

