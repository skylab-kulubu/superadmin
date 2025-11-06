'use client';

import { useFormContext } from 'react-hook-form';
import { useState } from 'react';

interface FileUploadProps {
  name: string;
  label: string;
  accept?: string;
  required?: boolean;
  hint?: string;
}

export function FileUpload({ name, label, accept, required, hint }: FileUploadProps) {
  const { formState: { errors }, watch, setValue } = useFormContext();
  const [preview, setPreview] = useState<string | null>(null);
  const file = watch(name);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(name, file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setValue(name, undefined, { shouldValidate: true });
      setPreview(null);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-pembe mb-1">
        {label} {required && <span className="text-pembe">*</span>}
      </label>
      {hint && (
        <p className="text-xs text-pembe opacity-70 mb-1">{hint}</p>
      )}
      <input
        name={name}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="w-full px-3 py-2 bg-pembe/85 border border-pembe-200 rounded-md focus:outline-none focus:ring-2 focus:ring-lacivert focus:border-transparent text-lacivert"
      />
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Preview" className="max-w-xs rounded-md" />
        </div>
      )}
      {errors[name] && (
        <p className="mt-1 text-sm text-pembe">{errors[name]?.message as string}</p>
      )}
    </div>
  );
}

