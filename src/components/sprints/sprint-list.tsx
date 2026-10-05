
'use client';

import { useSprintStore } from '@/lib/sprint-store';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Flame, CheckCircle, Play, Calendar, Flag, ChevronDown, CircleDot, Bug, Layers } from 'lucide-react';
import { format, formatDistance } from 'date-fns';
import { useStore } from '@/lib/store';
import { Progress } from '../ui/progress';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import type { Task, TaskType } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';


interface SprintListProps {
  projectId: string;
}

const TaskTypeIcon = ({ type }: { type: TaskType }) => {
    switch (type) {
        case 'Bug':
            return <Bug className="h-4 w-4 text-red-500" />;
        case 'Task':
            return <CircleDot className="h-4 w-4 text-blue-400" />;
        case 'Story':
            return <Layers className="h-4 w-4 text-green-500" />;
    }
}

function SprintIssues({ tasks }: { tasks: Task[] }) {
    const { allUsers } = useAuth();
    const { columns } = useStore();
    
    if (tasks.length === 0) {
        return <p className="text-sm text-muted-foreground px-3 py-2">No issues in this sprint.</p>
    }

    return (
        <div className="space-y-2">
            {tasks.map(task => {
                const assignedUser = allUsers.find(u => u.id === task.assignedUserId);
                const status = columns.find(c => c.id === task.status);
                return (
                    <div key={task.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                            <TaskTypeIcon type={task.type} />
                            <div>
                                <p className="text-sm font-medium">{task.title}</p>
                                <Badge variant="outline" className="text-xs">{task.id}</Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="secondary">{status?.title || task.status}</Badge>
                             {assignedUser && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback>{assignedUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{assignedUser.username}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export function SprintList({ projectId }: SprintListProps) {
  const { user } = useAuth();
  const isManager = user?.userType === 'Manager' || user?.userType === 'Admin';
  const { sprints, startSprint, completeSprint } = useSprintStore();
  const { tasks } = useStore();
  const [openSprint, setOpenSprint] = useState<string | null>(null);

  const projectSprints = useMemo(() => {
    const sprintsForProject = sprints.filter(s => s.projectId === projectId);
    
    const firstOpenable = sprintsForProject.find(s => s.status === 'active' || s.status === 'upcoming');
    if (firstOpenable && !openSprint) {
        setOpenSprint(firstOpenable.id);
    }
    
    return sprintsForProject.sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (b.status === 'active' && a.status !== 'active') return 1;
        
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (b.status === 'completed' && a.status !== 'completed') return -1;
        
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateB - dateA;
      });
  }, [sprints, projectId, openSprint]);
  
  const activeSprintExists = useMemo(() => projectSprints.some(s => s.status === 'active'), [projectSprints]);

  return (
    <div className="space-y-6">
      {projectSprints.map(sprint => {
        const sprintTasks = tasks.filter(t => t.sprintId === sprint.id);
        const doneTasks = sprintTasks.filter(t => t.status === 'done').length;
        const unfinishedTasks = sprintTasks.filter(t => t.status !== 'done');
        
        const isCompleted = sprint.status === 'completed';
        const completion = isCompleted ? sprint.completionPercentage ?? 0 : (sprintTasks.length > 0 ? (doneTasks / sprintTasks.length) * 100 : 0);
        const totalIssues = isCompleted ? sprint.totalIssues ?? 0 : sprintTasks.length;
        const completedIssues = isCompleted ? sprint.completedIssues ?? 0 : doneTasks;
        
        const statusColors = {
            active: 'border-primary',
            upcoming: 'border-blue-500',
            completed: 'border-green-500',
        };
        const statusIcons = {
            active: <Flame className="h-5 w-5 text-primary" />,
            upcoming: <Calendar className="h-5 w-5 text-blue-500" />,
            completed: <CheckCircle className="h-5 w-5 text-green-500" />,
        };

        const isOpen = openSprint === sprint.id;

        return (
          <Collapsible key={sprint.id} open={isOpen} onOpenChange={() => setOpenSprint(isOpen ? null : sprint.id)}>
            <Card className={statusColors[sprint.status]}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {statusIcons[sprint.status]}
                      {sprint.name}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(sprint.startDate), 'MMM d, yyyy')} - {format(new Date(sprint.endDate), 'MMM d, yyyy')}
                      ({formatDistance(new Date(sprint.endDate), new Date(sprint.startDate))})
                    </CardDescription>
                  </div>
                  <Badge variant={sprint.status === 'active' ? 'default' : 'secondary'}>{sprint.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                  {sprint.goal && (
                      <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                          <Flag className="h-5 w-5 text-muted-foreground mt-1" />
                          <div>
                               <h4 className="font-semibold">Sprint Goal</h4>
                               <p className="text-sm text-muted-foreground">{sprint.goal}</p>
                          </div>
                      </div>
                  )}
                <div>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="font-medium text-muted-foreground">Progress ({completedIssues}/{totalIssues} tasks)</span>
                    <span className="font-bold">{Math.round(completion)}%</span>
                  </div>
                  <Progress value={completion} className="h-2" />
                </div>
              </CardContent>

                <CollapsibleContent>
                    <Separator />
                    <div className="p-4">
                        <h4 className="text-sm font-semibold mb-2 px-1">Issues in Sprint</h4>
                        <SprintIssues tasks={sprintTasks} />
                    </div>
                </CollapsibleContent>
              
              <CardFooter className={cn("flex items-center", isManager ? "justify-between" : "justify-end")}>
                {isManager && (
                    <div className="flex gap-2">
                      {sprint.status === 'upcoming' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button disabled={activeSprintExists} variant="secondary">
                                  <Play className="mr-2 h-4 w-4" /> Start Sprint
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to start this sprint?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Starting this sprint will make it the active sprint for this project. Any other active sprints will be moved to 'upcoming'.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => startSprint(sprint.id, sprint.projectId)}>
                                        Start Sprint
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      )}
                      {sprint.status === 'active' && (
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button>
                                  <CheckCircle className="mr-2 h-4 w-4" /> Complete Sprint
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Complete Sprint: {sprint.name}?</AlertDialogTitle>
                                    {unfinishedTasks.length > 0 ? (
                                        <AlertDialogDescription>
                                            There are {unfinishedTasks.length} unfinished issue(s) in this sprint. They will be moved back to the backlog.
                                        </AlertDialogDescription>
                                    ) : (
                                        <AlertDialogDescription>
                                            All issues in this sprint are complete. Are you sure you want to mark this sprint as completed?
                                        </AlertDialogDescription>
                                    )}
                                </AlertDialogHeader>
                                {unfinishedTasks.length > 0 && (
                                    <div className='py-4'>
                                        <h4 className="text-sm font-semibold mb-2">Unfinished Issues:</h4>
                                        <ScrollArea className="h-40 border rounded-md p-2">
                                            <div className="space-y-2">
                                                {unfinishedTasks.map(task => (
                                                    <div key={task.id} className="flex items-center justify-between text-sm p-1">
                                                        <span className='truncate pr-2'>{task.title}</span>
                                                        <Badge variant="outline">{task.id}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => completeSprint(sprint.id, sprint.projectId)}>
                                        Complete Sprint
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      )}
                    </div>
                )}
                 <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                        {isOpen ? 'Hide Issues' : 'Show Issues'}
                        <ChevronDown className={cn("h-4 w-4 ml-2 transition-transform", isOpen && "rotate-180")} />
                    </Button>
                </CollapsibleTrigger>
              </CardFooter>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
