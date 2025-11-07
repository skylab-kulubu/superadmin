'use client';

import { useRouter } from 'next/navigation';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}

export function Button({ children, onClick, href, variant = 'primary', type = 'button', disabled, className }: ButtonProps) {
  const router = useRouter();

  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    primary: 'bg-brand text-light hover:bg-brand-600 border border-brand',
    secondary: 'bg-light-300 text-dark hover:bg-light-400 border border-dark-200',
    danger: 'bg-red-500 text-light hover:bg-red-600',
  };

  const combinedClassName = className ? `${baseClasses} ${variantClasses[variant]} ${className}` : `${baseClasses} ${variantClasses[variant]}`;

  if (href) {
    return (
      <button
        onClick={() => router.push(href)}
        className={combinedClassName}
        disabled={disabled}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
    >
      {children}
    </button>
  );
}

