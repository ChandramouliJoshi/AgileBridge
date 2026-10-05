
'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { NOTIFICATIONS, TASKS } from '@/lib/data';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { TaskDetailDialog } from '../kanban/task-detail-dialog';
import type { Task } from '@/lib/types';

export function Notifications() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (taskId?: string) => {
    if (taskId) {
        const task = TASKS.find(t => t.id === taskId);
        if (task) {
            setSelectedTask(task);
        }
    }
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };
  
  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  }

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
            <span>Notifications</span>
            {unreadCount > 0 && 
                <Button variant="link" size="sm" className="h-auto p-0" onClick={handleMarkAllRead}>
                    {unreadCount} new
                </Button>
            }
        </DropdownMenuLabel>
        <Separator className="my-1" />
        {notifications.length === 0 && (
          <p className="p-4 text-center text-sm text-muted-foreground">
            No new notifications
          </p>
        )}
        {notifications.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            className={cn('flex items-start gap-3 p-3 cursor-pointer', !notification.read && 'bg-accent/50')}
            onClick={() => {
                handleMarkAsRead(notification.id);
                handleNotificationClick(notification.taskId);
            }}
          >
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-sm">{notification.title}</p>
              <p className="text-xs text-muted-foreground">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-primary mt-1" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
    {selectedTask && (
        <TaskDetailDialog 
            isOpen={!!selectedTask}
            onOpenChange={(isOpen) => !isOpen && setSelectedTask(null)}
            task={selectedTask}
        />
    )}
    </>
  );
}
