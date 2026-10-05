
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Project } from './types';
import { PROJECTS as initialProjects } from './data';

interface ProjectStore {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (projectData: Omit<Project, 'id' | 'status' | 'completion' | 'createdAt' | 'issues' | 'sprints'>) => void;
  updateProject: (projectId: string, updatedData: Partial<Project>) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: initialProjects,
      setProjects: (projects) => set({ projects }),
      addProject: (projectData) =>
        set((state) => {
          const maxId = state.projects.reduce((max, p) => {
              const num = parseInt(p.id.split('-')[1], 10);
              return num > max ? num : max;
          }, 0);
          const newId = `PROJ-${String(maxId + 1).padStart(3, '0')}`;
          
          const newProject: Project = {
            ...projectData,
            id: newId,
            status: 'active',
            completion: 0,
            createdAt: new Date().toISOString(),
            issues: 0,
            sprints: [],
          };
          return { projects: [...state.projects, newProject] };
        }),
      updateProject: (projectId, updatedData) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, ...updatedData } : p
          ),
        })),
    }),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
