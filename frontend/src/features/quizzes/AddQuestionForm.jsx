import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { quizService } from '@/services/quizService';

export function AddQuestionForm({ quizId, onAdded }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { questionType: 'mcq', marks: 1 },
  });
  const questionType = watch('questionType');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const options =
        questionType === 'mcq'
          ? [data.optionA, data.optionB, data.optionC, data.optionD].filter(Boolean)
          : undefined;
      await quizService.addQuestion(quizId, {
        questionText: data.questionText,
        questionType: data.questionType,
        options,
        correctAnswer: data.correctAnswer,
        marks: Number(data.marks),
      });
      toast.success('Question added');
      reset({ questionType: data.questionType, marks: data.marks });
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add question');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Type</label>
          <select className="input" {...register('questionType')}>
            <option value="mcq">Multiple Choice</option>
            <option value="true_false">True / False</option>
            <option value="short">Short Answer</option>
            <option value="long">Long Answer</option>
          </select>
        </div>
        <Input label="Marks" type="number" {...register('marks', { required: true, min: 1 })} />
      </div>

      <TextArea
        label="Question"
        error={errors.questionText?.message}
        {...register('questionText', { required: 'Question text is required' })}
      />

      {questionType === 'mcq' && (
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Option A" {...register('optionA', { required: true })} />
          <Input placeholder="Option B" {...register('optionB', { required: true })} />
          <Input placeholder="Option C" {...register('optionC')} />
          <Input placeholder="Option D" {...register('optionD')} />
        </div>
      )}

      {questionType === 'true_false' ? (
        <div>
          <label className="label">Correct answer</label>
          <select className="input" {...register('correctAnswer', { required: true })}>
            <option value="True">True</option>
            <option value="False">False</option>
          </select>
        </div>
      ) : (
        <Input
          label={questionType === 'mcq' ? 'Correct option (exact text)' : 'Model answer'}
          error={errors.correctAnswer?.message}
          {...register('correctAnswer', { required: 'Correct answer is required' })}
        />
      )}

      <Button type="submit" variant="secondary" isLoading={isSubmitting}>
        <Plus className="h-4 w-4" /> Add Question
      </Button>
    </form>
  );
}
