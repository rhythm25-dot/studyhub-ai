import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { quizService } from '@/services/quizService';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { AddQuestionForm } from './AddQuestionForm';
import { AiQuizGeneratorPanel } from './AiQuizGeneratorPanel';

export default function QuizBuilderPage() {
  const { id } = useParams();
  const quizId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizService.getById(quizId),
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Remove this question?')) return;
    try {
      await quizService.deleteQuestion(questionId);
      toast.success('Question removed');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove question');
    }
  };

  const handlePublish = async () => {
    if (!data?.questions.length) {
      toast.error('Add at least one question before publishing');
      return;
    }
    try {
      await quizService.publish(quizId, true);
      toast.success('Quiz published');
      navigate('/quizzes');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish');
    }
  };

  if (isLoading) return <ListSkeleton rows={4} />;
  if (!data) return <EmptyState title="Quiz not found" />;

  const totalMarks = data.questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div>
      <button
        onClick={() => navigate('/quizzes')}
        className="mb-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to quizzes
      </button>

      <PageHeader
        title={data.quiz.title}
        subtitle={`${data.questions.length} questions · ${totalMarks} total marks`}
        action={<Button onClick={handlePublish}>Publish Quiz</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Questions</h3>
          {data.questions.length === 0 ? (
            <EmptyState
              title="No questions yet"
              description="Add questions manually or generate them with AI."
            />
          ) : (
            <div className="space-y-2">
              {data.questions.map((q, i) => (
                <div key={q.id} className="card flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {i + 1}. {q.question_text}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                      <Badge color="gray">{q.question_type}</Badge>
                      <span>{q.marks} marks</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <AiQuizGeneratorPanel
            quizId={quizId}
            subjectId={data.quiz.subject_id}
            onSaved={refetch}
          />
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Add Question Manually
            </h3>
            <AddQuestionForm quizId={quizId} onAdded={refetch} />
          </div>
        </div>
      </div>
    </div>
  );
}
