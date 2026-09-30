import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { quizService } from '@/services/quizService';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ListSkeleton } from '@/components/ui/Skeleton';

function AnswerRow({ answer, index, isFinalized, onGraded }) {
  const isObjective = answer.question_type === 'mcq' || answer.question_type === 'true_false';
  const [marks, setMarks] = useState(
    answer.marks_awarded !== null ? String(answer.marks_awarded) : ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const alreadyGraded = answer.marks_awarded !== null;

  const handleSave = async () => {
    const marksNum = Number(marks);
    if (Number.isNaN(marksNum) || marksNum < 0 || marksNum > answer.max_marks) {
      toast.error(`Enter a score between 0 and ${answer.max_marks}`);
      return;
    }
    setIsSaving(true);
    try {
      const result = await quizService.gradeAnswer(answer.id, marksNum);
      toast.success(result.finalized ? 'Saved — quiz is now fully evaluated' : 'Answer graded');
      onGraded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save grade');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
          {index + 1}. {answer.question_text}{' '}
          <span className="text-xs font-normal text-gray-400">({answer.max_marks} marks)</span>
        </p>
        {isObjective && answer.is_correct === 1 && (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
        )}
        {isObjective && answer.is_correct === 0 && (
          <XCircle className="h-5 w-5 shrink-0 text-red-500" />
        )}
      </div>

      <p className="mb-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
        {answer.student_answer || <span className="italic text-gray-400">No answer given</span>}
      </p>

      {isObjective ? (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Badge color={answer.is_correct ? 'green' : 'red'}>
            {answer.is_correct ? 'Correct' : 'Incorrect'}
          </Badge>
          <span>
            Auto-graded: {answer.marks_awarded} / {answer.max_marks}
          </span>
          {!answer.is_correct && <span>Correct answer: {answer.correct_answer}</span>}
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <div className="w-32">
            <Input
              label={`Score (/ ${answer.max_marks})`}
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              disabled={isFinalized}
            />
          </div>
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            disabled={isFinalized}
            variant={alreadyGraded ? 'secondary' : 'primary'}
          >
            {alreadyGraded ? 'Update score' : 'Save score'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function GradeQuizAttemptPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const queryKey = ['quiz-attempt-grading', attemptId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => quizService.getResult(Number(attemptId)),
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey });

  if (isLoading) return <ListSkeleton rows={4} />;
  if (!data) return null;

  const { attempt, answers } = data;
  const isFinalized = attempt.status === 'evaluated';
  const subjectiveCount = answers.filter(
    (a) => a.question_type === 'short' || a.question_type === 'long'
  ).length;
  const gradedCount = answers.filter(
    (a) => (a.question_type === 'short' || a.question_type === 'long') && a.marks_awarded !== null
  ).length;

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to attempts
      </button>

      <PageHeader
        title="Grade Quiz Attempt"
        subtitle={
          isFinalized
            ? `Fully evaluated — ${attempt.score} / ${attempt.total_marks}`
            : `${gradedCount} of ${subjectiveCount} short/long answers graded`
        }
        action={isFinalized && <Badge color="green">Evaluated</Badge>}
      />

      <div className="space-y-3">
        {answers.map((a, i) => (
          <AnswerRow key={a.id} answer={a} index={i} isFinalized={isFinalized} onGraded={refetch} />
        ))}
      </div>
    </div>
  );
}
