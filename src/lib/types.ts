
export type UserType = 'Admin' | 'Manager' | 'User';
export type Role = 'Frontend' | 'Backend' | 'Developer' | 'PM' | 'Admin' | 'None';
export type SpecializedRole = 'Frontend' | 'Backend' | 'Developer' | 'PM' | 'Admin';


export type User = {
  id: string;
  username: string;
  email: string;
  password?: string;
  userType: UserType;
  role: Role;
  status: 'pending' | 'active';
  designation?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
};

export type KanbanColumnData = {
  id: string;
  title: string;
  color: string;
};


export type TaskStatus = string;
export type Priority = 'Low' | 'Medium' | 'High';
export type Effort = 'Low' | 'Medium' | 'High';
export type TaskType = 'Bug' | 'Task' | 'Story';

export type Comment = {
    id: string;
    userId: string;
    message: string;
    createdAt: string;
}

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedUserId?: string;
  estimatedHours: number;
  effort?: Effort;
  timeSpent: number;
  createdAt: string;
  updatedAt: string;
  priority: Priority;
  type: TaskType;
  deadline?: string;
  storyId?: string;
  sprintId?: string;
  comments?: Comment[];
  dependsOn?: string[];
};

export type ProjectMember = {
    id: string;
}

export type Sprint = {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  goal?: string;
  completedIssues?: number;
  totalIssues?: number;
  completionPercentage?: number;
}

export type Project = {
    id: string;
    name: string;
    key: string;
    description: string;
    color: string;
    status: 'active' | 'inactive';
    completion: number;
    createdAt: string;
    issues: number;
    members: ProjectMember[]; // array of user ids
    sprints: Sprint[];
};

export type Notification = {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    taskId?: string;
};
