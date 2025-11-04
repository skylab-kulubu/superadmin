'use client';

import { useFormContext } from 'react-hook-form';
import { useState } from 'react';

interface FileUploadProps {
  name: string;
  label: string;
  accept?: string;
  required?: boolean;
}

export function FileUpload({ name, label, accept, required }: FileUploadProps) {
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
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Preview" className="max-w-xs rounded-md" />
        </div>
      )}
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]?.message as string}</p>
      )}
    </div>
  );
}

