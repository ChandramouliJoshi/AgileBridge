
'use client';
import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import type { Project, Task } from '@/lib/types';
import { KanbanCard } from '../kanban/kanban-card';
import { ScrollArea } from '../ui/scroll-area';
import { ClipboardList, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';

interface BacklogProps {
  project: Project;
  sprintFilter: string;
}

export function Backlog({ project, sprintFilter }: BacklogProps) {
  const { tasks } = useStore();

  const filteredTasks = useMemo(() => {
    if (sprintFilter === 'backlog') {
      return tasks.filter(t => t.projectId === project.id && !t.sprintId);
    }
    return tasks.filter(t => t.sprintId === sprintFilter);
  }, [tasks, project.id, sprintFilter]);

  return (
    <Card className="rounded-xl border border-dashed">
      <div className="p-4 flex items-center gap-2 border-b">
        <ClipboardList className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Issues</h2>
        <span className="text-sm text-muted-foreground ml-auto">{filteredTasks.length} issues found</span>
      </div>
      <ScrollArea className='h-[600px] p-4 rounded-b-xl'>
        {filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <KanbanCard key={task.id} task={task} isDragging={false} />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Card className="w-1/2 bg-muted/50 border-dashed">
                <CardContent className="text-center p-6">
                    <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <h3 className="font-semibold">No Issues Found</h3>
                    <p className="text-sm text-muted-foreground">There are no issues matching the current filter.</p>
                </CardContent>
            </Card>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
