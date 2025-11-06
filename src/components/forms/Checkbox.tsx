'use client';

import { useFormContext } from 'react-hook-form';

interface CheckboxProps {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
}

export function Checkbox({ name, label, required, hint }: CheckboxProps) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register(name)}
          className="w-4 h-4 text-lacivert border-pembe-200 rounded focus:ring-lacivert"
        />
        <span className="text-sm font-medium text-pembe">
          {label} {required && <span className="text-pembe">*</span>}
        </span>
      </label>
      {hint && (
        <p className="text-xs text-pembe opacity-70 mt-1 ml-6">{hint}</p>
      )}
      {errors[name] && (
        <p className="mt-1 text-sm text-pembe">{errors[name]?.message as string}</p>
      )}
    </div>
  );
}

