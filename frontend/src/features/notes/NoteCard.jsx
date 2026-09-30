import { Link } from 'react-router-dom';
import { FileText, Bookmark, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { noteService } from '@/services/noteService';
import { useAuth } from '@/contexts/AuthContext';

const fileTypeColor = {
  pdf: 'text-red-500 bg-red-50 dark:bg-red-950',
  docx: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
  pptx: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
  image: 'text-purple-500 bg-purple-50 dark:bg-purple-950',
  other: 'text-gray-500 bg-gray-50 dark:bg-gray-800',
};

export function NoteCard({ note, queryKey }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const toggleBookmark = async (e) => {
    e.preventDefault();
    try {
      if (note.is_bookmarked) {
        await noteService.unbookmark(note.id);
        toast.success('Bookmark removed');
      } else {
        await noteService.bookmark(note.id);
        toast.success('Note bookmarked');
      }
      queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    }
  };

  return (
    <Link
      to={`/notes/${note.id}`}
      className="card flex items-start gap-3 transition-shadow hover:shadow-soft-lg"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${fileTypeColor[note.file_type] || fileTypeColor.other}`}
      >
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium text-gray-900 dark:text-gray-100">{note.title}</h3>
        <p className="text-xs text-gray-400">
          {note.subject_name} · {note.teacher_name}
        </p>
        {note.description && (
          <p className="mt-1 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
            {note.description}
          </p>
        )}
        <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
          <Eye className="h-3.5 w-3.5" /> {note.views_count} views
        </p>
      </div>
      {user?.role === 'student' && (
        <button
          onClick={toggleBookmark}
          className="shrink-0 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle bookmark"
        >
          <Bookmark
            className={`h-5 w-5 ${note.is_bookmarked ? 'fill-brand-500 text-brand-500' : 'text-gray-300'}`}
          />
        </button>
      )}
    </Link>
  );
}
