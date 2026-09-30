import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { UploadCloud } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { assignmentService } from '@/services/assignmentService';
import { subjectService } from '@/services/subjectService';

export function CreateAssignmentModal({ isOpen, onClose, onCreated }) {
  const [rubricFile, setRubricFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { maxMarks: 100 },
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects-for-assignment'],
    queryFn: () => subjectService.list({ limit: 50 }),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('subjectId', data.subjectId);
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('maxMarks', String(data.maxMarks));
      formData.append('dueDate', data.dueDate);
      if (rubricFile) formData.append('rubric', rubricFile);

      await assignmentService.create(formData);
      toast.success('Assignment created successfully');
      reset();
      setRubricFile(null);
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Assignment">
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
          placeholder="e.g. Assignment 1 - Sorting Algorithms"
          error={errors.title?.message}
          {...register('title', { required: 'Title is required' })}
        />
        <TextArea
          label="Description"
          placeholder="Instructions for students"
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Max marks"
            type="number"
            error={errors.maxMarks?.message}
            {...register('maxMarks', { required: true, min: 1 })}
          />
          <Input
            label="Due date"
            type="datetime-local"
            error={errors.dueDate?.message}
            {...register('dueDate', { required: 'Due date is required' })}
          />
        </div>

        <div>
          <label className="label">Rubric (optional)</label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-4 text-sm text-gray-500 hover:border-brand-400 dark:border-gray-700 dark:text-gray-400">
            <UploadCloud className="h-5 w-5" />
            {rubricFile
              ? rubricFile.name
              : 'Upload a rubric PDF or DOCX (used by the AI Assignment Checker)'}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => setRubricFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create Assignment
        </Button>
      </form>
    </Modal>
  );
}
