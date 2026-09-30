import { useQuery } from '@tanstack/react-query';
import { Bookmark } from 'lucide-react';
import { noteService } from '@/services/noteService';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { NoteCard } from '@/features/notes/NoteCard';

export default function BookmarksPage() {
  const queryKey = ['bookmarked-notes'];
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => noteService.myBookmarks(),
  });

  const notes = data?.data?.notes || [];

  return (
    <div>
      <PageHeader title="Bookmarks" subtitle="Notes you've saved for later" />

      {isLoading && <ListSkeleton rows={4} />}
      {isError && <ErrorState message="Could not load bookmarks." onRetry={refetch} />}
      {!isLoading && !isError && notes.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          description="Bookmark notes from the Notes page to find them here quickly."
        />
      )}
      {!isLoading && notes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {notes.map((n) => (
            <NoteCard key={n.id} note={{ ...n, is_bookmarked: true }} queryKey={queryKey} />
          ))}
        </div>
      )}
    </div>
  );
}
