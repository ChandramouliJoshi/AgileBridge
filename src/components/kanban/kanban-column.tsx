

import { Droppable, Draggable } from '@hello-pangea/dnd';
import type { Task, TaskStatus, KanbanColumnData } from '@/lib/types';
import { KanbanCard } from './kanban-card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useStore } from '@/lib/store';
import { useMemo } from 'react';

type KanbanColumnProps = {
  column: KanbanColumnData;
  tasks: Task[];
  highlightedStatus?: TaskStatus | 'all' | null;
};

const titleColors: Record<string, string> = {
    'border-blue-500': 'text-blue-500',
    'border-yellow-500': 'text-yellow-500',
    'border-purple-500': 'text-purple-500',
    'border-green-500': 'text-green-500',
    'border-gray-500': 'text-gray-500',
    'border-red-500': 'text-red-500',
    'border-cyan-500': 'text-cyan-500',
    'border-orange-500': 'text-orange-500',
};


export function KanbanColumn({ column, tasks, highlightedStatus }: KanbanColumnProps) {
  const { user } = useAuth();
  const allTasks = useStore(state => state.tasks);
  
  const topLevelTasksInColumn = useMemo(() => {
    const taskIdsInColumn = new Set(tasks.map(t => t.id));

    return tasks.filter(t => {
      // Stories are always top-level in any column they appear in.
      if (t.type === 'Story') {
        return true;
      }
      
      // If a task has no parent story, it's a top-level item.
      if (!t.storyId) {
        return true;
      }
      
      // If a task has a parent story, it's only top-level if its parent
      // is NOT also in the current set of tasks for this column.
      const parentStory = allTasks.find(story => story.id === t.storyId);
      if (!parentStory) {
        return true; // Orphaned task, treat as top-level.
      }

      return !taskIdsInColumn.has(parentStory.id);
    });
  }, [tasks, allTasks]);


  return (
    <div className={cn(
      "flex flex-col rounded-xl border", 
      column.color,
      (highlightedStatus === 'all' || highlightedStatus === column.id) && 'animate-flash'
      )}>
      <div className={cn("p-3 flex items-center justify-between")}>
        <h2 className={cn("text-lg font-semibold", titleColors[column.color] || 'text-foreground')}>
          {column.title}
        </h2>
        <span className={cn("text-sm font-normal h-6 w-6 flex items-center justify-center rounded-full bg-background")}>
            {tasks.length}
          </span>
      </div>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cn(`p-3 space-y-4 rounded-b-lg min-h-[500px] transition-colors`, 
              snapshot.isDraggingOver ? 'bg-black/10' : 'bg-transparent'
            )}
          >
            {topLevelTasksInColumn.map((task, index) => {
              const blockingTasks = (task.dependsOn || [])
                .map(depId => allTasks.find(t => t.id === depId))
                .filter(t => t && t.status !== 'done');
              const isBlocked = blockingTasks.length > 0;
              
              const isDraggable = (user?.userType === 'Admin' || user?.userType === 'Manager' || user?.id === task.assignedUserId) && !isBlocked;
              
              return (
              <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={!isDraggable}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <KanbanCard 
                      task={task} 
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            )})}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
