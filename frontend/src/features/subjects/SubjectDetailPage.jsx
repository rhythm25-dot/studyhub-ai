import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, FileText, Users, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { subjectService } from '@/services/subjectService';
import { noteService } from '@/services/noteService';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { NoteCard } from '@/features/notes/NoteCard';
import { UploadNoteModal } from '@/features/notes/UploadNoteModal';
import { EnrollStudentModal } from './EnrollStudentModal';

export default function SubjectDetailPage() {
  const { id } = useParams();
  const subjectId = Number(id);
  const { user } = useAuth();
  const [tab, setTab] = useState('notes');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);

  const { data: subject, isLoading: loadingSubject } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => subjectService.getById(subjectId),
  });

  const notesQueryKey = ['notes', { subjectId }];
  const {
    data: notesData,
    isLoading: loadingNotes,
    refetch: refetchNotes,
  } = useQuery({
    queryKey: notesQueryKey,
    queryFn: () => noteService.list({ subjectId }),
    enabled: tab === 'notes',
  });

  const {
    data: students,
    isLoading: loadingStudents,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ['subject-students', subjectId],
    queryFn: () => subjectService.getStudents(subjectId),
    enabled: tab === 'students' && user?.role === 'teacher',
  });

  const handleUnenroll = async (studentId) => {
    try {
      await subjectService.unenrollStudent(subjectId, studentId);
      toast.success('Student removed from subject');
      refetchStudents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove student');
    }
  };

  if (loadingSubject) return <ListSkeleton rows={4} />;
  if (!subject) return <EmptyState title="Subject not found" />;

  const isOwner = user?.role === 'teacher' && subject.teacher_id === user.id;

  return (
    <div>
      <PageHeader
        title={subject.name}
        subtitle={`${subject.code} · Taught by ${subject.teacher_name}`}
      />

      <div className="mb-5 flex gap-1 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setTab('notes')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium ${tab === 'notes' ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-gray-500'}`}
        >
          <FileText className="h-4 w-4" /> Notes
        </button>
        {user?.role !== 'student' && (
          <button
            onClick={() => setTab('students')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium ${tab === 'students' ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-gray-500'}`}
          >
            <Users className="h-4 w-4" /> Students
          </button>
        )}
      </div>

      {tab === 'notes' && (
        <div>
          {isOwner && (
            <div className="mb-4 flex justify-end">
              <Button onClick={() => setIsUploadOpen(true)}>
                <Plus className="h-4 w-4" /> Upload Note
              </Button>
            </div>
          )}
          {loadingNotes ? (
            <ListSkeleton />
          ) : !notesData?.data?.notes.length ? (
            <EmptyState
              icon={FileText}
              title="No notes yet"
              description="Study material for this subject will appear here."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {notesData.data.notes.map((n) => (
                <NoteCard key={n.id} note={n} queryKey={notesQueryKey} />
              ))}
            </div>
          )}
          <UploadNoteModal
            subjectId={subjectId}
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            onUploaded={refetchNotes}
          />
        </div>
      )}

      {tab === 'students' && (
        <div>
          {isOwner && (
            <div className="mb-4 flex justify-end">
              <Button onClick={() => setIsEnrollOpen(true)}>
                <Plus className="h-4 w-4" /> Enroll Student
              </Button>
            </div>
          )}
          {loadingStudents ? (
            <ListSkeleton />
          ) : !students?.length ? (
            <EmptyState icon={Users} title="No students enrolled yet" />
          ) : (
            <div className="card divide-y divide-gray-100 p-0 dark:divide-gray-800">
              {students.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={s.name} url={s.avatar_url} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                      {s.name}
                    </p>
                    <p className="truncate text-xs text-gray-400">{s.email}</p>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleUnenroll(s.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          <EnrollStudentModal
            subjectId={subjectId}
            isOpen={isEnrollOpen}
            onClose={() => setIsEnrollOpen(false)}
            onEnrolled={refetchStudents}
          />
        </div>
      )}
    </div>
  );
}
