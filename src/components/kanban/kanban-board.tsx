
'use client';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';
import type { Task, TaskStatus, KanbanColumnData } from '@/lib/types';
import { KanbanColumn } from './kanban-column';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/lib/store';
import { ReassignTaskDialog } from './reassign-task-dialog';

type KanbanBoardProps = {
  tasks: Task[];
  highlightedStatus?: TaskStatus | 'all' | null;
};

export function KanbanBoard({ tasks, highlightedStatus }: KanbanBoardProps) {
  const { toast } = useToast();
  const [reassignTask, setReassignTask] = useState<{task: Task, newStatus: TaskStatus} | null>(null);
  const { updateTask, columns } = useStore();

  const onDragEnd: OnDragEndResponder = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId as TaskStatus;

    if (sourceColId === destColId) return;

    const draggedTask = tasks.find(t => t.id === draggableId);
    if (!draggedTask) return;

    if (destColId === 'done') {
      // If moving to 'done', update status directly without popup
      updateTask(draggedTask.id, { status: 'done' });
      const destColumn = columns.find(c => c.id === 'done');
      toast({
          title: `Task "${draggedTask.title}" moved`,
          description: `Status updated to ${destColumn?.title || 'Done'}.`,
      });
    } else {
      // For any other status change, show the re-assign dialog
      setReassignTask({ task: draggedTask, newStatus: destColId });
    }
  };
  
  const handleReassign = (taskId: string, newStatus: TaskStatus, newUserId: string | undefined, timeSpent?: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        updateTask(taskId, { status: newStatus, assignedUserId: newUserId, timeSpent: timeSpent });
        const destColumn = columns.find(c => c.id === newStatus);
        toast({
            title: `Task "${task.title}" moved`,
            description: `Status updated to ${destColumn?.title || newStatus}.`,
        });
    }
    setReassignTask(null);
  };

  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    columns.forEach(col => {
      grouped[col.id] = [];
    });
    tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    return grouped;
  }, [tasks, columns]);


  return (
    <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map(column => (
                <KanbanColumn 
                  key={column.id} 
                  column={column} 
                  tasks={tasksByColumn[column.id] || []} 
                  highlightedStatus={highlightedStatus} 
                />
            ))}
        </div>
        <ReassignTaskDialog
            isOpen={!!reassignTask}
            onClose={() => setReassignTask(null)}
            onConfirm={handleReassign}
            task={reassignTask?.task}
            newStatus={reassignTask?.newStatus}
        />
    </DragDropContext>
  );
}
