
'use client';
import * as React from 'react';
import { useProjectStore } from '@/lib/project-store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';

function AddMemberDialog({ project, children }: { project: any, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedUserId, setSelectedUserId] = React.useState<string>('');
    const { allUsers } = useAuth();
    const { updateProject } = useProjectStore();
    const { toast } = useToast();

    const availableUsers = allUsers.filter(u => 
        u.status === 'active' && 
        u.userType !== 'Admin' && 
        !project.members.some((m: any) => m.id === u.id)
    );

    const handleAddMember = () => {
        if (!selectedUserId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a user to add.' });
            return;
        }

        const newMembers = [...project.members, { id: selectedUserId }];
        updateProject(project.id, { members: newMembers });

        toast({ title: 'Member Added', description: 'The new member has been added to the project.' });
        setSelectedUserId('');
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Member to {project.name}</DialogTitle>
                    <DialogDescription>Select a user to add to this project.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a user..." />
                        </SelectTrigger>
                        <SelectContent>
                            {availableUsers.map(user => (
                                <SelectItem key={user.id} value={user.id}>{user.username} ({user.role})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddMember}>Add Member</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ProjectTeamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { projects, updateProject } = useProjectStore();
    const { user: currentUser, allUsers } = useAuth();
    const { toast } = useToast();
    const project = projects.find(p => p.id === id);

    const isManager = currentUser?.userType === 'Manager' || currentUser?.userType === 'Admin';

    if (!project) {
        return <div>Loading project...</div>;
    }
    
    const teamMembers = allUsers.filter(user => project.members.some(m => m.id === user.id));

    const handleRemoveMember = (userId: string) => {
        const memberToRemove = allUsers.find(u => u.id === userId);
        if (memberToRemove?.userType === 'Manager') {
            const managerCount = teamMembers.filter(m => m.userType === 'Manager').length;
            if (managerCount <= 1) {
                toast({
                    variant: 'destructive',
                    title: 'Cannot Remove Manager',
                    description: 'A project must have at least one manager.',
                });
                return;
            }
        }

        const newMembers = project.members.filter(m => m.id !== userId);
        updateProject(project.id, { members: newMembers });
        toast({
            title: 'Member Removed',
            description: 'The member has been removed from the project.',
        });
    };

    return (
        <div className="space-y-6">
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
                    <BreadcrumbPage>Team</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Card>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Team Members for {project.name}</h2>
                    {isManager && (
                        <AddMemberDialog project={project}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Member
                            </Button>
                        </AddMemberDialog>
                    )}
                </div>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>User Type</TableHead>
                        {isManager && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {teamMembers.map((user) => (
                        <TableRow key={user.id}>
                        <TableCell className="font-medium">
                            {user.username}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            {user.userType}
                        </TableCell>
                        {isManager && (
                            <TableCell className="text-right">
                                {user.userType !== 'Admin' && (
                                     <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(user.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                )}
                            </TableCell>
                        )}
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
