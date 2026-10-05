
'use client';

import Link from 'next/link';
import { Bell, Search, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { Notifications } from './notifications';
import { ThemeToggle } from './theme-toggle';
import { NewTaskDialog } from '../tasks/new-task-dialog';
import { AdminDialog } from '../admin/admin-dialog';

type HeaderProps = {
  showSearch?: boolean;
};

export function Header({ showSearch = true }: HeaderProps) {
  const { user, logout } = useAuth();
  const isAdmin = user?.userType === 'Admin';
  const isManager = isAdmin || user?.userType === 'Manager';


  return (
    <>
      <div className="w-full flex-1">
        {showSearch && (
          <form>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
              />
            </div>
          </form>
        )}
      </div>

       {isManager && (
        <NewTaskDialog>
            <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
            </Button>
        </NewTaskDialog>
       )}
      <Notifications />
      <ThemeToggle />

      {isAdmin && (
        <AdminDialog>
            <Button variant="ghost" size="icon">
                <Users className="h-5 w-5" />
                <span className="sr-only">Admin Panel</span>
            </Button>
        </AdminDialog>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
             <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                 {user?.username?.charAt(0).toUpperCase()}
             </div>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isAdmin && (
            <AdminDialog>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Admin Panel
              </DropdownMenuItem>
            </AdminDialog>
          )}
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
