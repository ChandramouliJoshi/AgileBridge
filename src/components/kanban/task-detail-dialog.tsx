

'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Task, Comment } from '@/lib/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isPast, formatDistanceToNow, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Users, Bug, CalendarClock, Trash2, Send, ArrowUp, ArrowDown, Layers, Flame, Link2, Clock, Pencil, GripVertical } from 'lucide-react';
import { CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { useSprintStore } from '@/lib/sprint-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PRIORITIES, TASK_TYPES } from '@/lib/data';
import { DatePicker } from '../ui/date-picker';
import { useProjectStore } from '@/lib/project-store';


const taskDetailSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.string(),
  priority: z.string(),
  type: z.string(),
  assignedUserId: z.string().optional(),
  deadline: z.date().optional(),
  sprintId: z.string().optional(),
  storyId: z.string().optional(),
  dependsOn: z.array(z.string()).optional(),
  estimatedHours: z.coerce.number(),
  timeSpent: z.coerce.number(),
});

type TaskDetailFormValues = z.infer<typeof taskDetailSchema>;


type TaskDetailDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  task: Task;
};

const TaskTypeIcon = ({ type, className }: { type: 'Bug' | 'Task' | 'Story', className?: string }) => {
    const baseClassName = "h-5 w-5";
    switch (type) {
        case 'Bug':
            return <Bug className={cn(baseClassName, "text-red-500", className)} />;
        case 'Task':
            return <CircleDot className={cn(baseClassName, "text-blue-400", className)} />;
        case 'Story':
            return <Layers className={cn(baseClassName, "text-green-500", className)} />;
    }
}

function CommentItem({ comment }: { comment: Comment }) {
    const { allUsers } = useAuth();
    const user = allUsers.find(u => u.id === comment.userId);

    if (!user) return null;

    return (
        <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
                <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                </div>
                <p className="text-sm text-muted-foreground">{comment.message}</p>
            </div>
        </div>
    )
}

