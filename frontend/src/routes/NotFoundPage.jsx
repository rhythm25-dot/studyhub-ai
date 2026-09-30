import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-subtle px-4 text-center dark:bg-surface-dark">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <h1 className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Page not found
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/dashboard" className="mt-5">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
