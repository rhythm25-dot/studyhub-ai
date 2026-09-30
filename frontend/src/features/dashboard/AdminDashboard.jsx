import { useQuery } from '@tanstack/react-query';
import { Users, GraduationCap, BookOpen, Megaphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { subjectService } from '@/services/subjectService';
import { PageHeader, StatCard } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: teachers, isLoading: loadingTeachers } = useQuery({
    queryKey: ['admin-users', 'teacher'],
    queryFn: () => userService.list({ role: 'teacher', limit: 1 }),
  });
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['admin-users', 'student'],
    queryFn: () => userService.list({ role: 'student', limit: 1 }),
  });
  const { data: subjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ['admin-subjects'],
    queryFn: () => subjectService.list({ limit: 1 }),
  });

  const isLoading = loadingTeachers || loadingStudents || loadingSubjects;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0]}`}
        subtitle="Platform overview"
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
            icon={GraduationCap}
            label="Teachers"
            value={teachers?.meta?.total ?? 0}
            tone="brand"
          />
          <StatCard icon={Users} label="Students" value={students?.meta?.total ?? 0} tone="green" />
          <StatCard
            icon={BookOpen}
            label="Active Subjects"
            value={subjects?.meta?.total ?? 0}
            tone="brand"
          />
          <StatCard icon={Megaphone} label="Platform" value="Healthy" tone="green" />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Manage Teachers</CardTitle>
          </CardHeader>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review teacher accounts, verify status, and deactivate accounts if needed.
          </p>
          <Link to="/admin/teachers" className="btn-secondary mt-4 inline-flex">
            View teachers
          </Link>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Students</CardTitle>
          </CardHeader>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review student accounts and manage platform access.
          </p>
          <Link to="/admin/students" className="btn-secondary mt-4 inline-flex">
            View students
          </Link>
        </Card>
      </div>
    </div>
  );
}
