import { Link } from 'react-router-dom';
import { Users, FileText } from 'lucide-react';

export function SubjectCard({ subject }) {
  return (
    <Link
      to={`/subjects/${subject.id}`}
      className="card block transition-shadow hover:shadow-soft-lg"
    >
      <div
        className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-white"
        style={{ backgroundColor: subject.cover_color }}
      >
        {subject.code.slice(0, 2)}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{subject.name}</h3>
      <p className="mt-0.5 text-xs text-gray-400">
        {subject.code} · {subject.teacher_name}
      </p>
      {subject.description && (
        <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {subject.description}
        </p>
      )}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> {subject.student_count} students
        </span>
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" /> {subject.notes_count} notes
        </span>
      </div>
    </Link>
  );
}