export function TaskDetailDialog({ isOpen, onOpenChange, task: initialTask }: TaskDetailDialogProps) {
  const { user, allUsers } = useAuth();
  const { deleteTask, columns, addComment, tasks, updateTask, assignTaskToSprint } = useStore();
  const { sprints } = useSprintStore();
  const { projects } = useProjectStore();

  const isManager = user?.userType === 'Manager' || user?.userType === 'Admin';
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [commentSortOrder, setCommentSortOrder] = useState<'asc' | 'desc'>('desc');

  // This ensures we always have the latest task data from the store
  const task = useStore(state => state.tasks.find(t => t.id === initialTask.id));
  
  const form = useForm<TaskDetailFormValues>({
      resolver: zodResolver(taskDetailSchema),
      defaultValues: {},
  });

  useEffect(() => {
    if (task) {
        form.reset({
            ...task,
            deadline: task.deadline ? new Date(task.deadline) : undefined,
        });
    }
  }, [task, form]);
  
  const project = projects.find(p => p.id === task?.projectId);
  const projectSprints = sprints.filter(s => s.projectId === task?.projectId);
  const projectStories = tasks.filter(t => t.projectId === task?.projectId && t.type === 'Story');
  const availableDependencies = tasks.filter(t => t.projectId === task?.projectId && t.id !== task?.id && t.type !== 'Story');
  const projectMembers = allUsers.filter(u => project?.members.some(m => m.id === u.id));
  
  const sortedComments = useMemo(() => {
    if (!task || !task.comments) return [];
    return [...task.comments].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return commentSortOrder === 'asc' ? dateA - dateB : dateB - a;
    });
  }, [task?.comments, commentSortOrder]);
  
  const handleSave = (data: TaskDetailFormValues) => {
    if (!task) return;
    
    const sprintId = data.sprintId === 'none' ? undefined : data.sprintId;
    assignTaskToSprint(task.id, sprintId);
    
    updateTask(task.id, {
        ...data,
        deadline: data.deadline?.toISOString(),
        sprintId: sprintId,
    });
    toast({
        title: 'Task Updated',
        description: `Changes to "${task.title}" have been saved.`
    });
    onOpenChange(false);
  };
  
   const handleDelete = () => {
    if (!task) return;
    deleteTask(task.id);
    toast({
      variant: 'destructive',
      title: 'Task Deleted',
      description: `"${task.title}" has been deleted.`,
    });
    onOpenChange(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !user || !task) return;
    addComment(task.id, { userId: user.id, message: newComment.trim() });
    setNewComment('');
  }
  
  if (!task) {
    return null;
  }
  
  const progressPercentage = task.estimatedHours > 0 ? (task.timeSpent / task.estimatedHours) * 100 : 0;
  const assignedUser = allUsers.find(u => u.id === task.assignedUserId);
  const statusLabel = columns.find(c => c.id === task.status)?.title || task.status;
  const isOverdue = task.deadline && isPast(new Date(task.deadline));


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="flex flex-col h-full">
                <DialogHeader className="p-6 pb-4 border-b">
                  <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                          <TaskTypeIcon type={task.type} className="h-6 w-6" />
                      </div>
                      <div>
                          <DialogTitle className="text-xl">
                            {isManager ? (
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input {...field} className="text-xl font-semibold p-0 border-none focus-visible:ring-0" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                task.title
                            )}
                          </DialogTitle>
                          <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{task.id}</Badge>
                              <Badge variant="secondary">{statusLabel}</Badge>
                          </div>
                      </div>
                  </div>
                </DialogHeader>
                
                <div className="grid grid-cols-10 flex-1 overflow-hidden">
                    <div className="col-span-7 border-r p-6 overflow-y-auto space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                            {isManager ? (
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea {...field} className="text-sm" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <p className="text-sm text-foreground">{task.description}</p>
                            )}
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                             <FormField
                                control={form.control}
                                name="assignedUserId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Users className="h-4 w-4" /> Assigned To</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!isManager}>
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
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><GripVertical className="h-4 w-4" /> Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!isManager}>
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
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><ArrowUp className="h-4 w-4" /> Priority</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!isManager}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {PRIORITIES.map(p => (
                                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Pencil className="h-4 w-4" /> Task Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!isManager}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {TASK_TYPES.map(t => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="deadline"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><CalendarClock className="h-4 w-4" /> Deadline</FormLabel>
                                        <FormControl>
                                            <DatePicker value={field.value} onSelect={field.onChange} disabled={!isManager} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            
                            {task.type !== 'Story' && (
                                <>
                                 <FormField
                                    control={form.control}
                                    name="sprintId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Flame className="h-4 w-4" /> Sprint</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value ?? 'none'} disabled={!isManager}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Assign to sprint" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">Backlog</SelectItem>
                                                    {projectSprints.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="storyId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Layers className="h-4 w-4" /> Parent Story</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!isManager}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Link to story" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {projectStories.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="dependsOn"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Link2 className="h-4 w-4" /> Dependencies</FormLabel>
                                            <Select onValueChange={(value) => field.onChange(value === 'none' ? [] : [value])} value={field.value?.[0] || 'none'} disabled={!isManager}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Blocks which task?" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {availableDependencies.map(dep => <SelectItem key={dep.id} value={dep.id}>{dep.title}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                </>
                             )}
                        </div>

                         <div className="grid grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="timeSpent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Clock className="h-4 w-4" /> Time Spent (hours)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} readOnly={!isManager}/>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="estimatedHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Clock className="h-4 w-4" /> Time Estimated (hours)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} readOnly={!isManager}/>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="col-span-2">
                                <Progress value={progressPercentage} className="h-2" />
                            </div>
                         </div>
                    </div>
                    
                    <div className="col-span-3 p-6 flex flex-col bg-muted/50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold">Comments</h3>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCommentSortOrder('desc')}>
                                    <ArrowDown className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCommentSortOrder('asc')}>
                                    <ArrowUp className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <ScrollArea className="flex-1 -mx-6 px-6">
                            <div className="space-y-4">
                                {sortedComments.map(comment => (
                                    <CommentItem key={comment.id} comment={comment} />
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="mt-4 flex gap-2">
                            <Textarea 
                                placeholder="Add a comment..." 
                                className="flex-1"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows={2}
                            />
                            <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

            <DialogFooter className="p-6 bg-muted/30 border-t flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>Created on {format(parseISO(task.createdAt), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                    {isManager && (
                    <>
                        <Button variant="destructive" type="button" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                        <Button type="submit">Save Changes</Button>
                    </>
                    )}
                </div>
            </DialogFooter>
        </form>
      </Form>
      </DialogContent>
    </Dialog>
  );
}
