

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TASK_TYPES, PRIORITIES, EFFORT_LEVELS } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { DatePicker } from '../ui/date-picker';
import { useStore } from '@/lib/store';
import type { Task, Sprint } from '@/lib/types';
import { useSprintStore } from '@/lib/sprint-store';
import { add, differenceInMilliseconds } from 'date-fns';
import { useProjectStore } from '@/lib/project-store';
import { useAuth } from '@/hooks/use-auth';


const taskSchema = z.object({
  projectId: z.string().min(1, 'Please select a project.'),
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  status: z.string().min(1, 'Please select a status.'),
  type: z.string().min(1, 'Please select a task type.'),
  priority: z.string().min(1, 'Please select a priority.'),
  estimatedHours: z.coerce.number().min(0.5, 'Estimated hours must be at least 0.5.').optional(),
  effort: z.string().optional(),
  assignedUserId: z.string().min(1, 'Please assign a user.'),
  deadline: z.date().optional(),
  storyId: z.string().optional(),
  sprintId: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function NewTaskDialog({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const currentProjectId = pathname.startsWith('/projects/') ? pathname.split('/')[2] : '';
  const { addTask, tasks, columns } = useStore();
  const { sprints } = useSprintStore();
  const { projects } = useProjectStore();
  const { allUsers } = useAuth();


  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      projectId: currentProjectId,
      title: '',
      description: '',
      status: 'to-do',
      type: 'Task',
      priority: 'Medium',
      effort: 'Medium',
      assignedUserId: '',
      deadline: undefined,
      storyId: '',
      sprintId: '',
    },
  });

  const watchType = form.watch('type');
  const watchProjectId = form.watch('projectId');
  
  const stories = tasks.filter(t => t.type === 'Story' && t.projectId === watchProjectId);
  const projectSprints = sprints.filter(s => s.projectId === watchProjectId && s.status !== 'completed');
  const projectMembers = allUsers.filter(u => projects.find(p => p.id === watchProjectId)?.members.some(m => m.id === u.id));

  const handleSprintChange = (sprintId: string) => {
    const selectedSprint = sprints.find(s => s.id === sprintId);
    if (selectedSprint) {
        form.setValue('deadline', new Date(selectedSprint.endDate), { shouldValidate: true, shouldDirty: true });
    } else {
        form.setValue('deadline', undefined);
    }
    form.setValue('sprintId', sprintId === 'none' ? undefined : sprintId);
  }


  const onSubmit = (data: TaskFormValues) => {
    const effortToHoursMap = { Low: 4, Medium: 8, High: 16 };
    const estimatedHours = data.effort ? effortToHoursMap[data.effort as keyof typeof effortToHoursMap] : data.estimatedHours || 0;

    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'> = {
      ...data,
      estimatedHours,
      effort: data.effort as Task['effort'],
      priority: data.priority as Task['priority'],
      type: data.type as Task['type'],
      deadline: data.deadline?.toISOString(),
      storyId: data.storyId === 'none' ? undefined : data.storyId,
      sprintId: data.sprintId === 'none' ? undefined : data.sprintId,
    };

    addTask(taskData);
    
    toast({
      title: 'Task Created!',
      description: `"${data.title}" has been added.`,
    });
    form.reset({
      projectId: currentProjectId,
      title: '',
      description: '',
      status: 'to-do',
      type: 'Task',
      priority: 'Medium',
      effort: 'Medium',
      assignedUserId: '',
      deadline: undefined,
      storyId: '',
      sprintId: '',
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            Create New Task
          </DialogTitle>
          <DialogDescription>Fill in the details below to add a new task to your project.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('sprintId', '');
                      form.setValue('storyId', '');
                      form.setValue('assignedUserId', '');
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
            <FormField
              control={form.control}
              name="sprintId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sprint (Optional)</FormLabel>
                  <Select onValueChange={handleSprintChange} value={field.value || ''} disabled={!watchProjectId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign to a sprint" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Backlog</SelectItem>
                      {projectSprints.map(sprint => (
                        <SelectItem key={sprint.id} value={sprint.id}>{sprint.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchType === 'Task' && (
                <FormField
                  control={form.control}
                  name="storyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Story (Optional)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} value={field.value || ''} disabled={!watchProjectId}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Link to a parent story" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {stories.map(story => (
                            <SelectItem key={story.id} value={story.id}>{story.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Implement user authentication" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add details about the task..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignedUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!watchProjectId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectMembers.map(user => (
                          <SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {columns.map(col => (
                          <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
             
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITIES.map(priority => (
                          <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="effort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effort Estimate</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select effort" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EFFORT_LEVELS.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 gap-4 items-end">
                <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Deadline</FormLabel>
                        <FormControl>
                <DatePicker 
                   value={field.value} 
                   onSelect={(date) => {
                     field.onChange(date);
                     form.setValue('deadline', date, { 
                       shouldValidate: true,
                       shouldDirty: true,
                       shouldTouch: true
                     });
                   }}
                />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
