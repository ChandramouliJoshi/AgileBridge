
'use client';

import type { Task, TaskStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { differenceInDays, isPast } from 'date-fns';
import { useProjectStore } from '@/lib/project-store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useStore } from '@/lib/store';

type DashboardAnalyticsProps = {
  onCardClick?: (status: TaskStatus | 'all') => void;
};

function TooltipList({ data }: { data: Record<string, number> }) {
  if (Object.keys(data).length === 0) {
    return <p className="text-center text-sm">No issues for this status.</p>;
  }

  return (
    <ul className="space-y-1 text-sm">
      {Object.entries(data).map(([projectName, count]) => (
        <li key={projectName} className="flex justify-between">
          <span>{projectName}:</span>
          <span className="font-bold ml-4">{count}</span>
        </li>
      ))}
    </ul>
  );
}

export function DashboardAnalytics({ onCardClick = () => {} }: DashboardAnalyticsProps) {
  const { user } = useAuth();
  const { projects } = useProjectStore();
  const allTasks = useStore((state) => state.tasks);

  const userFilteredTasks =
    user?.userType === 'Admin' || user?.userType === 'Manager'
      ? allTasks
      : allTasks.filter((task) => task.assignedUserId === user?.id);

  const totalTasks = userFilteredTasks.length;
  const doneTasks = userFilteredTasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = userFilteredTasks.filter(
    (t) => t.status === 'in-progress'
  ).length;
  const todoTasks = userFilteredTasks.filter((t) => t.status === 'to-do').length;
  
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const tasksAddedLastWeek = userFilteredTasks.filter(
    (task) => differenceInDays(new Date(), new Date(task.createdAt)) <= 7
  ).length;

  const createBreakdown = (status?: TaskStatus) => {
    const tasksToConsider = status
      ? userFilteredTasks.filter(t => t.status === status)
      : userFilteredTasks;

    return tasksToConsider.reduce((acc, task) => {
      const project = projects.find(p => p.id === task.projectId);
      const projectName = project?.name || 'Unknown Project';
      acc[projectName] = (acc[projectName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  const issuesByProject = createBreakdown();
  const issuesByProjectToDo = createBreakdown('to-do');
  const issuesByProjectInProgress = createBreakdown('in-progress');
  const issuesByProjectDone = createBreakdown('done');


  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
             <Card className="bg-card-purple border-purple-500/20 cursor-pointer rounded-xl" onClick={() => onCardClick('all')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
                <div className="h-4 w-4 rounded-sm bg-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{totalTasks}</div>
                <Badge variant="outline" className="mt-2 text-xs font-normal">
                  +{tasksAddedLastWeek} created this week
                </Badge>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <div className="p-2">
              <h4 className="font-semibold mb-2 text-center">Issues per Project</h4>
              <TooltipList data={issuesByProject} />
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-card-orange border-orange-500/20 cursor-pointer rounded-xl" onClick={() => onCardClick('to-do')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">To Do</CardTitle>
                <div className="h-4 w-4 rounded-sm bg-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{todoTasks}</div>
                <Badge variant="outline" className="mt-2 text-xs font-normal">Ready to start</Badge>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <div className="p-2">
                <h4 className="font-semibold mb-2 text-center">"To Do" per Project</h4>
                <TooltipList data={issuesByProjectToDo} />
            </div>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-card-blue border-blue-500/20 cursor-pointer rounded-xl" onClick={() => onCardClick('in-progress')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                <div className="h-4 w-4 rounded-sm bg-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{inProgressTasks}</div>
                <Badge variant="outline" className="mt-2 text-xs font-normal">Active work</Badge>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
              <div className="p-2">
                <h4 className="font-semibold mb-2 text-center">"In Progress" per Project</h4>
                <TooltipList data={issuesByProjectInProgress} />
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-card-green border-green-500/20 cursor-pointer rounded-xl" onClick={() => onCardClick('done')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                <div className="h-4 w-4 rounded-sm bg-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{doneTasks}</div>
                <Badge variant="outline" className="mt-2 text-xs font-normal">{completionRate}% completion rate</Badge>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <div className="p-2">
                <h4 className="font-semibold mb-2 text-center">"Completed" per Project</h4>
                <TooltipList data={issuesByProjectDone} />
            </div>
          </TooltipContent>
        </Tooltip>

      </TooltipProvider>
    </div>
  );
}
