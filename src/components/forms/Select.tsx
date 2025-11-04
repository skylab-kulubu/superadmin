'use client';

import { useFormContext } from 'react-hook-form';

interface SelectProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
}

export function Select({ name, label, options, required, disabled }: SelectProps) {
  const { formState: { errors }, watch, setValue } = useFormContext();
  const value = watch(name);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setValue(name, selectedValue, { shouldValidate: true });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value ?? ''}
        disabled={disabled}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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

