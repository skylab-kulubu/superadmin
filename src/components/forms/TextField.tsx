'use client';

import { useFormContext } from 'react-hook-form';

interface TextFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}

export function TextField({ name, label, type = 'text', placeholder, required, hint }: TextFieldProps) {
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
        type={type}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-pembe/85 border border-pembe-200 rounded-md focus:outline-none focus:ring-2 focus:ring-lacivert focus:border-transparent text-lacivert placeholder:text-lacivert placeholder:opacity-60"
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-pembe">{errors[name]?.message as string}</p>
      )}
    </div>
  );
}





