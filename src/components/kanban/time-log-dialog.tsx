
'use client';
import { useState } from 'react';
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
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { Task } from '@/lib/types';
import { Button } from '../ui/button';

type TimeLogDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hours: number) => void;
  task: Task | null;
};

export function TimeLogDialog({ isOpen, onClose, onConfirm, task }: TimeLogDialogProps) {
  const [hours, setHours] = useState(0);

  const handleConfirm = () => {
    onConfirm(hours);
  };
  
  if (!task) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="break-all">Log Time for "{task.title}"</AlertDialogTitle>
          <AlertDialogDescription>
            How many hours have you spent on this task so far?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2 my-4">
            <Label htmlFor="time-spent">Hours Spent</Label>
            <Input 
                id="time-spent"
                type="number"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                min="0"
                max={task.estimatedHours}
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleConfirm}>Log Time</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
