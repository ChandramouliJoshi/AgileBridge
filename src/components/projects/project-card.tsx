
'use client';

import type { Project } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, Calendar, CheckCircle, Users, Pencil } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { USERS } from '@/lib/data';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import { EditProjectDialog } from './edit-project-dialog';

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const { user } = useAuth();
  const isManager = user?.userType === 'Manager' || user?.userType === 'Admin';
  const projectMembers = USERS.filter(user => project.members.some(m => m.id === user.id));

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{backgroundColor: project.color}}>
                        <Folder className="h-6 w-6 text-white/80" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">
                           <Link href={`/projects/${project.id}/board`} className="hover:underline">
                                {project.name}
                            </Link>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{project.key}</p>
                    </div>
                </div>
                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {project.status}
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow">
            <p className="text-sm text-muted-foreground h-10 line-clamp-2">{project.description}</p>
            
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Completion</span>
                    <span className="text-xs font-bold">{project.completion}%</span>
                </div>
                <Progress value={project.completion} className="h-2" />
            </div>
            
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(project.createdAt), 'PP')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{project.issues} Issues</span>
                </div>
            </div>
        </CardContent>
        <div className="border-t p-4 space-y-4">
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium text-muted-foreground">Team</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                    {projectMembers.map(member => (
                    <Tooltip key={member.id}>
                        <TooltipTrigger>
                             <Badge variant="outline">{member.username}</Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{member.userType}</p>
                        </TooltipContent>
                    </Tooltip>
                    ))}
                </TooltipProvider>
                </div>
            </div>
            {isManager && (
                <div className="flex justify-end">
                    <EditProjectDialog project={project}>
                        <Button variant="outline" size="sm">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Project
                        </Button>
                    </EditProjectDialog>
                </div>
            )}
        </div>
    </Card>
  );
}
