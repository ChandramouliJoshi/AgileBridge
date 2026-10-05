
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
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import { useSprintStore } from '@/lib/sprint-store';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from '../ui/calendar';
import { format, isPast, add } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { Checkbox } from '../ui/checkbox';
import { useStore } from '@/lib/store';

const sprintSchema = z.object({
  name: z.string().min(1, 'Sprint name is required.'),
  goal: z.string().optional(),
  dates: z.object({
      from: z.date({ required_error: 'Start date is required.'}),
      to: z.date({ required_error: 'End date is required.'}),
  }),
  isFutureSprint: z.boolean().optional(),
});

type SprintFormValues = z.infer<typeof sprintSchema>;

export function NewSprintDialog({ children, projectId }: { children: React.ReactNode, projectId: string }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { addSprint } = useSprintStore();
  const { tasks, assignTaskToSprint } = useStore();

  const form = useForm<SprintFormValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: '',
      goal: '',
      isFutureSprint: false,
    },
  });
  
  const handleDateSelect = (range: DateRange | undefined, onChange: (range: DateRange) => void) => {
    if (range) {
        if (range.from && !range.to) {
            // If only a start date is selected, auto-populate end date 2 weeks later
            range.to = add(range.from, { weeks: 2 });
        }
        onChange(range as DateRange);

        if (range.from && range.to) {
            setIsCalendarOpen(false); // Close calendar once range is selected
        }
    }
  }


  const onSubmit = (data: SprintFormValues) => {
    addSprint({
        projectId: projectId,
        name: data.name,
        goal: data.goal,
        startDate: data.dates.from.toISOString(),
        endDate: data.dates.to.toISOString(),
    });

    if (data.isFutureSprint) {
        tasks.forEach(task => {
            if (task.deadline && isPast(new Date(task.deadline))) {
                assignTaskToSprint(task.id, undefined); // Move to backlog
            }
        });
        toast({
            title: 'Future Sprint Created!',
            description: `"${data.name}" has been created and overdue tasks moved to backlog.`,
        });
    } else {
        toast({
          title: 'Sprint Created!',
          description: `"${data.name}" has been added to the project.`,
        });
    }
    
    form.reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            Create New Sprint
          </DialogTitle>
          <DialogDescription>Set the details for your new sprint.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sprint Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Sprint 3 - Performance Tuning" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dates"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Sprint Dates</FormLabel>
                   <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value?.from && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value?.from ? (
                            field.value.to ? (
                                <>
                                {format(field.value.from, "LLL dd, y")} -{" "}
                                {format(field.value.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(field.value.from, "LLL dd, y")
                            )
                            ) : (
                            <span>Pick a date range</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={field.value as DateRange}
                            onSelect={(range) => handleDateSelect(range, field.onChange)}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sprint Goal (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What is the main goal of this sprint?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="isFutureSprint"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Mark as Future Sprint
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      If selected, any overdue tasks or stories will be moved to the backlog.
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit">Create Sprint</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
