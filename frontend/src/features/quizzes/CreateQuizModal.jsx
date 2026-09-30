import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { quizService } from '@/services/quizService';
import { subjectService } from '@/services/subjectService';

export function CreateQuizModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { durationMinutes: 30 },
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects-for-quiz'],
    queryFn: () => subjectService.list({ limit: 50 }),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const quiz = await quizService.create({
        subjectId: Number(data.subjectId),
        title: data.title,
        description: data.description,
        durationMinutes: Number(data.durationMinutes),
      });
      toast.success('Quiz created — now add some questions');
      reset();
      onClose();
      navigate(`/quizzes/${quiz.id}/build`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Quiz">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Subject</label>
          <select className="input" {...register('subjectId', { required: 'Select a subject' })}>
            <option value="">Select a subject</option>
            {subjectsData?.data?.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.subjectId && (
            <p className="mt-1 text-xs text-red-600">{errors.subjectId.message}</p>
          )}
        </div>
        <Input
          label="Title"
          placeholder="e.g. Midterm Quiz - Chapter 1-3"
          error={errors.title?.message}
          {...register('title', { required: 'Title is required' })}
        />
        <TextArea label="Description (optional)" {...register('description')} />
        <Input
          label="Duration (minutes)"
          type="number"
          {...register('durationMinutes', { required: true, min: 1 })}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create & Add Questions
        </Button>
      </form>
    </Modal>
  );
}
