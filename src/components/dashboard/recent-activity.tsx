
'use client';

import type { Task, TaskTypeLabel } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Bug, CircleDot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/lib/store';
import { USERS } from '@/lib/data';

type RecentActivityProps = {
  tasks: Task[];
};

const TaskTypeIcon = ({ type }: { type: TaskTypeLabel }) => {
    switch (type) {
        case 'Bug':
            return <Bug className="h-4 w-4 text-red-500" />;
        case 'Task':
            return <CircleDot className="h-4 w-4 text-blue-400" />;
    }
}


export function RecentActivity({ tasks }: RecentActivityProps) {
  const { user, allUsers } = useAuth();
  const { columns } = useStore();

  const recentTasks = useMemo(() => {
    const filtered =
      user?.userType === 'Admin' || user?.userType === 'Manager'
        ? tasks
        : tasks.filter((task) => task.assignedUserId === user?.id);
    
    return filtered
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);
  }, [tasks, user]);

  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <ScrollArea className="h-[300px]">
            <div className="space-y-6">
            {recentTasks.map((task) => {
                const statusLabel = columns.find(c => c.id === task.status)?.title || task.status;
                const assignedUser = allUsers.find(u => u.id === task.assignedUserId);
                return (
                <div key={task.id} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted mt-1">
                        <TaskTypeIcon type={task.type} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                             <Badge variant="outline">{assignedUser?.username || 'Unassigned'}</Badge>
                             <Badge variant="secondary">{statusLabel}</Badge>
                        </div>
                    </div>
                </div>
                );
            })}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
