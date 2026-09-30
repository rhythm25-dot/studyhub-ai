import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Sparkles, Download } from 'lucide-react';
import { assignmentService } from '@/services/assignmentService';
import { aiService } from '@/services/aiService';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar, Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { ListSkeleton } from '@/components/ui/Skeleton';

function GradeRow({ submission, maxMarks, onGraded }) {
  const [marks, setMarks] = useState(submission.marks_obtained?.toString() ?? '');
  const [feedback, setFeedback] = useState(submission.teacher_feedback ?? '');
  const [isGrading, setIsGrading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleGrade = async () => {
    const marksNum = Number(marks);
    if (Number.isNaN(marksNum) || marksNum < 0 || marksNum > maxMarks) {
      toast.error(`Enter a score between 0 and ${maxMarks}`);
      return;
    }
    setIsGrading(true);
    try {
      await assignmentService.gradeSubmission(submission.id, {
        marksObtained: marksNum,
        teacherFeedback: feedback,
      });
      toast.success('Submission graded');
      onGraded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to grade');
    } finally {
      setIsGrading(false);
    }
  };

  const handleAiCheck = async () => {
    setIsChecking(true);
    try {
      const result = await aiService.checkAssignment(submission.id);
      toast.success('AI feedback generated');
      setFeedback((prev) => prev || result.overallFeedback);
      onGraded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'AI check failed');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="border-b border-gray-100 py-4 last:border-0 dark:border-gray-800/60">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={submission.student_name} size={28} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
              {submission.student_name}
            </p>
            <p className="truncate text-xs text-gray-400">{submission.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {submission.status === 'graded' && (
            <Badge color="green">
              {submission.marks_obtained}/{maxMarks}
            </Badge>
          )}
          <a
            href={submission.file_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="text-sm text-brand-600 hover:underline dark:text-brand-400"
          >
            {expanded ? 'Close' : 'Grade'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
          {submission.ai_grammar_score !== null && (
            <div className="rounded-lg bg-brand-50 p-2.5 text-xs dark:bg-brand-900/20">
              <p className="font-medium text-brand-800 dark:text-brand-300">
                AI Feedback — Grammar {submission.ai_grammar_score}/100 · Content{' '}
                {submission.ai_content_score}/100
              </p>
            </div>
          )}
          <Button
            variant="secondary"
            onClick={handleAiCheck}
            isLoading={isChecking}
            className="w-full"
          >
            <Sparkles className="h-4 w-4" /> Run AI Assignment Checker
          </Button>
          <div className="grid grid-cols-3 gap-2">
            <Input
              label={`Score (/ ${maxMarks})`}
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="col-span-1"
            />
          </div>
          <div>
            <label className="label">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="input min-h-[80px]"
              placeholder="Feedback for the student"
            />
          </div>
          <Button onClick={handleGrade} isLoading={isGrading} className="w-full">
            Save Grade
          </Button>
        </div>
      )}
    </div>
  );
}

export function TeacherGradingPanel({ assignment }) {
  const queryClient = useQueryClient();
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['submissions', assignment.id],
    queryFn: () => assignmentService.submissions(assignment.id),
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: ['submissions', assignment.id] });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submissions ({submissions?.length ?? 0})</CardTitle>
      </CardHeader>
      {isLoading ? (
        <ListSkeleton />
      ) : !submissions?.length ? (
        <EmptyState title="No submissions yet" />
      ) : (
        <div>
          {submissions.map((s) => (
            <GradeRow
              key={s.id}
              submission={s}
              maxMarks={assignment.max_marks}
              onGraded={refetch}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
