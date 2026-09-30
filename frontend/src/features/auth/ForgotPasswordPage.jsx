import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { AuthShell } from './AuthShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell title="Forgot password" subtitle="We'll email you a link to reset it">
      {isSent ? (
        <div className="flex flex-col items-center py-4 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            If that email is registered, a reset link is on its way.
          </p>
          <Link
            to="/login"
            className="mt-4 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Send reset link
          </Button>
          <Link
            to="/login"
            className="block text-center text-sm text-brand-600 hover:underline dark:text-brand-400"
          >
            Back to login
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
