
'use client';

import { DashboardAnalytics } from '@/components/dashboard/dashboard-analytics';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const tasks = useStore((state) => state.tasks);
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hi, {user?.username}!</h1>
        <p className="text-muted-foreground">Here's a quick overview of your projects.</p>
      </div>
      <DashboardAnalytics />
      <div>
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <RecentActivity tasks={tasks.slice(0,5)} />
      </div>
    </div>
  );
}
