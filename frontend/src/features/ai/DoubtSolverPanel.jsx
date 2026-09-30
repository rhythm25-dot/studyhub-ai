import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiService } from '@/services/aiService';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function DoubtResult({ doubt }) {
  const examples = safeParse(doubt.examples, []);
  const relatedTopics = safeParse(doubt.related_topics, []);

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">Simple Explanation</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{doubt.simple_explanation}</p>
      </div>
      <div className="card">
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
          Detailed Explanation
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{doubt.detailed_explanation}</p>
      </div>
      {examples.length > 0 && (
        <div className="card">
          <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Examples</h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-300">
            {examples.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      {relatedTopics.length > 0 && (
        <div className="card">
          <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Related Topics</h3>
          <div className="flex flex-wrap gap-2">
            {relatedTopics.map((t, i) => (
              <span
                key={i}
                className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DoubtSolverPanel() {
  const [question, setQuestion] = useState('');
  const [current, setCurrent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { data: history } = useQuery({
    queryKey: ['doubt-history'],
    queryFn: aiService.doubtHistory,
    enabled: showHistory,
  });

  const handleAsk = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    try {
      const result = await aiService.solveDoubt(question);
      setCurrent(result);
      setQuestion('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to solve doubt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="What's your academic doubt? e.g. 'Why does a capacitor block DC current?'"
          className="input"
        />
        <Button onClick={handleAsk} isLoading={isLoading}>
          <Sparkles className="h-4 w-4" /> Solve
        </Button>
        <Button variant="secondary" onClick={() => setShowHistory((p) => !p)}>
          <History className="h-4 w-4" />
        </Button>
      </div>

      {showHistory && history && (
        <div className="card">
          <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Recent Doubts
          </h3>
          <div className="space-y-1">
            {history.map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  setCurrent(h);
                  setShowHistory(false);
                }}
                className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {h.question}
              </button>
            ))}
          </div>
        </div>
      )}

      {!current ? (
        <EmptyState
          icon={Sparkles}
          title="Ask anything"
          description="Get a simple explanation, detailed breakdown, examples, and related topics."
        />
      ) : (
        <DoubtResult doubt={current} />
      )}
    </div>
  );
}
