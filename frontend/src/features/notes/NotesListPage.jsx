import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, FileText } from 'lucide-react';
import { noteService } from '@/services/noteService';
import { subjectService } from '@/services/subjectService';
import { useDebounce } from '@/hooks/useDebounce';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { NoteCard } from './NoteCard';

export default function NotesListPage() {
  const [search, setSearch] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const debouncedSearch = useDebounce(search);

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects-for-filter'],
    queryFn: () => subjectService.list({ limit: 50 }),
  });

  const queryKey = ['notes', { search: debouncedSearch, subjectId }];
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      noteService.list({
        search: debouncedSearch,
        subjectId: subjectId ? Number(subjectId) : undefined,
      }),
  });

  const notes = data?.data?.notes || [];

  return (
    <div>
      <PageHeader title="Notes" subtitle="Browse study material across your subjects" />

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="input pl-9"
          />
        </div>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="input max-w-[200px]"
        >
          <option value="">All subjects</option>
          {subjectsData?.data?.subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <ListSkeleton rows={5} />}
      {isError && <ErrorState message="Could not load notes." onRetry={refetch} />}
      {!isLoading && !isError && notes.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No notes found"
          description="Try a different search or subject filter."
        />
      )}
      {!isLoading && notes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {notes.map((n) => (
            <NoteCard key={n.id} note={n} queryKey={queryKey} />
          ))}
        </div>
      )}
    </div>
  );
}
