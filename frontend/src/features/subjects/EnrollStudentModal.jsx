import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { subjectService } from '@/services/subjectService';

// Note: teachers enroll students by their numeric user id (shown to admins
// in the Manage Students table). A production version could add an email
// lookup endpoint - kept simple here to match the current API surface.
export function EnrollStudentModal({ subjectId, isOpen, onClose, onEnrolled }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await subjectService.enrollStudent(subjectId, Number(data.studentId));
      toast.success('Student enrolled successfully');
      reset();
      onEnrolled();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to enroll student');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enroll Student" maxWidth="max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Student ID"
          type="number"
          placeholder="e.g. 14"
          error={errors.studentId?.message}
          {...register('studentId', { required: 'Student ID is required' })}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Enroll
        </Button>
      </form>
    </Modal>
  );
}
