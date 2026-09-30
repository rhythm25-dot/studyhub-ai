import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTheme } from '@/contexts/ThemeContext';

export default function AdminSettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <PageHeader title="Platform Settings" subtitle="Basic platform preferences" />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Dark mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Applies across your session on this device
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative h-6 w-11 rounded-full transition-colors ${theme === 'dark' ? 'bg-brand-600' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </Card>
    </div>
  );
}
