'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function Toggle({ checked, onChange, activeLabel = 'Aktif', inactiveLabel = 'Pasif' }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-8 w-20 items-center rounded-full transition-colors focus:outline-none"
    >
      {/* Background */}
      <div
        className={`
          absolute h-full w-full rounded-full transition-colors
          ${checked ? 'bg-brand' : 'bg-red-500'}
        `}
      />
      
      {/* Slider */}
      <div
        className={`
          absolute h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200
          ${checked ? 'translate-x-[3.25rem]' : 'translate-x-1'}
        `}
      />
    </button>
  );
}

