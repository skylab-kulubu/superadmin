'use client';

import { useFormContext, useController } from 'react-hook-form';

interface ToggleProps {
  name: string;
  label: string;
  hint?: string;
  /** Kapalı (unchecked) konumdaki yuvarlak için ek sınıflar (ör. yeşil thumb) */
  thumbUncheckedClassName?: string;
}

export function Toggle({ name, label, hint, thumbUncheckedClassName }: ToggleProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { field } = useController({
    name,
    control,
  });
  const value = field.value ?? false;

  return (
    <div>
      <label className="flex cursor-pointer items-center gap-3">
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => {
              field.onChange(e.target.checked);
            }}
            onBlur={field.onBlur}
            ref={field.ref}
            className="peer sr-only"
          />
          <div
            className={`peer-focus:ring-brand relative h-6 w-11 rounded-full transition-colors duration-300 ease-in-out peer-focus:ring-2 peer-focus:outline-none ${value ? 'bg-brand' : 'bg-dark-300'}`}
          >
            <div
              className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
                value
                  ? 'bg-light translate-x-5'
                  : `translate-x-0 ${thumbUncheckedClassName ?? 'bg-light'}`
              }`}
            />
          </div>
        </div>
        <span className="text-dark text-sm font-medium">{label}</span>
        {hint && <p className="text-dark text-xs opacity-70">{hint}</p>}
      </label>
      {errors[name] && <p className="text-dark mt-1 text-sm">{errors[name]?.message as string}</p>}
    </div>
  );
}
