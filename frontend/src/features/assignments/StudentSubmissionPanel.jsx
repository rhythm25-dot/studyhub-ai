import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { UploadCloud, Download } from 'lucide-react';
import { assignmentService } from '@/services/assignmentService';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function StudentSubmissionPanel({ assignment }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: submission, isLoading } = useQuery({
    queryKey: ['my-submission', assignment.id],
    queryFn: () => assignmentService.mySubmission(assignment.id),
  });

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file to submit');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await assignmentService.submit(assignment.id, formData);
      toast.success('Assignment submitted successfully');
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['my-submission', assignment.id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Submission</CardTitle>
      </CardHeader>

      {submission ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {submission.status === 'graded' && <Badge color="green">Graded</Badge>}
            {submission.status === 'late' && <Badge color="yellow">Submitted Late</Badge>}
            {submission.status === 'submitted' && <Badge color="brand">Submitted</Badge>}
            <a
              href={submission.file_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sm text-brand-600 hover:underline dark:text-brand-400"
            >
              <Download className="h-3.5 w-3.5" /> View your file
            </a>
          </div>

          {submission.status === 'graded' && (
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Score: {submission.marks_obtained} / {assignment.max_marks}
              </p>
              {submission.teacher_feedback && (
                <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                  {submission.teacher_feedback}
                </p>
              )}
            </div>
          )}

          {(submission.ai_grammar_score !== null || submission.ai_content_score !== null) && (
            <div className="rounded-lg bg-brand-50 p-3 text-sm dark:bg-brand-900/20">
              <p className="font-medium text-brand-800 dark:text-brand-300">AI Feedback</p>
              <p className="mt-1 text-brand-700 dark:text-brand-400">
                Grammar: {submission.ai_grammar_score}/100 · Content: {submission.ai_content_score}
                /100
              </p>
            </div>
          )}

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-4 text-sm text-gray-500 hover:border-brand-400 dark:border-gray-700 dark:text-gray-400">
            <UploadCloud className="h-4 w-4" /> {file ? file.name : 'Replace your submission'}
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          {file && (
            <Button onClick={handleSubmit} isLoading={isSubmitting} className="w-full">
              Resubmit
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-8 text-sm text-gray-500 hover:border-brand-400 dark:border-gray-700 dark:text-gray-400">
            <UploadCloud className="h-6 w-6" />
            {file ? file.name : 'Select a file to submit'}
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          <Button onClick={handleSubmit} isLoading={isSubmitting} className="w-full">
            Submit Assignment
          </Button>
        </div>
      )}
    </Card>
  );
}
