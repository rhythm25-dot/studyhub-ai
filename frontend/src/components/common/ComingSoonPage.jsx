import { Construction } from 'lucide-react';

export function ComingSoonPage({ title, icon: Icon = Construction, note }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/30">
        <Icon className="h-7 w-7 text-brand-600 dark:text-brand-400" />
      </div>
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
      <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">{note}</p>
    </div>
  );
}
