import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { announcementService } from '@/services/announcementService';
import { subjectService } from '@/services/subjectService';
import { useAuth } from '@/contexts/AuthContext';

export function CreateAnnouncementModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects-for-announcement'],
    queryFn: () => subjectService.list({ limit: 50 }),
    enabled: user?.role === 'teacher',
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await announcementService.create({
        title: data.title,
        content: data.content,
        subjectId: user?.role === 'admin' ? null : Number(data.subjectId),
      });
      toast.success('Announcement posted');
      reset();
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Announcement">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {user?.role === 'teacher' && (
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
        )}
        <Input
          label="Title"
          placeholder="Announcement title"
          error={errors.title?.message}
          {...register('title', { required: 'Title is required' })}
        />
        <TextArea
          label="Content"
          placeholder="Write your announcement..."
          error={errors.content?.message}
          {...register('content', { required: 'Content is required' })}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Post Announcement
        </Button>
      </form>
    </Modal>
  );
}
