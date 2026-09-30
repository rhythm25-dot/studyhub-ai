import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, HelpCircle, Clock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { quizService } from '@/services/quizService';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { CreateQuizModal } from './CreateQuizModal';

export default function QuizzesListPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => quizService.list(),
  });

  const quizzes = data?.data?.quizzes || [];

  const handlePublishToggle = async (id, current) => {
    try {
      await quizService.publish(id, !current);
      toast.success(current ? 'Quiz unpublished' : 'Quiz published');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This will remove all questions and student attempts.`)) return;
    try {
      await quizService.remove(id);
      toast.success('Quiz deleted');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete quiz');
    }
  };

  return (
    <div>
      <PageHeader
        title="Quizzes"
        subtitle={user?.role === 'teacher' ? 'Create and manage quizzes' : 'Test your knowledge'}
        action={
          user?.role === 'teacher' && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" /> New Quiz
            </Button>
          )
        }
      />

      {isLoading && <ListSkeleton rows={4} />}
      {isError && <ErrorState message="Could not load quizzes." onRetry={refetch} />}
      {!isLoading && !isError && quizzes.length === 0 && (
        <EmptyState icon={HelpCircle} title="No quizzes yet" />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {quizzes.map((q) => (
          <div key={q.id} className="card">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{q.title}</h3>
              <div className="flex items-center gap-1.5">
                {q.is_ai_generated && <Badge color="brand">AI Generated</Badge>}
                {user?.role === 'teacher' && q.teacher_id === user.id && (
                  <button
                    onClick={() => handleDelete(q.id, q.title)}
                    className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                    title="Delete quiz"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400">{q.subject_name}</p>
            {q.description && (
              <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                {q.description}
              </p>
            )}
            <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3.5 w-3.5" /> {q.duration_minutes} minutes
            </p>

            <div className="mt-4 flex items-center gap-2">
              {user?.role === 'student' && q.is_published && (
                <Link to={`/quizzes/${q.id}/take`} className="btn-primary flex-1">
                  Take Quiz
                </Link>
              )}
              {user?.role === 'student' && !q.is_published && (
                <Badge color="gray">Not yet available</Badge>
              )}
              {user?.role === 'teacher' && q.teacher_id === user.id && (
                <>
                  <Link to={`/quizzes/${q.id}/build`} className="btn-secondary flex-1">
                    Edit
                  </Link>
                  <Link to={`/quizzes/${q.id}/attempts`} className="btn-secondary">
                    Attempts
                  </Link>
                  <Button
                    variant={q.is_published ? 'secondary' : 'primary'}
                    onClick={() => handlePublishToggle(q.id, q.is_published)}
                  >
                    {q.is_published ? 'Unpublish' : 'Publish'}
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateQuizModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
