import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, FileText, BookOpen, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { searchService } from '@/services/searchService';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 350);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useOnClickOutside(containerRef, () => setIsOpen(false));

  const { data, isFetching } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: () => searchService.search(debouncedQuery),
    enabled: debouncedQuery.trim().length > 1,
  });

  const hasResults =
    data && (data.subjects.length || data.notes.length || data.announcements.length);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search subjects, notes, announcements..."
          className="input pl-9"
        />
      </div>

      {isOpen && debouncedQuery.trim().length > 1 && (
        <div className="absolute z-30 mt-2 w-full rounded-card border border-gray-200 bg-white p-2 shadow-soft-lg dark:border-gray-800 dark:bg-surface-dark-subtle">
          {isFetching && <p className="px-2 py-3 text-sm text-gray-400">Searching...</p>}

          {!isFetching && !hasResults && (
            <p className="px-2 py-3 text-sm text-gray-400">No results for "{debouncedQuery}"</p>
          )}

          {!isFetching &&
            data?.subjects.map((s) => (
              <button
                key={`subject-${s.id}`}
                onClick={() => {
                  navigate(`/subjects/${s.id}`);
                  setIsOpen(false);
                  setQuery('');
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <BookOpen className="h-4 w-4 text-brand-500" /> {s.name}
                <span className="ml-auto text-xs text-gray-400">Subject</span>
              </button>
            ))}

          {!isFetching &&
            data?.notes.map((n) => (
              <button
                key={`note-${n.id}`}
                onClick={() => {
                  navigate(`/notes/${n.id}`);
                  setIsOpen(false);
                  setQuery('');
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <FileText className="h-4 w-4 text-brand-500" /> {n.title}
                <span className="ml-auto text-xs text-gray-400">Note</span>
              </button>
            ))}

          {!isFetching &&
            data?.announcements.map((a) => (
              <button
                key={`ann-${a.id}`}
                onClick={() => {
                  navigate(`/announcements`);
                  setIsOpen(false);
                  setQuery('');
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Megaphone className="h-4 w-4 text-brand-500" /> {a.title}
                <span className="ml-auto text-xs text-gray-400">Announcement</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
