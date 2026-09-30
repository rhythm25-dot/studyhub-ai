import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, Trash2, Sparkles, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { noteService } from '@/services/noteService';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { ListSkeleton } from '@/components/ui/Skeleton';

export default function NoteDetailPage() {
  const { id } = useParams();
  const noteId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => noteService.getById(noteId),
  });

  const handleDelete = async () => {
    if (!confirm('Delete this note? This cannot be undone.')) return;
    try {
      await noteService.remove(noteId);
      toast.success('Note deleted');
      navigate(-1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  if (isLoading) return <ListSkeleton rows={4} />;
  if (!note) return <EmptyState title="Note not found" />;

  const isOwner = user?.role === 'teacher' && note.teacher_id === user.id;
  const canPreview = note.file_type === 'pdf' || note.file_type === 'image';

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <PageHeader
        title={note.title}
        subtitle={`${note.subject_name} · ${note.teacher_name} · ${note.views_count} views`}
        action={
          <div className="flex gap-2">
            {user?.role === 'student' && (
              <Link to={`/ai?tool=summarize&noteId=${note.id}`} className="btn-secondary">
                <Sparkles className="h-4 w-4" /> AI Tools
              </Link>
            )}
            <a href={note.file_url} target="_blank" rel="noreferrer" className="btn-secondary">
              <Download className="h-4 w-4" /> Download
            </a>
            {isOwner && (
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
          </div>
        }
      />

      {note.description && (
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{note.description}</p>
      )}

      <div className="card overflow-hidden p-0">
        {canPreview ? (
          note.file_type === 'image' ? (
            <img src={note.file_url} alt={note.title} className="w-full" />
          ) : (
            <iframe src={note.file_url} title={note.title} className="h-[70vh] w-full" />
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Preview isn't available for this file type. Download it to view the content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
