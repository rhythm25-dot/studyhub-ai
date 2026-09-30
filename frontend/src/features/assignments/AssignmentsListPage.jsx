import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, ClipboardList } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { assignmentService } from '@/services/assignmentService';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { CreateAssignmentModal } from './CreateAssignmentModal';

function statusBadge(assignment) {
  if (assignment.my_status === 'graded') return <Badge color="green">Graded</Badge>;
  if (assignment.my_status === 'late') return <Badge color="yellow">Submitted Late</Badge>;
  if (assignment.my_status === 'submitted') return <Badge color="brand">Submitted</Badge>;
  if (isPast(new Date(assignment.due_date))) return <Badge color="red">Overdue</Badge>;
  return <Badge color="gray">Pending</Badge>;
}

export default function AssignmentsListPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentService.list(),
  });

  const assignments = data?.data?.assignments || [];

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle={
          user?.role === 'teacher'
            ? 'Manage assignments across your subjects'
            : 'Track and submit your assignments'
        }
        action={
          user?.role === 'teacher' && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" /> New Assignment
            </Button>
          )
        }
      />

      {isLoading && <ListSkeleton rows={4} />}
      {isError && <ErrorState message="Could not load assignments." onRetry={refetch} />}
      {!isLoading && !isError && assignments.length === 0 && (
        <EmptyState icon={ClipboardList} title="No assignments yet" />
      )}

      <div className="space-y-3">
        {assignments.map((a) => (
          <Link
            key={a.id}
            to={`/assignments/${a.id}`}
            className="card flex items-center justify-between gap-4 transition-shadow hover:shadow-soft-lg"
          >
            <div className="min-w-0">
              <h3 className="truncate font-medium text-gray-900 dark:text-gray-100">{a.title}</h3>
              <p className="text-xs text-gray-400">
                {a.subject_name} · Due {format(new Date(a.due_date), 'PP p')} · {a.max_marks} marks
              </p>
            </div>
            {user?.role === 'student' ? (
              statusBadge(a)
            ) : (
              <Badge color="gray">{a.max_marks} marks</Badge>
            )}
          </Link>
        ))}
      </div>

      <CreateAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={refetch}
      />
    </div>
  );
}
