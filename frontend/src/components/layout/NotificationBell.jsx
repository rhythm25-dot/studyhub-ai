import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '@/services/notificationService';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useOnClickOutside(containerRef, () => setIsOpen(false));

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.list(),
    refetchInterval: 60000, // poll every minute for new notifications
  });

  const unreadCount = data?.unreadCount || 0;

  const handleClick = async (id, link) => {
    await notificationService.markAsRead(id);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    setIsOpen(false);
    if (link) navigate(link);
  };

  const handleMarkAll = async () => {
    await notificationService.markAllAsRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-card border border-gray-200 bg-white shadow-soft-lg dark:border-gray-800 dark:bg-surface-dark-subtle">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-brand-600 hover:underline dark:text-brand-400"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!data?.notifications.length && (
              <p className="px-4 py-6 text-center text-sm text-gray-400">You're all caught up</p>
            )}
            {data?.notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n.id, n.link)}
                className={`block w-full border-b border-gray-50 px-4 py-3 text-left text-sm last:border-0 hover:bg-gray-50 dark:border-gray-800/60 dark:hover:bg-gray-800/40 ${
                  !n.is_read ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''
                }`}
              >
                <p className="font-medium text-gray-800 dark:text-gray-100">{n.title}</p>
                <p className="mt-0.5 line-clamp-2 text-gray-500 dark:text-gray-400">{n.message}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
