import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import { format } from 'date-fns';
import { quizService } from '@/services/quizService';
import { PageHeader } from '@/components/common/PageHeader';
import { Avatar, Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { ListSkeleton } from '@/components/ui/Skeleton';

export default function QuizAttemptsPage() {
  const { id } = useParams();
  const quizId = Number(id);
  const navigate = useNavigate();

  const { data: quizInfo } = useQuery({
    queryKey: ['quiz-info', quizId],
    queryFn: () => quizService.getById(quizId),
  });

  const { data: attempts, isLoading } = useQuery({
    queryKey: ['quiz-attempts', quizId],
    queryFn: () => quizService.quizAttempts(quizId),
  });

  return (
    <div>
      <button
        onClick={() => navigate('/quizzes')}
        className="mb-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to quizzes
      </button>

      <PageHeader
        title={quizInfo?.quiz.title ? `Attempts — ${quizInfo.quiz.title}` : 'Quiz Attempts'}
        subtitle={`${attempts?.length ?? 0} student${attempts?.length === 1 ? '' : 's'} attempted this quiz`}
      />

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : !attempts?.length ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No attempts yet"
          description="Once students take this quiz, their attempts will show up here."
        />
      ) : (
        <div className="card divide-y divide-gray-100 p-0 dark:divide-gray-800">
          {attempts.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-5 py-3.5">
              <Avatar name={a.student_name} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                  {a.student_name}
                </p>
                <p className="truncate text-xs text-gray-400">
                  Submitted {a.submitted_at ? format(new Date(a.submitted_at), 'PP p') : '—'}
                </p>
              </div>

              {a.status === 'evaluated' ? (
                <Badge color="green">
                  {a.score} / {a.total_marks}
                </Badge>
              ) : (
                <Badge color="yellow">Needs grading</Badge>
              )}

              <Link to={`/quizzes/attempts/${a.id}/grade`} className="btn-secondary">
                {a.status === 'evaluated' ? 'Review' : 'Grade'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
