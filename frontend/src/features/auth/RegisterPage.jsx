import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthShell } from './AuthShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { role: 'student' },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await authService.register(data);
      toast.success('Account created! Check your email to verify your account.');
      navigate('/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join StudyHub AI as a student or teacher">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full name"
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Minimum 8 characters' },
          })}
        />
        <div>
          <label className="label">I am a</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 py-2 text-sm has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 dark:border-gray-700 dark:has-[:checked]:bg-brand-900/20">
              <input type="radio" value="student" className="sr-only" {...register('role')} />
              Student
            </label>
            <label className="flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 py-2 text-sm has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 dark:border-gray-700 dark:has-[:checked]:bg-brand-900/20">
              <input type="radio" value="teacher" className="sr-only" {...register('role')} />
              Teacher
            </label>
          </div>
        </div>
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
