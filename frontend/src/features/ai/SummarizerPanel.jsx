import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Copy, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiService } from '@/services/aiService';
import { noteService } from '@/services/noteService';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function SummarizerPanel({ initialNoteId }) {
  const [noteId, setNoteId] = useState(initialNoteId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const { data: notesData } = useQuery({
    queryKey: ['notes-for-summarize'],
    queryFn: () => noteService.list({ limit: 100 }),
  });

  const handleSummarize = async () => {
    if (!noteId) {
      toast.error('Select a note first');
      return;
    }
    setIsLoading(true);
    try {
      const result = await aiService.summarize(Number(noteId));
      setSummary(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Summarization failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary.summary);
    toast.success('Summary copied to clipboard');
  };

  const handleExport = () => {
    if (!summary) return;
    const blob = new Blob([summary.summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const keyConcepts = summary ? safeParse(summary.key_concepts, []) : [];
  const definitions = summary ? safeParse(summary.definitions, []) : [];
  const formulas = summary ? safeParse(summary.formulas, []) : [];
  const examTips = summary ? safeParse(summary.exam_tips, []) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <select value={noteId} onChange={(e) => setNoteId(e.target.value)} className="input flex-1">
          <option value="">Select a note to summarize</option>
          {notesData?.data?.notes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.title}
            </option>
          ))}
        </select>
        <Button onClick={handleSummarize} isLoading={isLoading}>
          <Sparkles className="h-4 w-4" /> Summarize
        </Button>
      </div>

      {!summary && !isLoading && (
        <EmptyState
          icon={Sparkles}
          title="Get an instant summary"
          description="Pick a note above to generate a summary, key concepts, definitions, formulas, and exam tips."
        />
      )}

      {summary && (
        <div className="space-y-4">
          <div className="card">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Summary</h3>
              <div className="flex gap-1">
                <button
                  onClick={handleCopy}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={handleExport}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{summary.summary}</p>
          </div>

          {keyConcepts.length > 0 && (
            <div className="card">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Key Concepts</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {keyConcepts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {definitions.length > 0 && (
            <div className="card">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Important Definitions
              </h3>
              <dl className="space-y-2 text-sm">
                {definitions.map((d, i) => (
                  <div key={i}>
                    <dt className="font-medium text-gray-800 dark:text-gray-200">{d.term}</dt>
                    <dd className="text-gray-500 dark:text-gray-400">{d.definition}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {formulas.length > 0 && (
            <div className="card">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Important Formulas
              </h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {formulas.map((f, i) => (
                  <li key={i} className="font-mono">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {examTips.length > 0 && (
            <div className="card">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Exam Tips</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {examTips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
