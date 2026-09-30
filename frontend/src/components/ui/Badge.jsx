import { cn } from '@/utils/cn';

const badgeColors = {
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  green: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
  yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  red: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
};

export function Badge({ children, color = 'gray' }) {
  return <span className={cn('badge', badgeColors[color])}>{children}</span>;
}

export function Avatar({ name, url, size = 36 }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300"
    >
      {initials}
    </div>
  );
}
