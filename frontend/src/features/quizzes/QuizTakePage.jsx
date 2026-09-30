import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Clock } from 'lucide-react';
import { quizService } from '@/services/quizService';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { ListSkeleton } from '@/components/ui/Skeleton';

export default function QuizTakePage() {
  const { id } = useParams();
  const quizId = Number(id);
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: quizInfo } = useQuery({
    queryKey: ['quiz-info', quizId],
    queryFn: () => quizService.getById(quizId),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['quiz-attempt', quizId],
    queryFn: () => quizService.start(quizId),
  });

  const handleSubmit = async () => {
    if (!data) return;
    setIsSubmitting(true);
    try {
      const payload = data.questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || '',
      }));
      const attempt = await quizService.submitAttempt(data.attempt.id, payload);
      toast.success('Quiz submitted');
      navigate(`/quizzes/attempts/${attempt.id}/result`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <ListSkeleton rows={5} />;
  if (!data) return null;

  return (
    <div>
      <PageHeader
        title={quizInfo?.quiz.title || 'Quiz'}
        subtitle={`${data.questions.length} questions`}
        action={
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" /> Take your time and review before submitting
          </div>
        }
      />

      <div className="space-y-4">
        {data.questions.map((q, i) => (
          <div key={q.id} className="card">
            <p className="mb-3 font-medium text-gray-800 dark:text-gray-100">
              {i + 1}. {q.question_text}{' '}
              <span className="text-xs font-normal text-gray-400">({q.marks} marks)</span>
            </p>

            {q.question_type === 'mcq' && q.options_json && (
              <div className="space-y-2">
                {q.options_json.map((opt) => (
                  <label
                    key={opt}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 dark:border-gray-700 dark:has-[:checked]:bg-brand-900/20"
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'true_false' && (
              <div className="flex gap-2">
                {['True', 'False'].map((opt) => (
                  <label
                    key={opt}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 dark:border-gray-700 dark:has-[:checked]:bg-brand-900/20"
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {(q.question_type === 'short' || q.question_type === 'long') && (
              <textarea
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                className={`input ${q.question_type === 'long' ? 'min-h-[140px]' : 'min-h-[70px]'}`}
                placeholder="Type your answer..."
              />
            )}
          </div>
        ))}
      </div>

      <Button onClick={handleSubmit} isLoading={isSubmitting} className="mt-4 w-full">
        Submit Quiz
      </Button>
    </div>
  );
}
