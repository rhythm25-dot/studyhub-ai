import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, MessageSquare, HelpCircle, ClipboardCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { SummarizerPanel } from './SummarizerPanel';
import { ChatWithNotesPanel } from './ChatWithNotesPanel';
import { DoubtSolverPanel } from './DoubtSolverPanel';

export default function AiToolsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tool') || 'summarize');
  const initialNoteId = searchParams.get('noteId') || undefined;

  if (user?.role === 'teacher') {
    return (
      <div>
        <PageHeader title="AI Tools" subtitle="AI-powered tools for teaching" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card">
            <Sparkles className="mb-2 h-6 w-6 text-brand-600 dark:text-brand-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Quiz Generator</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Generate MCQs, true/false, short and long answer questions from any uploaded note.
              Open a quiz and use the generator panel while building it.
            </p>
          </div>
          <div className="card">
            <ClipboardCheck className="mb-2 h-6 w-6 text-brand-600 dark:text-brand-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              AI Assignment Checker
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get grammar and content scores plus suggestions for a student's submission. Open any
              assignment's submissions list to run it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'summarize', label: 'Summarizer', icon: FileText },
    { key: 'chat', label: 'Chat With Notes', icon: MessageSquare },
    { key: 'doubt', label: 'Doubt Solver', icon: HelpCircle },
  ];

  return (
    <div>
      <PageHeader title="AI Tools" subtitle="AI-powered study tools" />

      <div className="mb-5 flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium ${tab === t.key ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-gray-500'}`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'summarize' && <SummarizerPanel initialNoteId={initialNoteId} />}
      {tab === 'chat' && <ChatWithNotesPanel />}
      {tab === 'doubt' && <DoubtSolverPanel />}
    </div>
  );
}
