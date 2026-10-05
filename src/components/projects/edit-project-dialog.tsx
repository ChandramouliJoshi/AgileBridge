
'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Users, Palette, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useProjectStore } from '@/lib/project-store';
import type { Project } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  key: z.string().min(2, 'Key must be 2-4 chars').max(4, 'Key must be 2-4 chars').regex(/^[A-Z]*$/, 'Key must be uppercase letters'),
  color: z.string(),
  description: z.string().optional(),
  members: z.array(z.object({
    id: z.string().min(1, 'Please select a user'),
  })).min(1, 'At least one team member is required'),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const colorThemes = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function EditProjectDialog({ project, children }: { project: Project; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { updateProject } = useProjectStore();
  const { allUsers } = useAuth();

  const availableUsers = allUsers.filter(u => u.status === 'active' && u.userType !== 'Admin');

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name,
      key: project.key,
      color: project.color,
      description: project.description,
      members: project.members.map(m => ({ id: m.id })),
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members"
  });

  const onSubmit = (data: ProjectFormValues) => {
    updateProject(project.id, data);
    toast({
      title: 'Project Updated!',
      description: `"${data.name}" has been successfully updated.`,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the details for your project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                 <div>
                    <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Project Key</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>
            
             <div>
                <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-2"><Palette className="h-4 w-4" /> Color Theme</FormLabel>
                        <FormControl>
                             <div className="flex gap-2">
                                {colorThemes.map(color => (
                                    <Button
                                        key={color}
                                        type="button"
                                        className={`h-8 w-8 rounded-full ${field.value === color ? 'ring-2 ring-offset-2 ring-ring' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => field.onChange(color)}
                                    />
                                ))}
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
                <FormLabel className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" /> Team Members
                </FormLabel>
                <div className="space-y-3">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-center">
                         <FormField
                            control={form.control}
                            name={`members.${index}.id`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a user" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {availableUsers.map(user => (
                                            <SelectItem key={user.id} value={user.id}>{user.username} ({user.role})</SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => append({ id: '' })}>
                    <Plus className="mr-2 h-4 w-4" /> Add Member
                </Button>
                </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
