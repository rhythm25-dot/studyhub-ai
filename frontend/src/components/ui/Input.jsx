import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Input = forwardRef(({ label, error, className, id, ...props }, ref) => (
  <div>
    {label && (
      <label htmlFor={id} className="label">
        {label}
      </label>
    )}
    <input
      ref={ref}
      id={id}
      className={cn('input', error && 'border-red-500 focus:ring-red-100', className)}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
Input.displayName = 'Input';

export const TextArea = forwardRef(({ label, error, className, id, ...props }, ref) => (
  <div>
    {label && (
      <label htmlFor={id} className="label">
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      id={id}
      className={cn(
        'input min-h-[100px] resize-y',
        error && 'border-red-500 focus:ring-red-100',
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
TextArea.displayName = 'TextArea';
