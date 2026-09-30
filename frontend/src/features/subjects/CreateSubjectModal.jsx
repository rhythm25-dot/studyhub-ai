import { useForm } from 'react-hook-form';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { subjectService } from '@/services/subjectService';

const COLOR_OPTIONS = ['#4F46E5', '#059669', '#DC2626', '#D97706', '#7C3AED', '#0891B2'];

export function CreateSubjectModal({ isOpen, onClose, onCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await subjectService.create({ ...data, coverColor: color });
      toast.success('Subject created successfully');
      reset();
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Subject">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Subject name"
          placeholder="e.g. Data Structures & Algorithms"
          error={errors.name?.message}
          {...register('name', { required: 'Subject name is required' })}
        />
        <Input
          label="Subject code"
          placeholder="e.g. CS201"
          error={errors.code?.message}
          {...register('code', { required: 'Subject code is required' })}
        />
        <TextArea
          label="Description (optional)"
          placeholder="What will students learn in this subject?"
          {...register('description')}
        />
        <div>
          <label className="label">Cover color</label>
          <div className="flex gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`h-7 w-7 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-surface-dark-subtle' : ''}`}
                aria-label={c}
              />
            ))}
          </div>
        </div>
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create Subject
        </Button>
      </form>
    </Modal>
  );
}
