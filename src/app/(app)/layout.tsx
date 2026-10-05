
'use client';
import { Header } from '@/components/layout/header';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  KanbanSquare,
  Folder,
  Plus,
  Settings,
  LogOut,
  Users,
  ChevronRight,
  ClipboardList,
  Flame,
  MoreHorizontal,
  Pencil,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Loading from '../loading';
import { useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NewProjectDialog } from '@/components/projects/new-project-dialog';
import { useProjectStore } from '@/lib/project-store';
import { EditProjectDialog } from '@/components/projects/edit-project-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const { projects } = useProjectStore();
  const isManager = user?.userType === 'Manager' || user?.userType === 'Admin';


  const isProjectPage = pathname.startsWith('/projects/');
  const projectId = isProjectPage ? pathname.split('/')[2] : null;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-primary"
              >
                <path d="M12 3L4 9V17H20V9L12 3Z" />
                <path d="M8 21V15H16V21" />
                <path d="M10 11H14" />
            </svg>
            <span className="text-lg font-semibold">AgileBridge</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                <Link href="/dashboard">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <Collapsible open={isProjectsOpen} onOpenChange={setIsProjectsOpen}>
              <SidebarMenuItem>
                <div className='flex items-center w-full'>
                    <SidebarMenuButton
                    asChild
                    isActive={pathname === '/projects'}
                    className="flex-1"
                  >
                    <Link href="/projects">
                      <Folder />
                      Projects
                    </Link>
                  </SidebarMenuButton>
                  {isManager && (
                    <NewProjectDialog>
                       <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </NewProjectDialog>
                  )}
                  <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <ChevronRight className={cn("h-4 w-4 transition-transform", isProjectsOpen && "rotate-90")} />
                      </Button>
                  </CollapsibleTrigger>
                </div>
              </SidebarMenuItem>
              
              <CollapsibleContent>
                <div className="ml-4 space-y-1 mt-1">
                  {projects.map(project => (
                      <SidebarMenuItem key={project.id}>
                        <div className="flex items-center w-full group">
                           <SidebarMenuButton
                              asChild
                              size="sm"
                              isActive={pathname.startsWith(`/projects/${project.id}`)}
                              className="flex-1"
                            >
                              <Link href={`/projects/${project.id}/board`}>
                                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: project.color }}></span>
                                {project.name}
                              </Link>
                            </SidebarMenuButton>
                            {isManager && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                   <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <EditProjectDialog project={project}>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                          <Pencil className="mr-2 h-4 w-4" />
                                          Edit
                                      </DropdownMenuItem>
                                  </EditProjectDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                        </div>
                      </SidebarMenuItem>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>


            {isProjectPage && projectId && (
              <div className="ml-4 mt-2">
                <SidebarGroupLabel>Project Tools</SidebarGroupLabel>
                 {isManager && (
                   <>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.includes('/sprints')}
                      >
                        <Link href={`/projects/${projectId}/sprints`}>
                          <Flame />
                          Sprints
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                        asChild
                        isActive={pathname.includes('/backlog')}
                        >
                        <Link href={`/projects/${projectId}/backlog`}>
                            <ClipboardList />
                            Backlog
                        </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                   </>
                 )}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes('/board')}
                  >
                    <Link href={`/projects/${projectId}/board`}>
                      <KanbanSquare />
                      Board
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes('/team')}
                  >
                    <Link href={`/projects/${projectId}/team`}>
                      <Users />
                      Team
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </div>
            )}
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/settings')}
              >
                <Link href="/settings">
                  <Settings />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOut />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>
      <SidebarInset>
        <div className="flex min-h-screen w-full flex-col">
          <header className="flex h-16 items-center gap-2 border-b bg-card px-4 lg:px-6">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <Header />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-background">
             <div className="mx-auto w-full max-w-7xl">
                {children}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <Loading />;
  }
  
  const authRoutes = ['/login', '/signup', '/forgot-password'];
  if (authRoutes.includes(pathname)) {
      return <Loading />;
  }

  return <AppLayoutContent>{children}</AppLayoutContent>;
}
