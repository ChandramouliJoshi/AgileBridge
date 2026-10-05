
'use client';

import { KanbanBoard } from '@/components/kanban/kanban-board';
import { DashboardAnalytics } from '@/components/dashboard/dashboard-analytics';
import { useState, useMemo, useEffect } from 'react';
import type { Task, TaskStatus, Project, User } from '@/lib/types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Plus, Flame, Calendar, Info } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useStore } from '@/lib/store';
import { useSprintStore } from '@/lib/sprint-store';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { isPast, format, formatDistance } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';


interface ProjectBoardProps {
  project: Project;
}

const generateColor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 50%, 70%)`;
};


function AllMembersDialog({ members, children }: { members: User[], children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>All Project Members</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {members.map(member => (
                <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.username}</TableCell>
                    <TableCell>{member.role}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProjectBoardContent({ project }: ProjectBoardProps) {
  const [highlightedStatus, setHighlightedStatus] = useState<TaskStatus | 'all' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOverdue, setShowOverdue] = useState(true);
  const { allUsers } = useAuth();
  const allTasks = useStore((state) => state.tasks);
  const { sprints } = useSprintStore();
  const [sprintFilter, setSprintFilter] = useState<string>('active');

  const { activeSprint, upcomingSprints } = useMemo(() => {
    const projectSprints = sprints.filter(s => s.projectId === project.id);
    const active = projectSprints.find(s => s.status === 'active');
    const upcoming = projectSprints.filter(s => s.status === 'upcoming');
    return { activeSprint: active, upcomingSprints: upcoming };
  }, [sprints, project.id]);

  useEffect(() => {
    // If an active sprint exists, default the filter to it, otherwise default to backlog
    setSprintFilter(activeSprint ? activeSprint.id : 'backlog');
  }, [activeSprint]);


  const projectMembers = useMemo(() => {
    return allUsers.filter(user => project.members.some(m => m.id === user.id)).sort((a, b) => a.username.localeCompare(b.username));
  }, [project, allUsers]);
  
  const visibleMembers = projectMembers.slice(0, 5);
  const hiddenMembersCount = projectMembers.length - visibleMembers.length;


  const handleAnalyticsClick = (status: TaskStatus | 'all') => {
    setHighlightedStatus(status);
    setTimeout(() => {
      setHighlightedStatus(null);
    }, 1500);
  };

  const tasksToDisplay = useMemo(() => {
    let tasksForProject = allTasks.filter(t => t.projectId === project.id);
    if (sprintFilter === 'backlog') {
        return tasksForProject.filter(t => !t.sprintId);
    }
    return tasksForProject.filter(t => t.sprintId === sprintFilter);
  }, [allTasks, project.id, sprintFilter]);

  const filteredTasks = tasksToDisplay.filter(task => {
    const isOverdueTask = task.deadline ? isPast(new Date(task.deadline)) : false;
    if (isOverdueTask && !showOverdue) {
        return false;
    }

    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    const user = allUsers.find(u => u.id === task.assignedUserId);
    const sprint = sprints.find(s => s.id === task.sprintId);
    const story = allTasks.find(t => t.id === task.storyId);

    return task.id.toLowerCase().includes(term) ||
      task.title.toLowerCase().includes(term) ||
      task.type.toLowerCase().includes(term) ||
      (user && user.username.toLowerCase().includes(term)) ||
      (sprint && sprint.name.toLowerCase().includes(term)) ||
      (story && story.title.toLowerCase().includes(term));
  });

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
            <DashboardAnalytics onCardClick={handleAnalyticsClick} />
        </div>
        <div className="lg:col-span-1">
             {activeSprint ? (
                <Card className="bg-primary/5 border-primary/20 h-full">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <Flame className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-primary">Active Sprint</h3>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <h4 className="font-bold text-lg">{activeSprint.name}</h4>
                        <Badge variant="outline">{activeSprint.id}</Badge>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(activeSprint.startDate), 'MMM d')} - {format(new Date(activeSprint.endDate), 'MMM d, yyyy')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                            {formatDistance(new Date(activeSprint.endDate), new Date(), { addSuffix: true })} remaining
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-muted/50 border-dashed h-full flex flex-col justify-center items-center">
                    <CardContent className="text-center p-6">
                         <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <h3 className="font-semibold">No Active Sprint</h3>
                        <p className="text-sm text-muted-foreground">The board is currently showing items from the backlog.</p>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 my-6">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            {visibleMembers.map(member => (
              <Tooltip key={member.id}>
                <TooltipTrigger>
                  <Avatar>
                    <AvatarFallback style={{ backgroundColor: generateColor(member.username) }}>
                      {member.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{member.username}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            {hiddenMembersCount > 0 && (
                <AllMembersDialog members={projectMembers}>
                     <Avatar>
                        <AvatarFallback>+{hiddenMembersCount}</AvatarFallback>
                    </Avatar>
                </AllMembersDialog>
            )}
          </TooltipProvider>
        </div>
        <div className='flex items-center gap-4 flex-wrap'>
            <div className="flex items-center space-x-2">
                <Checkbox id="show-overdue" checked={showOverdue} onCheckedChange={(checked) => setShowOverdue(Boolean(checked))} />
                <Label htmlFor="show-overdue" className="text-sm font-medium">Show Overdue</Label>
            </div>
            <div className="relative w-full sm:w-auto sm:min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={`Search tasks...`}
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>
      <KanbanBoard tasks={filteredTasks} highlightedStatus={highlightedStatus} />
    </>
  );
}


export function ProjectBoard({ project }: ProjectBoardProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <ProjectBoardContent project={project} />;
}
