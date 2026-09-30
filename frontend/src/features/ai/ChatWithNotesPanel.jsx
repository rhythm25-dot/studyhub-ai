import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { aiService } from '@/services/aiService';
import { noteService } from '@/services/noteService';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';

export function ChatWithNotesPanel() {
  const [noteId, setNoteId] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const { data: notesData } = useQuery({
    queryKey: ['notes-for-chat'],
    queryFn: () => noteService.list({ limit: 100 }),
  });

  const handleSend = async (text) => {
    const q = text || question;
    if (!noteId) {
      toast.error('Select a note first');
      return;
    }
    if (!q.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setQuestion('');
    setIsSending(true);
    try {
      const result = await aiService.chat({
        noteId: Number(noteId),
        question: q,
        sessionId: sessionId || undefined,
      });
      setSessionId(result.sessionId);
      setMessages((prev) => [...prev, { role: 'assistant', content: result.answer }]);
      setSuggestedQuestions(result.suggestedQuestions);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Chat failed');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  };

  const handleNoteChange = (value) => {
    setNoteId(value);
    setSessionId(null);
    setMessages([]);
    setSuggestedQuestions([]);
  };

  return (
    <div className="flex h-[65vh] flex-col">
      <select
        value={noteId}
        onChange={(e) => handleNoteChange(e.target.value)}
        className="input mb-3"
      >
        <option value="">Select a note to chat about</option>
        {notesData?.data?.notes.map((n) => (
          <option key={n.id} value={n.id}>
            {n.title}
          </option>
        ))}
      </select>

      <div className="flex-1 overflow-y-auto rounded-card border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-surface-dark-subtle">
        {!noteId ? (
          <EmptyState
            icon={Sparkles}
            title="Chat with your notes"
            description="Select a note above, then ask any question about it."
          />
        ) : messages.length === 0 ? (
          <EmptyState
            title="Ask a question"
            description="Start the conversation by asking something about this note."
          />
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-card px-4 py-2 text-sm ${m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'}`}
                >
                  {m.role === 'assistant' ? <ReactMarkdown>{m.content}</ReactMarkdown> : m.content}
                </div>
              </div>
            ))}
            {isSending && <p className="text-sm text-gray-400">Thinking...</p>}
          </div>
        )}
      </div>

      {suggestedQuestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestedQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {sq}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about this note..."
          className="input"
          disabled={!noteId}
        />
        <Button onClick={() => handleSend()} isLoading={isSending} disabled={!noteId}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
