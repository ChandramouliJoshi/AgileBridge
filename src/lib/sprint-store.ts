
import { create } from 'zustand';
import type { Sprint } from './types';
import { SPRINTS as initialSprints } from './data';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useStore } from './store'; // Import the task store

interface SprintStore {
  sprints: Sprint[];
  addSprint: (sprint: Omit<Sprint, 'id' | 'status'>) => void;
  startSprint: (sprintId: string, projectId: string) => void;
  completeSprint: (sprintId: string, projectId: string) => void;
  setSprints: (sprints: Sprint[]) => void;
}

export const useSprintStore = create<SprintStore>()(
  persist(
    (set, get) => ({
      sprints: initialSprints,
      setSprints: (sprints) => set({ sprints }),
      addSprint: (sprint) =>
        set((state) => {
           const maxId = state.sprints.reduce((max, s) => {
              const num = parseInt(s.id.split('-')[1], 10);
              return num > max ? num : max;
          }, 0);
          const newId = `SPRINT-${String(maxId + 1).padStart(3, '0')}`;

          const newSprint: Sprint = {
            ...sprint,
            id: newId,
            status: 'upcoming',
          };
          return { sprints: [...state.sprints, newSprint] };
        }),
      startSprint: (sprintId, projectId) => {
        set((state) => {
          // Deactivate any other active sprint for the same project
          const updatedSprints = state.sprints.map((s) => {
            if (s.projectId === projectId && s.status === 'active') {
              return { ...s, status: 'upcoming' as 'upcoming' };
            }
            if (s.id === sprintId) {
              return { ...s, status: 'active' as 'active' };
            }
            return s;
          });
          return { sprints: updatedSprints };
        });
      },
      completeSprint: (sprintId, projectId) => {
        const { tasks, setTasks } = useStore.getState();
        const sprintToComplete = get().sprints.find(s => s.id === sprintId);

        if (sprintToComplete) {
            const sprintTasks = tasks.filter((task) => task.sprintId === sprintId);
            const doneTasks = sprintTasks.filter(t => t.status === 'done');
            const completionPercentage = sprintTasks.length > 0 ? (doneTasks.length / sprintTasks.length) * 100 : 0;

            // Move unfinished tasks back to the backlog
            const updatedTasks = tasks.map(task => {
                if (task.sprintId === sprintId && task.status !== 'done') {
                    return { ...task, sprintId: undefined };
                }
                return task;
            });
            setTasks(updatedTasks);
            
            set((state) => ({
              sprints: state.sprints.map((s) =>
                s.id === sprintId ? { 
                    ...s, 
                    status: 'completed' as 'completed',
                    completedIssues: doneTasks.length,
                    totalIssues: sprintTasks.length,
                    completionPercentage: completionPercentage,
                } : s
              ),
            }));
        }
      },
    }),
    {
      name: 'sprint-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
