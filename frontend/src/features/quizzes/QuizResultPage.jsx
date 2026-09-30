import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { quizService } from '@/services/quizService';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ListSkeleton } from '@/components/ui/Skeleton';

export default function QuizResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['quiz-result', attemptId],
    queryFn: () => quizService.getResult(Number(attemptId)),
  });

  if (isLoading) return <ListSkeleton rows={4} />;
  if (!data) return null;

  const { attempt, answers } = data;
  const percent = attempt.total_marks
    ? Math.round(((attempt.score || 0) / attempt.total_marks) * 100)
    : null;

  return (
    <div>
      <PageHeader
        title="Quiz Result"
        action={
          <Button variant="secondary" onClick={() => navigate('/quizzes')}>
            Back to Quizzes
          </Button>
        }
      />

      <div className="card mb-6 text-center">
        {attempt.status === 'submitted' ? (
          <>
            <HelpCircle className="mx-auto mb-2 h-10 w-10 text-yellow-500" />
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Awaiting teacher review
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Some answers need manual grading. Check back soon.
            </p>
          </>
        ) : (
          <>
            <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">
              {attempt.score} / {attempt.total_marks}
            </p>
            {percent !== null && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{percent}% score</p>
            )}
          </>
        )}
      </div>

      <div className="space-y-3">
        {answers.map((a, i) => (
          <div key={a.id} className="card">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {i + 1}. {a.question_text}
              </p>
              {a.is_correct === 1 && <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />}
              {a.is_correct === 0 && <XCircle className="h-5 w-5 shrink-0 text-red-500" />}
              {a.is_correct === null && <Badge color="yellow">Pending review</Badge>}
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Your answer: {a.student_answer || '—'}
            </p>
            {a.is_correct === 0 && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                Correct answer: {a.correct_answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
