
'use client';
import { useState, useEffect } from 'react';
import type { User, UserType, KanbanColumnData, Role } from '@/lib/types';
import { USER_TYPES, ROLES } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SuggestStoriesDialog } from './suggest-stories-dialog';
import { Settings, Trash2, UserCheck, UserX, Users, Save } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';

export function AdminPanel({ onSaveChanges }: { onSaveChanges: () => void }) {
  const { allUsers, approveUser, rejectUser, updateUser, deleteUser } = useAuth();
  const [editableUsers, setEditableUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setEditableUsers(allUsers.filter(u => u.status !== 'pending'));
  }, [allUsers]);

  const pendingUsers = allUsers.filter(u => u.status === 'pending');

  const handleFieldChange = (userId: string, field: keyof User, value: string) => {
    setEditableUsers(editableUsers.map(u => u.id === userId ? { ...u, [field]: value } : u));
  }

  const handleSaveAllUsers = () => {
    editableUsers.forEach(user => {
        updateUser(user.id, {
            username: user.username,
            email: user.email,
            userType: user.userType,
            role: user.role,
        });
    });
    toast({
        title: "Users Updated",
        description: `All user changes have been saved.`,
    });
    onSaveChanges();
  };
  
  const handleDeleteUser = (userId: string) => {
    const userToDelete = allUsers.find(u => u.id === userId);
    if(userToDelete && userToDelete.userType === 'Admin') {
        toast({
            variant: 'destructive',
            title: "Action Forbidden",
            description: "Cannot delete an Admin user.",
        });
        return;
    }
    deleteUser(userId);
    toast({
      variant: 'destructive',
      title: 'User Deleted',
      description: `User has been permanently deleted.`,
    });
  }

  return (
    <div className="space-y-8">
        {pendingUsers.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-primary"/>
                        Pending Approvals
                        <Badge variant="outline">{pendingUsers.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={() => approveUser(user.id)}>
                                            <UserCheck className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => rejectUser(user.id)}>
                                            <UserX className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}
        <Card>
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    User Management
                </h2>
                <SuggestStoriesDialog />
            </div>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[180px]">Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">User Type</TableHead>
                    <TableHead className="w-[150px]">Role</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {editableUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <Input value={user.username} onChange={(e) => handleFieldChange(user.id, 'username', e.target.value)} />
                        </TableCell>
                        <TableCell>
                             <Input value={user.email} onChange={(e) => handleFieldChange(user.id, 'email', e.target.value)} />
                        </TableCell>
                        <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>{user.status}</Badge>
                        </TableCell>
                        <TableCell>
                            <Select 
                                value={user.userType}
                                onValueChange={(newUserType) => handleFieldChange(user.id, 'userType', newUserType)}
                                disabled={user.userType === 'Admin'}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {USER_TYPES.map((userType) => (
                                    <SelectItem key={userType} value={userType} disabled={userType === 'Admin'}>
                                        {userType}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </TableCell>
                        <TableCell>
                            <Select 
                                value={user.role}
                                onValueChange={(newRole) => handleFieldChange(user.id, 'role', newRole)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteUser(user.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            <CardFooter className="flex justify-end p-4 border-t">
                <Button onClick={handleSaveAllUsers}>
                    <Save className="mr-2 h-4 w-4" />
                    Save All Changes
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
