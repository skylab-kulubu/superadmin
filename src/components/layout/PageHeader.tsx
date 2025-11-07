import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  const baseClasses = 'pb-6 border-b border-dark-200';
  const layoutClasses = actions
    ? 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'
    : 'space-y-1';

  const combinedClassName = [baseClasses, layoutClasses, className].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName}>
      <div>
        <h1 className="text-3xl font-bold text-brand mb-1">{title}</h1>
        {description && <p className="text-dark-600 text-sm">{description}</p>}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

