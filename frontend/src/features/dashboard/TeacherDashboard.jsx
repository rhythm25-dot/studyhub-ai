import { useQuery } from '@tanstack/react-query';
import { BookOpen, Users, FileText, ClipboardCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsService } from '@/services/analyticsService';
import { PageHeader, StatCard } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { ListSkeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/States';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: analyticsService.teacherDashboard,
  });

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0]}`}
        subtitle="Here's an overview of your classes"
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={BookOpen}
            label="Subjects"
            value={data?.overview.subjectCount ?? 0}
            tone="brand"
          />
          <StatCard
            icon={Users}
            label="Students"
            value={data?.overview.studentCount ?? 0}
            tone="green"
          />
          <StatCard
            icon={FileText}
            label="Notes Uploaded"
            value={data?.overview.noteCount ?? 0}
            tone="brand"
          />
          <StatCard
            icon={ClipboardCheck}
            label="Pending Grading"
            value={data?.overview.pendingGrading ?? 0}
            tone="yellow"
          />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Average Score by Subject</CardTitle>
          </CardHeader>
          {isLoading ? (
            <ListSkeleton rows={3} />
          ) : !data?.performance.length ? (
            <EmptyState
              title="No graded assignments yet"
              description="Performance data will appear once you grade submissions."
            />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.performance}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-100 dark:stroke-gray-800"
                />
                <XAxis dataKey="subject_name" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Bar dataKey="avg_score_percent" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Student Activity</CardTitle>
          </CardHeader>
          {isLoading ? (
            <ListSkeleton rows={4} />
          ) : !data?.recentActivity.length ? (
            <EmptyState title="No recent activity" />
          ) : (
            <ul className="space-y-3">
              {data.recentActivity.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  <div>
                    <p className="text-gray-700 dark:text-gray-200">
                      <span className="font-medium">{a.student_name}</span>{' '}
                      {a.activity_type === 'submission' ? 'submitted' : 'attempted'} {a.item_title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.subject_name} · {format(new Date(a.occurred_at), 'PP')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
