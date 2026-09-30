import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { AuthShell } from './AuthShell';
import { authService } from '@/services/authService';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    authService
      .verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Verification failed.');
      });
  }, [token]);

  return (
    <AuthShell title="Email verification">
      <div className="flex flex-col items-center py-4 text-center">
        {status === 'loading' && <Loader2 className="h-10 w-10 animate-spin text-brand-500" />}
        {status === 'success' && <CheckCircle2 className="h-10 w-10 text-green-500" />}
        {status === 'error' && <XCircle className="h-10 w-10 text-red-500" />}
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          {message || 'Verifying your email...'}
        </p>
        {status !== 'loading' && (
          <Link
            to="/login"
            className="mt-4 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Go to login
          </Link>
        )}
      </div>
    </AuthShell>
  );
}
