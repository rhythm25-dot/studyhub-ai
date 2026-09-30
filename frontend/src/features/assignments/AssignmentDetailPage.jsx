import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { assignmentService } from '@/services/assignmentService';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { StudentSubmissionPanel } from './StudentSubmissionPanel';
import { TeacherGradingPanel } from './TeacherGradingPanel';

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const assignmentId = Number(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => assignmentService.getById(assignmentId),
  });

  const handleDelete = async () => {
    if (!confirm('Delete this assignment? All submissions will be lost.')) return;
    try {
      await assignmentService.remove(assignmentId);
      toast.success('Assignment deleted');
      navigate('/assignments');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (isLoading) return <ListSkeleton rows={4} />;
  if (!assignment) return <EmptyState title="Assignment not found" />;

  const isOwner = user?.role === 'teacher' && assignment.teacher_id === user.id;

  return (
    <div>
      <button
        onClick={() => navigate('/assignments')}
        className="mb-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to assignments
      </button>

      <PageHeader
        title={assignment.title}
        subtitle={`${assignment.subject_name} · Due ${format(new Date(assignment.due_date), 'PPP p')} · ${assignment.max_marks} marks`}
        action={
          <div className="flex gap-2">
            {assignment.rubric_url && (
              <a
                href={assignment.rubric_url}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                <Download className="h-4 w-4" /> Rubric
              </a>
            )}
            {isOwner && (
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
          </div>
        }
      />

      {assignment.description && (
        <p className="mb-5 whitespace-pre-line text-sm text-gray-600 dark:text-gray-300">
          {assignment.description}
        </p>
      )}

      {user?.role === 'student' && <StudentSubmissionPanel assignment={assignment} />}
      {isOwner && <TeacherGradingPanel assignment={assignment} />}
    </div>
  );
}
