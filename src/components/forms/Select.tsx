'use client';

import { useFormContext, useController } from 'react-hook-form';

interface SelectProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
}

export function Select({ name, label, options, required, disabled }: SelectProps) {
  const { formState: { errors }, control } = useFormContext();
  const { field } = useController({ name, control });

  return (
    <div>
      <label className="block text-sm font-medium text-black mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={field.value ?? ''}
        disabled={disabled}
        onChange={(e) => field.onChange(e.target.value)}
        onBlur={field.onBlur}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
      >
        <option value="">Seçiniz</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]?.message as string}</p>
      )}
    </div>
  );
}

