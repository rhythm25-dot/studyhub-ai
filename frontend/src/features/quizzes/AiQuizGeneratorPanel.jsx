import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Sparkles, Trash2 } from 'lucide-react';
import { aiService } from '@/services/aiService';
import { noteService } from '@/services/noteService';
import { quizService } from '@/services/quizService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// The AI drafts questions; the teacher reviews/edits/removes them here
// before anything is saved to the quiz - matching the requirement that
// teachers can edit AI-generated questions before saving.
export function AiQuizGeneratorPanel({ quizId, subjectId, onSaved }) {
  const [noteId, setNoteId] = useState('');
  const [counts, setCounts] = useState({
    mcqCount: 5,
    trueFalseCount: 3,
    shortCount: 2,
    longCount: 1,
  });
  const [drafts, setDrafts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: notesData } = useQuery({
    queryKey: ['notes-for-quiz-gen', subjectId],
    queryFn: () => noteService.list({ subjectId, limit: 50 }),
  });

  const handleGenerate = async () => {
    if (!noteId) {
      toast.error('Select a note to generate questions from');
      return;
    }
    setIsGenerating(true);
    try {
      const questions = await aiService.generateQuiz({ noteId: Number(noteId), ...counts });
      setDrafts(questions);
      toast.success(`Generated ${questions.length} draft questions — review before saving`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateDraft = (index, field, value) => {
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  const removeDraft = (index) => setDrafts((prev) => prev.filter((_, i) => i !== index));

  const handleSaveAll = async () => {
    if (!drafts.length) return;
    setIsSaving(true);
    try {
      await quizService.addQuestionsBulk(quizId, drafts);
      toast.success('Questions saved to quiz');
      setDrafts([]);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save questions');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" />
        <h3 className="font-medium text-gray-900 dark:text-gray-100">AI Quiz Generator</h3>
      </div>

      <div>
        <label className="label">Source note</label>
        <select value={noteId} onChange={(e) => setNoteId(e.target.value)} className="input">
          <option value="">Select a note</option>
          {notesData?.data?.notes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Input
          label="MCQ"
          type="number"
          value={counts.mcqCount}
          onChange={(e) => setCounts((c) => ({ ...c, mcqCount: Number(e.target.value) }))}
        />
        <Input
          label="T/F"
          type="number"
          value={counts.trueFalseCount}
          onChange={(e) => setCounts((c) => ({ ...c, trueFalseCount: Number(e.target.value) }))}
        />
        <Input
          label="Short"
          type="number"
          value={counts.shortCount}
          onChange={(e) => setCounts((c) => ({ ...c, shortCount: Number(e.target.value) }))}
        />
        <Input
          label="Long"
          type="number"
          value={counts.longCount}
          onChange={(e) => setCounts((c) => ({ ...c, longCount: Number(e.target.value) }))}
        />
      </div>

      <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full">
        <Sparkles className="h-4 w-4" /> Generate Questions
      </Button>

      {drafts.length > 0 && (
        <div className="space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Review & edit before saving ({drafts.length})
          </p>
          {drafts.map((d, i) => (
            <div key={i} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
              <div className="mb-2 flex items-start justify-between gap-2">
                <textarea
                  value={d.questionText}
                  onChange={(e) => updateDraft(i, 'questionText', e.target.value)}
                  className="input min-h-[50px] flex-1 text-sm"
                />
                <button
                  onClick={() => removeDraft(i)}
                  className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="badge bg-gray-200 dark:bg-gray-800">{d.questionType}</span>
                <span>{d.marks} marks</span>
              </div>
              <input
                value={d.correctAnswer}
                onChange={(e) => updateDraft(i, 'correctAnswer', e.target.value)}
                className="input mt-2 text-sm"
                placeholder="Correct answer"
              />
            </div>
          ))}
          <Button onClick={handleSaveAll} isLoading={isSaving} className="w-full">
            Save All to Quiz
          </Button>
        </div>
      )}
    </div>
  );
}
