
'use client';
import * as React from 'react';
import { useProjectStore } from '@/lib/project-store';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { SprintList } from '@/components/sprints/sprint-list';
import { NewSprintDialog } from '@/components/sprints/new-sprint-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Project } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading';
import { useEffect } from 'react';


export default function ProjectSprintsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { projects } = useProjectStore();
  const project = projects.find(p => p.id === id);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isManager = user?.userType === 'Manager' || user?.userType === 'Admin';
  
  useEffect(() => {
    if (!isLoading && !isManager) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, isManager, router]);

  if (isLoading || !user || !isManager) {
    return <Loading />;
  }

  if (!project) {
    return <div>Loading project...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/projects">Projects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Sprints</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {isManager && (
          <NewSprintDialog projectId={project.id}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Sprint
            </Button>
          </NewSprintDialog>
        )}
      </div>
      <SprintList projectId={project.id} />
    </div>
  )
}
