import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Ban, CheckCircle2, Trash2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '@/services/userService';
import { useDebounce } from '@/hooks/useDebounce';
import { PageHeader } from '@/components/common/PageHeader';
import { Table } from '@/components/ui/Table';
import { Avatar, Badge } from '@/components/ui/Badge';
import { ListSkeleton } from '@/components/ui/Skeleton';

export function AdminUserListPage({ role }) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();
  const queryKey = ['admin-users', role, debouncedSearch];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => userService.list({ role, search: debouncedSearch, limit: 50 }),
  });

  const users = data?.data?.users || [];

  const handleToggleStatus = async (user) => {
    try {
      await userService.setStatus(user.id, !user.is_active);
      toast.success(`${user.name} ${user.is_active ? 'deactivated' : 'activated'}`);
      queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Permanently delete ${user.name}'s account?`)) return;
    try {
      await userService.remove(user.id);
      toast.success('Account deleted');
      queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(String(id));
    toast.success(`ID ${id} copied to clipboard`);
  };

  const columns = [
    {
      header: 'ID',
      accessor: (u) => (
        <button
          onClick={() => handleCopyId(u.id)}
          className="flex items-center gap-1 rounded-lg px-1.5 py-0.5 font-mono text-xs text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          title="Copy ID"
        >
          #{u.id} <Copy className="h-3 w-3" />
        </button>
      ),
    },
    {
      header: 'Name',
      accessor: (u) => (
        <div className="flex items-center gap-2">
          <Avatar name={u.name} url={u.avatar_url} size={28} />
          <span className="font-medium text-gray-800 dark:text-gray-100">{u.name}</span>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: (u) => <span className="text-gray-500 dark:text-gray-400">{u.email}</span>,
    },
    {
      header: 'Status',
      accessor: (u) => (
        <div className="flex gap-1.5">
          {u.is_active ? (
            <Badge color="green">Active</Badge>
          ) : (
            <Badge color="red">Deactivated</Badge>
          )}
          {!u.is_verified && <Badge color="yellow">Unverified</Badge>}
        </div>
      ),
    },
    {
      header: 'Joined',
      accessor: (u) => (
        <span className="text-gray-400">{new Date(u.created_at).toLocaleDateString()}</span>
      ),
    },
    {
      header: '',
      accessor: (u) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => handleToggleStatus(u)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            title={u.is_active ? 'Deactivate' : 'Activate'}
          >
            {u.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => handleDelete(u)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div>
      <PageHeader
        title={role === 'teacher' ? 'Manage Teachers' : 'Manage Students'}
        subtitle={`${data?.meta?.total ?? 0} total accounts`}
      />

      <div className="relative mb-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="input pl-9"
        />
      </div>

      <div className="card p-0 py-2">
        {isLoading ? (
          <div className="p-5">
            <ListSkeleton />
          </div>
        ) : (
          <Table
            columns={columns}
            data={users}
            keyExtractor={(u) => u.id}
            emptyMessage="No accounts found"
          />
        )}
      </div>
    </div>
  );
}
