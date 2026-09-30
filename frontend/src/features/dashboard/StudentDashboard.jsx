import { useQuery } from '@tanstack/react-query';
import { ClipboardList, HelpCircle, Bookmark, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsService } from '@/services/analyticsService';
import { PageHeader, StatCard } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { ListSkeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/States';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: analyticsService.studentDashboard,
  });

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0]}`}
        subtitle="Here's what's happening in your studies"
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
            icon={ClipboardList}
            label="Assignments Due"
            value={data?.overview.assignmentsDue ?? 0}
            tone="yellow"
          />
          <StatCard
            icon={HelpCircle}
            label="Upcoming Quizzes"
            value={data?.overview.upcomingQuizzes ?? 0}
            tone="brand"
          />
          <StatCard
            icon={Bookmark}
            label="Bookmarked Notes"
            value={data?.overview.bookmarkCount ?? 0}
            tone="green"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg. Score"
            value={data?.overview.avgAssignmentScore ? `${data.overview.avgAssignmentScore}%` : '—'}
            tone="brand"
          />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          {isLoading ? (
            <ListSkeleton rows={3} />
          ) : !data?.performanceTrend.length ? (
            <EmptyState
              title="No graded work yet"
              description="Your assignment scores will show up here once graded."
            />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.performanceTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-100 dark:stroke-gray-800"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => format(new Date(d), 'MMM d')}
                  fontSize={12}
                />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip labelFormatter={(d) => format(new Date(d), 'PP')} />
                <Line
                  type="monotone"
                  dataKey="score_percent"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
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
                      {a.activity_type === 'submission' ? 'Submitted' : 'Attempted'}{' '}
                      <span className="font-medium">{a.item_title}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(a.occurred_at), 'PP p')}
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
