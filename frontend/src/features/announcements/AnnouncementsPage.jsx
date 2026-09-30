import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Megaphone, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { announcementService } from '@/services/announcementService';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { CreateAnnouncementModal } from './CreateAnnouncementModal';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementService.list(),
  });

  const announcements = data?.data?.announcements || [];

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await announcementService.remove(id);
      toast.success('Announcement deleted');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Updates from your teachers and the platform"
        action={
          user?.role !== 'student' && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" /> New Announcement
            </Button>
          )
        }
      />

      {isLoading && <ListSkeleton rows={4} />}
      {isError && <ErrorState message="Could not load announcements." onRetry={refetch} />}
      {!isLoading && !isError && announcements.length === 0 && (
        <EmptyState icon={Megaphone} title="No announcements yet" />
      )}

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="card">
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{a.title}</h3>
              {(a.author_id === user?.id || user?.role === 'admin') && (
                <button
                  onClick={() => handleDelete(a.id)}
                  className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="whitespace-pre-line text-sm text-gray-600 dark:text-gray-300">
              {a.content}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <span>{a.author_name}</span>
              <span>·</span>
              <span>{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
              {a.subject_name ? (
                <Badge color="brand">{a.subject_name}</Badge>
              ) : (
                <Badge color="gray">Platform-wide</Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={refetch}
      />
    </div>
  );
}
