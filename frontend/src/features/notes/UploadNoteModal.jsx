import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { UploadCloud } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { noteService } from '@/services/noteService';

export function UploadNoteModal({ subjectId, isOpen, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subjectId', String(subjectId));
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);

      await noteService.upload(formData, setProgress);
      toast.success('Note uploaded successfully');
      reset();
      setFile(null);
      setProgress(0);
      onUploaded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Note">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title"
          placeholder="e.g. Chapter 3 - Binary Trees"
          error={errors.title?.message}
          {...register('title', { required: 'Title is required' })}
        />
        <TextArea
          label="Description (optional)"
          placeholder="A short summary for students"
          {...register('description')}
        />

        <div>
          <label className="label">File</label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-8 text-sm text-gray-500 hover:border-brand-400 dark:border-gray-700 dark:text-gray-400">
            <UploadCloud className="h-6 w-6" />
            {file ? file.name : 'PDF, DOCX, PPTX, or image — up to 20MB'}
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {isSubmitting && progress > 0 && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Upload Note
        </Button>
      </form>
    </Modal>
  );
}
