
'use client';
import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Task, TaskStatus } from '@/lib/types';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useProjectStore } from '@/lib/project-store';
import { Input } from '../ui/input';

type ReassignTaskDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskId: string, newStatus: TaskStatus, newUserId: string | undefined, timeSpent?: number) => void;
  task: Task | null;
  newStatus?: TaskStatus | null;
};

export function ReassignTaskDialog({ isOpen, onClose, onConfirm, task, newStatus }: ReassignTaskDialogProps) {
  const [assignedUserId, setAssignedUserId] = useState<string | undefined>(undefined);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const { allUsers } = useAuth();
  const { projects } = useProjectStore();

  useEffect(() => {
    if (task) {
      setAssignedUserId(task.assignedUserId);
      setTimeSpent(task.timeSpent);
    }
  }, [task]);
  
  if (!task || !newStatus) return null;

  const project = projects.find(p => p.id === task.projectId);
  const projectMembers = allUsers.filter(u => project?.members.some(m => m.id === u.id));

  const handleConfirm = () => {
    onConfirm(task.id, newStatus, assignedUserId, timeSpent);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="break-all">Move Task: "{task.title}"</AlertDialogTitle>
          <AlertDialogDescription>
            You are moving this task to a new status. You can also re-assign it and log time spent.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-6 my-4">
            <div className="grid gap-2">
                <Label htmlFor="assignee">Assign To</Label>
                <Select onValueChange={setAssignedUserId} value={assignedUserId}>
                    <SelectTrigger id="assignee">
                        <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                        {projectMembers.map(user => (
                            <SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="time-spent">Hours Spent</Label>
                <Input
                  id="time-spent"
                  type="number"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(Number(e.target.value))}
                  min="0"
                  max={task.estimatedHours}
                />
            </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleConfirm}>Save Changes</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
