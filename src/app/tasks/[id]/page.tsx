

import { TASKS, USERS } from "@/lib/data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import { format, parseISO } from 'date-fns';

export default function TaskDetailPage({ params: { id } }: { params: { id: string } }) {
  const task = TASKS.find(t => t.id === id);

  if (!task) {
    notFound();
  }
  
  const assignedUser = USERS.find(u => u.id === task.assignedUserId);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
        <Button asChild variant="outline" size="icon" className="h-8 w-8">
            <Link href="/board" aria-label="Back to Board">
                <ArrowLeft className="h-4 w-4" />
            </Link>
        </Button>
        <h1 className="flex-1 truncate text-xl font-semibold tracking-tight">
          {task.title}
        </h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">{task.title}</CardTitle>
                <CardDescription>
                    Last updated on {format(parseISO(task.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert">
                    <p>{task.description}</p>
                </div>
                <Separator className="my-6" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <h3 className="font-medium text-foreground">Status</h3>
                        <p>{task.status}</p>
                    </div>
                     <div>
                        <h3 className="font-medium text-foreground">Created At</h3>
                        <p>{format(parseISO(task.createdAt), "MMMM d, yyyy")}</p>
                    </div>
                     <div>
                        <h3 className="font-medium text-foreground">Assigned User</h3>
                        <p>{assignedUser?.username || 'Unassigned'}</p>
                    </div>
                     <div>
                        <h3 className="font-medium text-foreground">Time Estimate</h3>
                        <p>{task.estimatedHours} hours</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
