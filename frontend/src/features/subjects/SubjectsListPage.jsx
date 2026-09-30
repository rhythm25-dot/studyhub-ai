import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, BookOpen } from 'lucide-react';
import { subjectService } from '@/services/subjectService';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { SubjectCard } from './SubjectCard';
import { CreateSubjectModal } from './CreateSubjectModal';

export default function SubjectsListPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['subjects', debouncedSearch],
    queryFn: () => subjectService.list({ search: debouncedSearch }),
  });

  const subjects = data?.data?.subjects || [];

  return (
    <div>
      <PageHeader
        title="Subjects"
        subtitle={
          user?.role === 'teacher'
            ? 'Manage the subjects you teach'
            : 'Browse your enrolled subjects'
        }
        action={
          user?.role === 'teacher' && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" /> New Subject
            </Button>
          )
        }
      />

      <div className="relative mb-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subjects..."
          className="input pl-9"
        />
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && <ErrorState message="Could not load subjects." onRetry={refetch} />}

      {!isLoading && !isError && subjects.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No subjects yet"
          description={
            user?.role === 'teacher'
              ? 'Create your first subject to start uploading notes and assignments.'
              : 'You are not enrolled in any subjects yet.'
          }
          action={
            user?.role === 'teacher'
              ? { label: 'Create Subject', onClick: () => setIsModalOpen(true) }
              : undefined
          }
        />
      )}

      {!isLoading && subjects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <SubjectCard key={s.id} subject={s} />
          ))}
        </div>
      )}

      <CreateSubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={refetch}
      />
    </div>
  );
}
